from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'media-hub-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Health check route at root
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "MediaHub API",
        "version": "1.0.0",
        "message": "Backend is running"
    }

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============================================================================
# MODELS
# ============================================================================

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str  # admin, media_head, team_member
    specialization: Optional[str] = None  # photo, video, editing, other

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime

class UserResponse(UserBase):
    id: str
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

class InstitutionBase(BaseModel):
    name: str
    short_code: Optional[str] = None
    type: Optional[str] = None  # college, school, university, hospital, other
    is_active: bool = True

class InstitutionCreate(InstitutionBase):
    pass

class Institution(InstitutionBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime

class EventBase(BaseModel):
    title: str
    institution_id: str
    department: Optional[str] = None
    event_date_start: datetime
    event_date_end: Optional[datetime] = None
    venue: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None  # cultural, seminar, workshop, sports, inauguration, convocation, press_meet, other
    expected_audience: Optional[int] = None
    chief_guests: Optional[str] = None
    requirements: List[str] = []  # photos, video_coverage, highlight_video, instagram_reel, live_stream, drone
    comments: Optional[str] = None
    priority: str = "normal"  # normal, high, vip
    deliverable_due_date: Optional[datetime] = None
    status: str = "event_created"  # event_created, event_scheduled, shoot_completed, delivery_in_progress, closed

class EventCreate(EventBase):
    pass

class Event(EventBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_by: str
    created_at: datetime

class EventResponse(Event):
    institution_name: Optional[str] = None

class TaskBase(BaseModel):
    event_id: str
    type: str  # photo, video, editing, other
    assigned_to: str
    due_date: Optional[datetime] = None
    status: str = "assigned"  # assigned, in_progress, completed
    deliverable_link: Optional[str] = None
    comments: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime

class TaskResponse(Task):
    event_title: Optional[str] = None
    event_date: Optional[datetime] = None
    institution_name: Optional[str] = None
    assigned_to_name: Optional[str] = None

class EquipmentBase(BaseModel):
    name: str
    code: Optional[str] = None
    status: str = "available"  # available, in_use, maintenance
    notes: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    pass

class Equipment(EquipmentBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime

class EquipmentAllocationBase(BaseModel):
    event_id: str
    equipment_id: str
    notes: Optional[str] = None

class EquipmentAllocationCreate(EquipmentAllocationBase):
    pass

class EquipmentAllocation(EquipmentAllocationBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    allocated_by: str
    created_at: datetime

class EquipmentAllocationResponse(EquipmentAllocation):
    equipment_name: Optional[str] = None
    event_title: Optional[str] = None

class DeliverablePublic(BaseModel):
    id: str
    event_title: str
    institution_name: str
    event_date: datetime
    task_type: str
    deliverable_link: str
    priority: str
    completed_at: datetime

class NotificationBase(BaseModel):
    user_id: str
    title: str
    message: str
    type: str  # task_assigned, task_completed, event_status_changed, event_created
    related_id: Optional[str] = None  # event_id or task_id
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: datetime

class DashboardStats(BaseModel):
    upcoming_events: int
    pending_deliveries: int
    closed_this_month: int
    overdue_tasks: int
    total_events: int
    total_tasks: int

# ============================================================================
# AUTH HELPERS
# ============================================================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"sub": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def require_role(required_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in required_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============================================================================
# AUTH ROUTES
# ============================================================================

@api_router.post("/auth/register", response_model=UserResponse)
async def register(input: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_pw = hash_password(input.password)
    
    # Create user
    user_dict = input.model_dump(exclude={"password"})
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    user_dict["password_hash"] = hashed_pw
    
    await db.users.insert_one(user_dict)
    
    return UserResponse(**{k: v for k, v in user_dict.items() if k != "password_hash"})

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(input: LoginRequest):
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token(user["id"], user["email"], user["role"])
    
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})
    return LoginResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ============================================================================
# USER ROUTES
# ============================================================================

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(require_role(["admin"]))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.post("/users", response_model=UserResponse)
async def create_user(input: UserCreate, current_user: dict = Depends(require_role(["admin"]))):
    # Check if email exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(input.password)
    user_dict = input.model_dump(exclude={"password"})
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    user_dict["password_hash"] = hashed_pw
    
    await db.users.insert_one(user_dict)
    return UserResponse(**{k: v for k, v in user_dict.items() if k != "password_hash"})

@api_router.get("/team-members", response_model=List[UserResponse])
async def get_team_members(current_user: dict = Depends(require_role(["admin", "media_head"]))):
    """Get all team members - accessible by admin and media_head for task assignment"""
    users = await db.users.find({"role": "team_member"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(require_role(["admin"]))):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user.get('created_at'), str): 
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return UserResponse(**user)

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, input: UserBase, current_user: dict = Depends(require_role(["admin"]))):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = input.model_dump(exclude_unset=True)
    await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    return UserResponse(**updated_user)

# ============================================================================
# INSTITUTION ROUTES
# ============================================================================

@api_router.get("/institutions", response_model=List[Institution])
async def get_institutions():
    """Public read access to institutions - no auth required for public deliveries page"""
    institutions = await db.institutions.find({}, {"_id": 0}).to_list(1000)
    for inst in institutions:
        if isinstance(inst.get('created_at'), str):
            inst['created_at'] = datetime.fromisoformat(inst['created_at'])
    return institutions

@api_router.post("/institutions", response_model=Institution)
async def create_institution(input: InstitutionCreate, current_user: dict = Depends(require_role(["admin"]))):
    inst_dict = input.model_dump()
    inst_dict["id"] = str(uuid.uuid4())
    inst_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.institutions.insert_one(inst_dict)
    inst_dict['created_at'] = datetime.fromisoformat(inst_dict['created_at'])
    return Institution(**inst_dict)

@api_router.get("/institutions/{institution_id}", response_model=Institution)
async def get_institution(institution_id: str, current_user: dict = Depends(get_current_user)):
    inst = await db.institutions.find_one({"id": institution_id}, {"_id": 0})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    if isinstance(inst.get('created_at'), str):
        inst['created_at'] = datetime.fromisoformat(inst['created_at'])
    return Institution(**inst)

@api_router.put("/institutions/{institution_id}", response_model=Institution)
async def update_institution(institution_id: str, input: InstitutionBase, current_user: dict = Depends(require_role(["admin"]))):
    inst = await db.institutions.find_one({"id": institution_id})
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    update_dict = input.model_dump()
    await db.institutions.update_one({"id": institution_id}, {"$set": update_dict})
    
    updated = await db.institutions.find_one({"id": institution_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Institution(**updated)

# ============================================================================
# EVENT ROUTES
# ============================================================================

@api_router.get("/events", response_model=List[EventResponse])
async def get_events(
    status: Optional[str] = None,
    institution_id: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    if institution_id:
        query["institution_id"] = institution_id
    if priority:
        query["priority"] = priority
    
    events = await db.events.find(query, {"_id": 0}).sort("event_date_start", -1).to_list(1000)
    
    # Enrich with institution names
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if isinstance(event.get('event_date_start'), str):
            event['event_date_start'] = datetime.fromisoformat(event['event_date_start'])
        if event.get('event_date_end') and isinstance(event['event_date_end'], str):
            event['event_date_end'] = datetime.fromisoformat(event['event_date_end'])
        if event.get('deliverable_due_date') and isinstance(event['deliverable_due_date'], str):
            event['deliverable_due_date'] = datetime.fromisoformat(event['deliverable_due_date'])
        
        inst = await db.institutions.find_one({"id": event["institution_id"]}, {"_id": 0})
        event["institution_name"] = inst["name"] if inst else None
    
    return events

@api_router.post("/events", response_model=Event)
async def create_event(input: EventCreate, current_user: dict = Depends(require_role(["admin", "media_head"]))):
    event_dict = input.model_dump()
    event_dict["id"] = str(uuid.uuid4())
    event_dict["created_by"] = current_user["id"]
    event_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    # Convert datetime fields to ISO strings
    if isinstance(event_dict.get('event_date_start'), datetime):
        event_dict['event_date_start'] = event_dict['event_date_start'].isoformat()
    if event_dict.get('event_date_end') and isinstance(event_dict['event_date_end'], datetime):
        event_dict['event_date_end'] = event_dict['event_date_end'].isoformat()
    if event_dict.get('deliverable_due_date') and isinstance(event_dict['deliverable_due_date'], datetime):
        event_dict['deliverable_due_date'] = event_dict['deliverable_due_date'].isoformat()
    
    await db.events.insert_one(event_dict)
    
    # Convert back to datetime for response
    event_dict['created_at'] = datetime.fromisoformat(event_dict['created_at'])
    event_dict['event_date_start'] = datetime.fromisoformat(event_dict['event_date_start'])
    if event_dict.get('event_date_end'):
        event_dict['event_date_end'] = datetime.fromisoformat(event_dict['event_date_end'])
    if event_dict.get('deliverable_due_date'):
        event_dict['deliverable_due_date'] = datetime.fromisoformat(event_dict['deliverable_due_date'])
    
    return Event(**event_dict)

@api_router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Convert ISO strings to datetime
    if isinstance(event.get('created_at'), str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    if isinstance(event.get('event_date_start'), str):
        event['event_date_start'] = datetime.fromisoformat(event['event_date_start'])
    if event.get('event_date_end') and isinstance(event['event_date_end'], str):
        event['event_date_end'] = datetime.fromisoformat(event['event_date_end'])
    if event.get('deliverable_due_date') and isinstance(event['deliverable_due_date'], str):
        event['deliverable_due_date'] = datetime.fromisoformat(event['deliverable_due_date'])
    
    # Add institution name
    inst = await db.institutions.find_one({"id": event["institution_id"]}, {"_id": 0})
    event["institution_name"] = inst["name"] if inst else None
    
    return EventResponse(**event)

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, input: EventBase, current_user: dict = Depends(require_role(["admin", "media_head"]))):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_dict = input.model_dump()
    
    # Convert datetime fields to ISO strings
    if isinstance(update_dict.get('event_date_start'), datetime):
        update_dict['event_date_start'] = update_dict['event_date_start'].isoformat()
    if update_dict.get('event_date_end') and isinstance(update_dict['event_date_end'], datetime):
        update_dict['event_date_end'] = update_dict['event_date_end'].isoformat()
    if update_dict.get('deliverable_due_date') and isinstance(update_dict['deliverable_due_date'], datetime):
        update_dict['deliverable_due_date'] = update_dict['deliverable_due_date'].isoformat()
    
    await db.events.update_one({"id": event_id}, {"$set": update_dict})
    
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    
    # Convert back to datetime
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('event_date_start'), str):
        updated['event_date_start'] = datetime.fromisoformat(updated['event_date_start'])
    if updated.get('event_date_end') and isinstance(updated['event_date_end'], str):
        updated['event_date_end'] = datetime.fromisoformat(updated['event_date_end'])
    if updated.get('deliverable_due_date') and isinstance(updated['deliverable_due_date'], str):
        updated['deliverable_due_date'] = datetime.fromisoformat(updated['deliverable_due_date'])
    
    return Event(**updated)

# ============================================================================
# TASK ROUTES
# ============================================================================

@api_router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    event_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    if event_id:
        query["event_id"] = event_id
    
    # Team members can only see their own tasks
    if current_user["role"] == "team_member":
        query["assigned_to"] = current_user["id"]
    elif assigned_to:
        query["assigned_to"] = assigned_to
    
    tasks = await db.tasks.find(query, {"_id": 0}).sort("due_date", 1).to_list(1000)
    
    # Enrich with event and user details
    for task in tasks:
        if isinstance(task.get('created_at'), str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if task.get('due_date') and isinstance(task['due_date'], str):
            task['due_date'] = datetime.fromisoformat(task['due_date'])
        
        event = await db.events.find_one({"id": task["event_id"]}, {"_id": 0})
        if event:
            task["event_title"] = event.get("title")
            if isinstance(event.get('event_date_start'), str):
                task["event_date"] = datetime.fromisoformat(event['event_date_start'])
            else:
                task["event_date"] = event.get("event_date_start")
            
            inst = await db.institutions.find_one({"id": event["institution_id"]}, {"_id": 0})
            task["institution_name"] = inst["name"] if inst else None
        
        user = await db.users.find_one({"id": task["assigned_to"]}, {"_id": 0})
        task["assigned_to_name"] = user["name"] if user else None
    
    return tasks

@api_router.post("/tasks", response_model=Task)
async def create_task(input: TaskCreate, current_user: dict = Depends(require_role(["admin", "media_head"]))):
    task_dict = input.model_dump()
    task_dict["id"] = str(uuid.uuid4())
    task_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    if task_dict.get('due_date') and isinstance(task_dict['due_date'], datetime):
        task_dict['due_date'] = task_dict['due_date'].isoformat()
    
    await db.tasks.insert_one(task_dict)
    
    # Get event title for notification
    event = await db.events.find_one({"id": task_dict["event_id"]}, {"_id": 0})
    event_title = event["title"] if event else "Unknown Event"
    
    # Create notification for assigned team member
    await create_notification(
        user_id=task_dict["assigned_to"],
        title="New Task Assigned",
        message=f"You have been assigned a {task_dict['type']} task for {event_title}",
        notif_type="task_assigned",
        related_id=task_dict["id"]
    )
    
    task_dict['created_at'] = datetime.fromisoformat(task_dict['created_at'])
    if task_dict.get('due_date'):
        task_dict['due_date'] = datetime.fromisoformat(task_dict['due_date'])
    
    return Task(**task_dict)

@api_router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Team members can only access their own tasks
    if current_user["role"] == "team_member" and task["assigned_to"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(task.get('created_at'), str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    if task.get('due_date') and isinstance(task['due_date'], str):
        task['due_date'] = datetime.fromisoformat(task['due_date'])
    
    # Add event details
    event = await db.events.find_one({"id": task["event_id"]}, {"_id": 0})
    if event:
        task["event_title"] = event.get("title")
        if isinstance(event.get('event_date_start'), str):
            task["event_date"] = datetime.fromisoformat(event['event_date_start'])
        else:
            task["event_date"] = event.get("event_date_start")
        
        inst = await db.institutions.find_one({"id": event["institution_id"]}, {"_id": 0})
        task["institution_name"] = inst["name"] if inst else None
    
    user = await db.users.find_one({"id": task["assigned_to"]}, {"_id": 0})
    task["assigned_to_name"] = user["name"] if user else None
    
    return TaskResponse(**task)

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, input: TaskBase, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    old_status = task.get("status")
    
    # Team members can only update their own tasks (status, deliverable_link, comments)
    if current_user["role"] == "team_member":
        if task["assigned_to"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        # Only allow updating specific fields
        allowed_fields = {"status", "deliverable_link", "comments"}
        update_dict = {k: v for k, v in input.model_dump().items() if k in allowed_fields}
    else:
        update_dict = input.model_dump()
        if update_dict.get('due_date') and isinstance(update_dict['due_date'], datetime):
            update_dict['due_date'] = update_dict['due_date'].isoformat()
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_dict})
    
    # Send notification if task is marked as completed
    new_status = update_dict.get("status", old_status)
    if new_status == "completed" and old_status != "completed":
        # Get event details
        event = await db.events.find_one({"id": task["event_id"]}, {"_id": 0})
        event_title = event["title"] if event else "Unknown Event"
        
        # Notify event creator/media head
        if event and event.get("created_by"):
            user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
            user_name = user["name"] if user else "Team member"
            await create_notification(
                user_id=event["created_by"],
                title="Task Completed",
                message=f"{user_name} completed {task['type']} task for {event_title}",
                notif_type="task_completed",
                related_id=task_id
            )
    
    updated = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if updated.get('due_date') and isinstance(updated['due_date'], str):
        updated['due_date'] = datetime.fromisoformat(updated['due_date'])
    
    return Task(**updated)

# ============================================================================
# EQUIPMENT ROUTES
# ============================================================================

@api_router.get("/equipment", response_model=List[Equipment])
async def get_equipment(current_user: dict = Depends(get_current_user)):
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    for eq in equipment_list:
        if isinstance(eq.get('created_at'), str):
            eq['created_at'] = datetime.fromisoformat(eq['created_at'])
    return equipment_list

@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(input: EquipmentCreate, current_user: dict = Depends(require_role(["admin"]))):
    eq_dict = input.model_dump()
    eq_dict["id"] = str(uuid.uuid4())
    eq_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.equipment.insert_one(eq_dict)
    eq_dict['created_at'] = datetime.fromisoformat(eq_dict['created_at'])
    return Equipment(**eq_dict)

@api_router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, input: EquipmentBase, current_user: dict = Depends(require_role(["admin"]))):
    eq = await db.equipment.find_one({"id": equipment_id})
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_dict = input.model_dump()
    await db.equipment.update_one({"id": equipment_id}, {"$set": update_dict})
    
    updated = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Equipment(**updated)

# ============================================================================
# EQUIPMENT ALLOCATION ROUTES
# ============================================================================

@api_router.get("/equipment-allocations", response_model=List[EquipmentAllocationResponse])
async def get_equipment_allocations(
    event_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if event_id:
        query["event_id"] = event_id
    
    allocations = await db.equipment_allocations.find(query, {"_id": 0}).to_list(1000)
    
    for alloc in allocations:
        if isinstance(alloc.get('created_at'), str):
            alloc['created_at'] = datetime.fromisoformat(alloc['created_at'])
        
        eq = await db.equipment.find_one({"id": alloc["equipment_id"]}, {"_id": 0})
        alloc["equipment_name"] = eq["name"] if eq else None
        
        event = await db.events.find_one({"id": alloc["event_id"]}, {"_id": 0})
        alloc["event_title"] = event["title"] if event else None
    
    return allocations

@api_router.post("/equipment-allocations", response_model=EquipmentAllocation)
async def create_equipment_allocation(
    input: EquipmentAllocationCreate,
    current_user: dict = Depends(require_role(["admin", "media_head"]))
):
    alloc_dict = input.model_dump()
    alloc_dict["id"] = str(uuid.uuid4())
    alloc_dict["allocated_by"] = current_user["id"]
    alloc_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.equipment_allocations.insert_one(alloc_dict)
    alloc_dict['created_at'] = datetime.fromisoformat(alloc_dict['created_at'])
    return EquipmentAllocation(**alloc_dict)

# ============================================================================
# PUBLIC DELIVERIES ROUTE
# ============================================================================

@api_router.get("/deliveries/public", response_model=List[DeliverablePublic])
async def get_public_deliveries(
    institution_id: Optional[str] = None,
    task_type: Optional[str] = None
):
    # Find completed tasks with deliverable links
    query = {"status": "completed", "deliverable_link": {"$ne": None, "$ne": ""}}
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    
    deliverables = []
    for task in tasks:
        event = await db.events.find_one({"id": task["event_id"]}, {"_id": 0})
        if not event:
            continue
        
        # Apply filters
        if institution_id and event["institution_id"] != institution_id:
            continue
        if task_type and task["type"] != task_type:
            continue
        
        inst = await db.institutions.find_one({"id": event["institution_id"]}, {"_id": 0})
        
        deliverables.append({
            "id": task["id"],
            "event_title": event["title"],
            "institution_name": inst["name"] if inst else "Unknown",
            "event_date": datetime.fromisoformat(event["event_date_start"]) if isinstance(event.get('event_date_start'), str) else event.get('event_date_start'),
            "task_type": task["type"],
            "deliverable_link": task["deliverable_link"],
            "priority": event.get("priority", "normal"),
            "completed_at": datetime.fromisoformat(task["created_at"]) if isinstance(task.get('created_at'), str) else task.get('created_at', datetime.now(timezone.utc))
        })
    
    # Sort by completed date
    deliverables.sort(key=lambda x: x["completed_at"], reverse=True)
    
    return deliverables

# ============================================================================
# DASHBOARD STATS
# ============================================================================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(require_role(["admin", "media_head"]))):
    now = datetime.now(timezone.utc)
    
    # Upcoming events (future from today)
    upcoming_events = await db.events.count_documents({
        "event_date_start": {"$gte": now.isoformat()}
    })
    
    # Pending deliveries (tasks not completed OR events not closed)
    pending_tasks = await db.tasks.count_documents({"status": {"$ne": "completed"}})
    pending_events = await db.events.count_documents({"status": {"$ne": "closed"}})
    pending_deliveries = pending_tasks + pending_events
    
    # Events closed this month
    start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    closed_this_month = await db.events.count_documents({
        "status": "closed",
        "created_at": {"$gte": start_of_month.isoformat()}
    })
    
    # Overdue tasks
    overdue_query = {
        "status": {"$ne": "completed"},
        "due_date": {"$ne": None, "$lt": now.isoformat()}
    }
    overdue_tasks = await db.tasks.count_documents(overdue_query)
    
    # Total counts
    total_events = await db.events.count_documents({})
    total_tasks = await db.tasks.count_documents({})
    
    return DashboardStats(
        upcoming_events=upcoming_events,
        pending_deliveries=pending_deliveries,
        closed_this_month=closed_this_month,
        overdue_tasks=overdue_tasks,
        total_events=total_events,
        total_tasks=total_tasks
    )

# ============================================================================
# DELETE ENDPOINTS
# ============================================================================

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(require_role(["admin", "media_head"]))):
    """Delete event and all associated tasks"""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Delete all associated tasks
    await db.tasks.delete_many({"event_id": event_id})
    
    # Delete all equipment allocations
    await db.equipment_allocations.delete_many({"event_id": event_id})
    
    # Delete the event
    await db.events.delete_one({"id": event_id})
    
    return {"message": "Event and associated data deleted successfully"}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(require_role(["admin", "media_head"]))):
    """Delete a task"""
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.delete_one({"id": task_id})
    return {"message": "Task deleted successfully"}

@api_router.delete("/institutions/{institution_id}")
async def delete_institution(institution_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Delete institution only if no events associated"""
    # Check if any events exist for this institution
    events_count = await db.events.count_documents({"institution_id": institution_id})
    if events_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete institution. {events_count} event(s) are associated with it."
        )
    
    institution = await db.institutions.find_one({"id": institution_id})
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    await db.institutions.delete_one({"id": institution_id})
    return {"message": "Institution deleted successfully"}

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Delete equipment only if not currently allocated"""
    # Check if equipment is allocated to any event
    allocations_count = await db.equipment_allocations.count_documents({"equipment_id": equipment_id})
    if allocations_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete equipment. It is allocated to {allocations_count} event(s)."
        )
    
    equipment = await db.equipment.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    await db.equipment.delete_one({"id": equipment_id})
    return {"message": "Equipment deleted successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Delete user - cannot delete yourself"""
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Note: In production, you may want to reassign tasks instead of deleting the user
    # For now, we'll allow deletion
    await db.users.delete_one({"id": user_id})
    return {"message": "User deleted successfully"}

# ============================================================================
# NOTIFICATION ROUTES
# ============================================================================

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get all notifications for current user"""
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    
    return notifications

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({
        "user_id": current_user["id"],
        "is_read": False
    })
    return {"count": count}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    notification = await db.notifications.find_one({"id": notification_id, "user_id": current_user["id"]})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/mark-all-read")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read for current user"""
    await db.notifications.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}

async def create_notification(user_id: str, title: str, message: str, notif_type: str, related_id: str = None):
    """Helper function to create notifications"""
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "related_id": related_id,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)

# Include the router in the main app
app.include_router(api_router)

# CORS configuration - use environment variable for security
allowed_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
