import requests
import sys
from datetime import datetime, timedelta

class MediaHubAPITester:
    def __init__(self, base_url="https://eventflow-99.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tokens = {}
        self.users = {}
        self.institutions = []
        self.events = []
        self.tasks = []
        self.equipment = []
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return False, {}

        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_login(self, email, password, role_name):
        """Test login and store token"""
        print(f"\n{'='*60}")
        print(f"Testing Login for {role_name}")
        print(f"{'='*60}")
        
        success, response = self.run_test(
            f"Login as {role_name}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password},
            description=f"Login with {email}"
        )
        
        if success and 'token' in response:
            self.tokens[role_name] = response['token']
            self.users[role_name] = response['user']
            print(f"   ✅ Token stored for {role_name}")
            return True
        return False

    def test_auth_me(self, role_name):
        """Test /auth/me endpoint"""
        success, response = self.run_test(
            f"Get current user ({role_name})",
            "GET",
            "auth/me",
            200,
            token=self.tokens.get(role_name),
            description="Verify token and get user info"
        )
        return success

    def test_dashboard_stats(self, role_name):
        """Test dashboard stats endpoint"""
        print(f"\n{'='*60}")
        print(f"Testing Dashboard Stats for {role_name}")
        print(f"{'='*60}")
        
        success, response = self.run_test(
            f"Get dashboard stats ({role_name})",
            "GET",
            "dashboard/stats",
            200,
            token=self.tokens.get(role_name),
            description="Get dashboard statistics"
        )
        
        if success:
            print(f"   Stats: {response}")
        return success

    def test_get_institutions(self, role_name):
        """Test get institutions"""
        success, response = self.run_test(
            f"Get institutions ({role_name})",
            "GET",
            "institutions",
            200,
            token=self.tokens.get(role_name),
            description="Get all institutions"
        )
        
        if success and isinstance(response, list):
            self.institutions = response
            print(f"   Found {len(response)} institutions")
        return success

    def test_get_events(self, role_name):
        """Test get events"""
        print(f"\n{'='*60}")
        print(f"Testing Events for {role_name}")
        print(f"{'='*60}")
        
        success, response = self.run_test(
            f"Get events ({role_name})",
            "GET",
            "events",
            200,
            token=self.tokens.get(role_name),
            description="Get all events"
        )
        
        if success and isinstance(response, list):
            self.events = response
            print(f"   Found {len(response)} events")
        return success

    def test_create_event(self, role_name):
        """Test create event"""
        if not self.institutions:
            print("   ⚠️  Skipping - No institutions available")
            return False
        
        event_data = {
            "title": f"Test Event {datetime.now().strftime('%H%M%S')}",
            "institution_id": self.institutions[0]['id'],
            "department": "Test Department",
            "event_date_start": (datetime.now() + timedelta(days=7)).isoformat(),
            "venue": "Test Venue",
            "description": "Test event description",
            "event_type": "seminar",
            "priority": "normal",
            "requirements": ["photos", "video_coverage"]
        }
        
        success, response = self.run_test(
            f"Create event ({role_name})",
            "POST",
            "events",
            200,
            data=event_data,
            token=self.tokens.get(role_name),
            description="Create a new event"
        )
        
        if success and 'id' in response:
            self.events.append(response)
            print(f"   Created event ID: {response['id']}")
        return success

    def test_get_event_details(self, role_name):
        """Test get event details"""
        if not self.events:
            print("   ⚠️  Skipping - No events available")
            return False
        
        event_id = self.events[0]['id']
        success, response = self.run_test(
            f"Get event details ({role_name})",
            "GET",
            f"events/{event_id}",
            200,
            token=self.tokens.get(role_name),
            description=f"Get details for event {event_id}"
        )
        return success

    def test_get_tasks(self, role_name):
        """Test get tasks"""
        print(f"\n{'='*60}")
        print(f"Testing Tasks for {role_name}")
        print(f"{'='*60}")
        
        success, response = self.run_test(
            f"Get tasks ({role_name})",
            "GET",
            "tasks",
            200,
            token=self.tokens.get(role_name),
            description="Get all tasks"
        )
        
        if success and isinstance(response, list):
            self.tasks = response
            print(f"   Found {len(response)} tasks")
        return success

    def test_create_task(self, role_name):
        """Test create task (admin/media_head only)"""
        if not self.events:
            print("   ⚠️  Skipping - No events available")
            return False
        
        # Get team members - use /team-members for media_head, /users for admin
        endpoint = "team-members" if role_name == "media_head" else "users"
        success, users = self.run_test(
            f"Get team members for task assignment ({role_name})",
            "GET",
            endpoint,
            200,
            token=self.tokens.get(role_name),
            description=f"Get team members via /{endpoint}"
        )
        
        if not success or not users:
            print("   ⚠️  Skipping - No users available")
            return False
        
        # For /team-members endpoint, all users are team_member role
        # For /users endpoint, filter by role
        if endpoint == "users":
            team_members = [u for u in users if u.get('role') == 'team_member']
        else:
            team_members = users
        
        if not team_members:
            print("   ⚠️  Skipping - No team members available")
            return False
        
        task_data = {
            "event_id": self.events[0]['id'],
            "type": "photo",
            "assigned_to": team_members[0]['id'],
            "due_date": (datetime.now() + timedelta(days=5)).isoformat(),
            "comments": "Test task assignment"
        }
        
        success, response = self.run_test(
            f"Create task ({role_name})",
            "POST",
            "tasks",
            200,
            data=task_data,
            token=self.tokens.get(role_name),
            description="Assign a task to team member"
        )
        
        if success and 'id' in response:
            self.tasks.append(response)
            print(f"   Created task ID: {response['id']}")
        return success

    def test_update_task(self, role_name):
        """Test update task"""
        if not self.tasks:
            print("   ⚠️  Skipping - No tasks available")
            return False
        
        task = self.tasks[0]
        update_data = {
            **task,
            "status": "in_progress",
            "comments": "Updated by test"
        }
        
        success, response = self.run_test(
            f"Update task ({role_name})",
            "PUT",
            f"tasks/{task['id']}",
            200,
            data=update_data,
            token=self.tokens.get(role_name),
            description=f"Update task {task['id']}"
        )
        return success

    def test_get_equipment(self, role_name):
        """Test get equipment"""
        print(f"\n{'='*60}")
        print(f"Testing Equipment for {role_name}")
        print(f"{'='*60}")
        
        success, response = self.run_test(
            f"Get equipment ({role_name})",
            "GET",
            "equipment",
            200,
            token=self.tokens.get(role_name),
            description="Get all equipment"
        )
        
        if success and isinstance(response, list):
            self.equipment = response
            print(f"   Found {len(response)} equipment items")
        return success

    def test_allocate_equipment(self, role_name):
        """Test allocate equipment"""
        if not self.events or not self.equipment:
            print("   ⚠️  Skipping - No events or equipment available")
            return False
        
        allocation_data = {
            "event_id": self.events[0]['id'],
            "equipment_id": self.equipment[0]['id'],
            "notes": "Test allocation"
        }
        
        success, response = self.run_test(
            f"Allocate equipment ({role_name})",
            "POST",
            "equipment-allocations",
            200,
            data=allocation_data,
            token=self.tokens.get(role_name),
            description="Allocate equipment to event"
        )
        return success

    def test_public_deliveries(self):
        """Test public deliveries endpoint (no auth)"""
        print(f"\n{'='*60}")
        print(f"Testing Public Deliveries (No Auth)")
        print(f"{'='*60}")
        
        success, response = self.run_test(
            "Get public deliveries",
            "GET",
            "deliveries/public",
            200,
            description="Get public deliveries without authentication"
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} public deliverables")
        return success

    def test_team_members_endpoint(self):
        """Test /team-members endpoint (BUG FIX VALIDATION)"""
        print(f"\n{'='*60}")
        print(f"Testing /team-members Endpoint (Bug Fix)")
        print(f"{'='*60}")
        
        # Media head SHOULD access /team-members
        success1, response1 = self.run_test(
            "Media head accessing /team-members (should succeed)",
            "GET",
            "team-members",
            200,
            token=self.tokens.get('media_head'),
            description="Media head should access team-members for task assignment"
        )
        
        if success1:
            print(f"   ✅ Media head can access team members: {len(response1)} members found")
        
        # Admin SHOULD also access /team-members
        success2, response2 = self.run_test(
            "Admin accessing /team-members (should succeed)",
            "GET",
            "team-members",
            200,
            token=self.tokens.get('admin'),
            description="Admin should also access team-members"
        )
        
        if success2:
            print(f"   ✅ Admin can access team members: {len(response2)} members found")
        
        # Team member should NOT access /team-members
        success3, _ = self.run_test(
            "Team member accessing /team-members (should fail)",
            "GET",
            "team-members",
            403,
            token=self.tokens.get('team_member'),
            description="Team member should not access team-members list"
        )
        
        return success1 and success2 and success3
    
    def test_role_based_access(self):
        """Test role-based access restrictions"""
        print(f"\n{'='*60}")
        print(f"Testing Role-Based Access Control")
        print(f"{'='*60}")
        
        # Team member should NOT access /users
        success, _ = self.run_test(
            "Team member accessing /users (should fail)",
            "GET",
            "users",
            403,
            token=self.tokens.get('team_member'),
            description="Team member should not access admin routes"
        )
        
        # Team member should NOT access /dashboard/stats
        success2, _ = self.run_test(
            "Team member accessing /dashboard/stats (should fail)",
            "GET",
            "dashboard/stats",
            403,
            token=self.tokens.get('team_member'),
            description="Team member should not access dashboard stats"
        )
        
        # Media head should NOT access /users
        success3, _ = self.run_test(
            "Media head accessing /users (should fail)",
            "GET",
            "users",
            403,
            token=self.tokens.get('media_head'),
            description="Media head should not access admin-only routes"
        )
        
        return success and success2 and success3
    
    def test_institutions_management(self):
        """Test Phase 3B - Institutions Management"""
        print(f"\n{'='*60}")
        print(f"PHASE 3B - INSTITUTIONS MANAGEMENT")
        print(f"{'='*60}")
        
        # Admin can access institutions
        success1, institutions = self.run_test(
            "Admin: Get all institutions",
            "GET",
            "institutions",
            200,
            token=self.tokens.get('admin'),
            description="Admin should access institutions"
        )
        
        # Media head should NOT create institutions (403)
        success2, _ = self.run_test(
            "Media head: Create institution (should fail)",
            "POST",
            "institutions",
            403,
            data={"name": "Test Institution", "type": "college"},
            token=self.tokens.get('media_head'),
            description="Media head should not create institutions"
        )
        
        # Team member should NOT access institutions (403)
        success3, _ = self.run_test(
            "Team member: Get institutions (should fail)",
            "GET",
            "institutions",
            403,
            token=self.tokens.get('team_member'),
            description="Team member should not access institutions"
        )
        
        # Admin creates institution with all fields
        inst_data_full = {
            "name": f"Test College {datetime.now().strftime('%H%M%S')}",
            "short_code": "TC",
            "type": "college",
            "is_active": True
        }
        success4, new_inst = self.run_test(
            "Admin: Create institution (all fields)",
            "POST",
            "institutions",
            200,
            data=inst_data_full,
            token=self.tokens.get('admin'),
            description="Create institution with all fields"
        )
        
        # Admin creates institution with minimal fields
        inst_data_min = {
            "name": f"Test School {datetime.now().strftime('%H%M%S')}"
        }
        success5, _ = self.run_test(
            "Admin: Create institution (minimal fields)",
            "POST",
            "institutions",
            200,
            data=inst_data_min,
            token=self.tokens.get('admin'),
            description="Create institution with only name"
        )
        
        # Admin edits institution
        if success4 and new_inst and 'id' in new_inst:
            edit_data = {
                "name": new_inst['name'],
                "short_code": "TC2",
                "type": "university",
                "is_active": False
            }
            success6, _ = self.run_test(
                "Admin: Edit institution",
                "PUT",
                f"institutions/{new_inst['id']}",
                200,
                data=edit_data,
                token=self.tokens.get('admin'),
                description="Edit institution type and active status"
            )
        else:
            success6 = False
            print("   ⚠️  Skipping edit test - no institution created")
        
        return success1 and success2 and success3 and success4 and success5 and success6
    
    def test_equipment_management(self):
        """Test Phase 3B - Equipment Management"""
        print(f"\n{'='*60}")
        print(f"PHASE 3B - EQUIPMENT MANAGEMENT")
        print(f"{'='*60}")
        
        # Admin can access equipment
        success1, equipment = self.run_test(
            "Admin: Get all equipment",
            "GET",
            "equipment",
            200,
            token=self.tokens.get('admin'),
            description="Admin should access equipment"
        )
        
        # Media head should NOT create equipment (403)
        success2, _ = self.run_test(
            "Media head: Create equipment (should fail)",
            "POST",
            "equipment",
            403,
            data={"name": "Test Camera", "status": "available"},
            token=self.tokens.get('media_head'),
            description="Media head should not create equipment"
        )
        
        # Team member should NOT create equipment (403)
        success3, _ = self.run_test(
            "Team member: Create equipment (should fail)",
            "POST",
            "equipment",
            403,
            data={"name": "Test Camera", "status": "available"},
            token=self.tokens.get('team_member'),
            description="Team member should not create equipment"
        )
        
        # Admin creates equipment
        equip_data = {
            "name": f"Test Camera {datetime.now().strftime('%H%M%S')}",
            "code": "CAM999",
            "status": "available",
            "notes": "Test equipment"
        }
        success4, new_equip = self.run_test(
            "Admin: Create equipment",
            "POST",
            "equipment",
            200,
            data=equip_data,
            token=self.tokens.get('admin'),
            description="Create new equipment"
        )
        
        # Admin edits equipment status
        if success4 and new_equip and 'id' in new_equip:
            edit_data = {
                "name": new_equip['name'],
                "code": new_equip['code'],
                "status": "in_use",
                "notes": "Updated status"
            }
            success5, _ = self.run_test(
                "Admin: Edit equipment (status to in_use)",
                "PUT",
                f"equipment/{new_equip['id']}",
                200,
                data=edit_data,
                token=self.tokens.get('admin'),
                description="Change equipment status to in_use"
            )
            
            # Change to maintenance
            edit_data['status'] = "maintenance"
            success6, _ = self.run_test(
                "Admin: Edit equipment (status to maintenance)",
                "PUT",
                f"equipment/{new_equip['id']}",
                200,
                data=edit_data,
                token=self.tokens.get('admin'),
                description="Change equipment status to maintenance"
            )
        else:
            success5 = False
            success6 = False
            print("   ⚠️  Skipping edit tests - no equipment created")
        
        return success1 and success2 and success3 and success4 and success5 and success6
    
    def test_users_management(self):
        """Test Phase 3B - Users Management"""
        print(f"\n{'='*60}")
        print(f"PHASE 3B - USERS MANAGEMENT")
        print(f"{'='*60}")
        
        # Admin can access users
        success1, users = self.run_test(
            "Admin: Get all users",
            "GET",
            "users",
            200,
            token=self.tokens.get('admin'),
            description="Admin should access users"
        )
        
        # Media head should NOT access users (403)
        success2, _ = self.run_test(
            "Media head: Get users (should fail)",
            "GET",
            "users",
            403,
            token=self.tokens.get('media_head'),
            description="Media head should not access users"
        )
        
        # Team member should NOT access users (403)
        success3, _ = self.run_test(
            "Team member: Get users (should fail)",
            "GET",
            "users",
            403,
            token=self.tokens.get('team_member'),
            description="Team member should not access users"
        )
        
        # Admin creates team member with specialization
        user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "password123",
            "role": "team_member",
            "specialization": "photo"
        }
        success4, new_user = self.run_test(
            "Admin: Create team member with specialization",
            "POST",
            "users",
            200,
            data=user_data,
            token=self.tokens.get('admin'),
            description="Create team member with photo specialization"
        )
        
        # Admin creates media head (no specialization)
        user_data2 = {
            "name": f"Test Head {datetime.now().strftime('%H%M%S')}",
            "email": f"head{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "password123",
            "role": "media_head",
            "specialization": None
        }
        success5, new_head = self.run_test(
            "Admin: Create media head (no specialization)",
            "POST",
            "users",
            200,
            data=user_data2,
            token=self.tokens.get('admin'),
            description="Create media head without specialization"
        )
        
        # Admin edits user role
        if success4 and new_user and 'id' in new_user:
            edit_data = {
                "name": new_user['name'],
                "email": new_user['email'],
                "role": "media_head",
                "specialization": None
            }
            success6, _ = self.run_test(
                "Admin: Edit user role (team_member to media_head)",
                "PUT",
                f"users/{new_user['id']}",
                200,
                data=edit_data,
                token=self.tokens.get('admin'),
                description="Change user role from team_member to media_head"
            )
        else:
            success6 = False
            print("   ⚠️  Skipping edit test - no user created")
        
        return success1 and success2 and success3 and success4 and success5 and success6

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"   {i}. {test.get('test', 'Unknown')}")
                print(f"      Endpoint: {test.get('endpoint', 'N/A')}")
                if 'error' in test:
                    print(f"      Error: {test['error']}")
                else:
                    print(f"      Expected: {test.get('expected')}, Got: {test.get('actual')}")
        
        return len(self.failed_tests) == 0

