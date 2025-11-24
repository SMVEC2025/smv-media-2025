import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    print("Starting database seeding...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.institutions.delete_many({})
    await db.events.delete_many({})
    await db.tasks.delete_many({})
    await db.equipment.delete_many({})
    await db.equipment_allocations.delete_many({})
    print("Cleared existing data")
    
    # Create users
    users = [
        {
            "id": str(uuid.uuid4()),
            "name": "Admin User",
            "email": "admin@media.com",
            "password_hash": hash_password("password123"),
            "role": "admin",
            "specialization": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Media Head",
            "email": "head@media.com",
            "password_hash": hash_password("password123"),
            "role": "media_head",
            "specialization": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "John Photographer",
            "email": "member@media.com",
            "password_hash": hash_password("password123"),
            "role": "team_member",
            "specialization": "photo",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sarah Videographer",
            "email": "sarah@media.com",
            "password_hash": hash_password("password123"),
            "role": "team_member",
            "specialization": "video",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    # Create institutions
    institutions = [
        {
            "id": str(uuid.uuid4()),
            "name": "SMVEC College",
            "short_code": "SMVEC",
            "type": "college",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "SMV Nursing College",
            "short_code": "SMVNC",
            "type": "college",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Takshashila University",
            "short_code": "TKS",
            "type": "university",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.institutions.insert_many(institutions)
    print(f"Created {len(institutions)} institutions")
    
    # Create events
    admin_id = users[0]["id"]
    now = datetime.now(timezone.utc)
    
    events = [
        {
            "id": str(uuid.uuid4()),
            "title": "Annual Graduation Ceremony 2024",
            "institution_id": institutions[0]["id"],
            "department": "All Departments",
            "event_date_start": (now + timedelta(days=15)).isoformat(),
            "event_date_end": None,
            "venue": "Main Auditorium",
            "description": "Annual graduation ceremony for batch 2020-2024",
            "event_type": "convocation",
            "expected_audience": 500,
            "chief_guests": "Chief Minister, Education Minister",
            "requirements": ["photos", "video_coverage", "highlight_video"],
            "comments": "High priority event, need professional coverage",
            "priority": "vip",
            "deliverable_due_date": (now + timedelta(days=20)).isoformat(),
            "status": "event_scheduled",
            "created_by": admin_id,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Tech Symposium 2024",
            "institution_id": institutions[0]["id"],
            "department": "Computer Science",
            "event_date_start": (now + timedelta(days=5)).isoformat(),
            "event_date_end": (now + timedelta(days=7)).isoformat(),
            "venue": "IT Block Seminar Hall",
            "description": "Three-day technical symposium with workshops and competitions",
            "event_type": "workshop",
            "expected_audience": 200,
            "chief_guests": None,
            "requirements": ["photos", "video_coverage", "instagram_reel"],
            "comments": "Need social media content",
            "priority": "high",
            "deliverable_due_date": (now + timedelta(days=10)).isoformat(),
            "status": "event_scheduled",
            "created_by": admin_id,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Sports Day 2024",
            "institution_id": institutions[1]["id"],
            "department": "Physical Education",
            "event_date_start": (now - timedelta(days=10)).isoformat(),
            "event_date_end": None,
            "venue": "Main Ground",
            "description": "Annual sports competition",
            "event_type": "sports",
            "expected_audience": 300,
            "chief_guests": None,
            "requirements": ["photos", "video_coverage"],
            "comments": "Fast-paced event, need action shots",
            "priority": "normal",
            "deliverable_due_date": (now - timedelta(days=5)).isoformat(),
            "status": "closed",
            "created_by": admin_id,
            "created_at": (now - timedelta(days=15)).isoformat()
        }
    ]
    await db.events.insert_many(events)
    print(f"Created {len(events)} events")
    
    # Create tasks
    team_member = users[2]
    videographer = users[3]
    
    tasks = [
        {
            "id": str(uuid.uuid4()),
            "event_id": events[0]["id"],
            "type": "photo",
            "assigned_to": team_member["id"],
            "due_date": (now + timedelta(days=15)).isoformat(),
            "status": "assigned",
            "deliverable_link": None,
            "comments": None,
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "event_id": events[0]["id"],
            "type": "video",
            "assigned_to": videographer["id"],
            "due_date": (now + timedelta(days=15)).isoformat(),
            "status": "assigned",
            "deliverable_link": None,
            "comments": "Need full ceremony coverage",
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "event_id": events[1]["id"],
            "type": "photo",
            "assigned_to": team_member["id"],
            "due_date": (now + timedelta(days=7)).isoformat(),
            "status": "in_progress",
            "deliverable_link": None,
            "comments": "Working on it",
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "event_id": events[2]["id"],
            "type": "photo",
            "assigned_to": team_member["id"],
            "due_date": (now - timedelta(days=5)).isoformat(),
            "status": "completed",
            "deliverable_link": "https://drive.google.com/sample-sports-day-photos",
            "comments": "Delivered all photos",
            "created_at": (now - timedelta(days=10)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "event_id": events[2]["id"],
            "type": "video",
            "assigned_to": videographer["id"],
            "due_date": (now - timedelta(days=5)).isoformat(),
            "status": "completed",
            "deliverable_link": "https://drive.google.com/sample-sports-day-video",
            "comments": "Highlight video ready",
            "created_at": (now - timedelta(days=10)).isoformat()
        }
    ]
    await db.tasks.insert_many(tasks)
    print(f"Created {len(tasks)} tasks")
    
    # Create equipment
    equipment = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sony FX30 Camera",
            "code": "CAM001",
            "status": "available",
            "notes": "4K video camera with gimbal",
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Canon R5 Camera",
            "code": "CAM002",
            "status": "available",
            "notes": "High-resolution photography camera",
            "created_at": now.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "DJI Mavic 3 Drone",
            "code": "DRONE001",
            "status": "available",
            "notes": "Aerial photography drone",
            "created_at": now.isoformat()
        }
    ]
    await db.equipment.insert_many(equipment)
    print(f"Created {len(equipment)} equipment items")
    
    print("\\n" + "="*60)
    print("Database seeding completed successfully!")
    print("="*60)
    print("\\nDemo Accounts:")
    print("-" * 60)
    print("Admin:        admin@media.com / password123")
    print("Media Head:   head@media.com / password123")
    print("Team Member:  member@media.com / password123")
    print("Videographer: sarah@media.com / password123")
    print("-" * 60)

if __name__ == "__main__":
    asyncio.run(seed_database())