def main():
    print("="*60)
    print("MediaHub API Testing Suite")
    print("="*60)
    
    tester = MediaHubAPITester()
    
    # Test credentials
    credentials = {
        'admin': ('admin@media.com', 'password123'),
        'media_head': ('head@media.com', 'password123'),
        'team_member': ('member@media.com', 'password123')
    }
    
    # 1. Test Login for all roles
    for role, (email, password) in credentials.items():
        if not tester.test_login(email, password, role):
            print(f"\n❌ Login failed for {role}, stopping tests")
            return 1
        tester.test_auth_me(role)
    
    # 2. Test Admin functionality
    print(f"\n{'#'*60}")
    print(f"TESTING ADMIN FUNCTIONALITY")
    print(f"{'#'*60}")
    tester.test_dashboard_stats('admin')
    tester.test_get_institutions('admin')
    tester.test_get_events('admin')
    tester.test_create_event('admin')
    tester.test_get_event_details('admin')
    tester.test_get_tasks('admin')
    tester.test_create_task('admin')
    tester.test_get_equipment('admin')
    tester.test_allocate_equipment('admin')
    
    # 3. Test Media Head functionality
    print(f"\n{'#'*60}")
    print(f"TESTING MEDIA HEAD FUNCTIONALITY")
    print(f"{'#'*60}")
    tester.test_dashboard_stats('media_head')
    tester.test_get_events('media_head')
    tester.test_create_event('media_head')
    tester.test_get_tasks('media_head')
    tester.test_create_task('media_head')
    tester.test_allocate_equipment('media_head')
    
    # 4. Test Team Member functionality
    print(f"\n{'#'*60}")
    print(f"TESTING TEAM MEMBER FUNCTIONALITY")
    print(f"{'#'*60}")
    tester.test_get_tasks('team_member')
    tester.test_update_task('team_member')
    
    # 5. Test Public Deliveries
    tester.test_public_deliveries()
    
    # 6. Test /team-members endpoint (Bug Fix Validation)
    tester.test_team_members_endpoint()
    
    # 7. Test Role-Based Access Control
    tester.test_role_based_access()
    
    # 8. Test Phase 3B - Institutions Management
    print(f"\n{'#'*60}")
    print(f"PHASE 3B TESTING - ADMIN TOOLS")
    print(f"{'#'*60}")
    tester.test_institutions_management()
    
    # 9. Test Phase 3B - Equipment Management
    tester.test_equipment_management()
    
    # 10. Test Phase 3B - Users Management
    tester.test_users_management()
    
    # Print summary
    all_passed = tester.print_summary()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
