# Training Management System - Complete Workflow Analysis

## 🎯 System Overview

The Training Management System consists of 6 core components that work together to manage the complete training lifecycle:

1. **Training Requests** - Initial training requests and approvals
2. **Courses** - Training course definitions and management
3. **Enrollments** - Student enrollment in courses
4. **Schedules** - Course session scheduling and management
5. **Attendance** - Session attendance tracking
6. **Resources** - Training resources (rooms, equipment, materials)

## 🔄 Complete Workflow

```
Training Request → Course Creation → Enrollment → Scheduling → Attendance → Feedback
      ↓                ↓              ↓           ↓           ↓           ↓
   Approval        Resource        Status      QR Code    Tracking    Analysis
   Process         Assignment      Updates     Generation  Reports     Reports
```

## 📋 Component Analysis

### 1. Training Requests (`/api/requests`)

#### Purpose
- Users request training for specific courses
- Admin approval/rejection process
- Prevents duplicate enrollments
- Tracks training justification and accessibility needs

#### Workflow
1. User submits training request with justification
2. Admin reviews and approves/rejects
3. Approved requests can lead to enrollment
4. Rejected requests are logged with reasons

#### Key Endpoints

| Endpoint | Method | Purpose | Permissions | Required Data |
|----------|--------|---------|-------------|---------------|
| `/api/requests` | GET | List all requests | Admin only | None |
| `/api/requests` | POST | Create new request | Trainee/Trainer | `course`, `justification` |
| `/api/requests/:id` | GET | Get specific request | Admin or owner | None |
| `/api/requests/:id/approve` | PUT | Approve request | Admin only | `approvalNotes` (optional) |
| `/api/requests/:id/reject` | PUT | Reject request | Admin only | `approvalNotes` (optional) |

#### Testing in Swagger

**Create Training Request:**
```json
{
  "course": "course_id_here",
  "justification": "Need this training for career advancement",
  "accessibilityRequirements": "Wheelchair accessible room needed"
}
```

**Approve Request:**
```json
{
  "approvalNotes": "Approved based on performance review"
}
```

### 2. Courses (`/api/courses`)

#### Purpose
- Define training courses with details
- Manage course capacity and instructors
- Track course status and dates
- Link to organizations and resources

#### Workflow
1. Admin creates course with details
2. Course is published and available for requests
3. Users can request enrollment
4. Course runs according to schedule
5. Course completion triggers certificates

#### Key Endpoints

| Endpoint | Method | Purpose | Permissions | Required Data |
|----------|--------|---------|-------------|---------------|
| `/api/courses` | GET | List all courses | Public | None |
| `/api/courses` | POST | Create course | Admin/Trainer | `title`, `description`, `startDate`, `endDate` |
| `/api/courses/:id` | GET | Get course details | Public | None |
| `/api/courses/:id/enroll` | POST | Enroll in course | Authenticated | None |
| `/api/courses/:id/feedback` | POST | Submit feedback | Enrolled users | `overallRating`, `contentRating` |

#### Testing in Swagger

**Create Course:**
```json
{
  "title": "Advanced JavaScript Development",
  "description": "Learn advanced JavaScript concepts and frameworks",
  "startDate": "2024-02-01T09:00:00.000Z",
  "endDate": "2024-02-15T17:00:00.000Z",
  "capacity": 20,
  "instructor": "instructor_id_here",
  "organization": "org_id_here",
  "price": 500,
  "category": "Programming"
}
```

### 3. Enrollments (`/api/enrollments`)

#### Purpose
- Track student enrollment in courses
- Manage enrollment status (enrolled, completed, dropped, failed)
- Link to training requests
- Track completion dates and certificates

#### Workflow
1. User enrolls in course (directly or via approved request)
2. Enrollment status tracked throughout course
3. Attendance affects completion status
4. Course end triggers automatic status updates
5. Completion generates certificates

#### Key Endpoints

| Endpoint | Method | Purpose | Permissions | Required Data |
|----------|--------|---------|-------------|---------------|
| `/api/enrollments` | GET | List enrollments | Admin/Trainer | None |
| `/api/courses/:courseId/enroll` | POST | Enroll in course | Authenticated | None |
| `/api/enrollments/:id` | GET | Get enrollment | Owner or Admin | None |
| `/api/enrollments/:id` | PUT | Update enrollment | Admin/Trainer | `status`, `completionDate` |
| `/api/enrollments/auto-update` | POST | Auto-update statuses | Admin only | None |
| `/api/enrollments/course/:courseId/stats` | GET | Course stats | Admin/Trainer | None |

#### Testing in Swagger

**Update Enrollment Status:**
```json
{
  "status": "completed",
  "completionDate": "2024-02-15T17:00:00.000Z",
  "notes": "Successfully completed all requirements"
}
```

### 4. Schedules (`/api/schedules`)

#### Purpose
- Schedule individual course sessions
- Manage session details (time, location, trainer)
- Generate QR codes for attendance
- Link sessions to resources
- Track session status

#### Workflow
1. Admin/Trainer creates session schedule
2. Sessions are assigned resources and trainers
3. QR codes generated for attendance tracking
4. Sessions run according to schedule
5. Attendance is tracked per session

#### Key Endpoints

| Endpoint | Method | Purpose | Permissions | Required Data |
|----------|--------|---------|-------------|---------------|
| `/api/schedules` | GET | List all schedules | Authenticated | None |
| `/api/schedules` | POST | Create schedule | Admin/Trainer | `course`, `sessionNumber`, `title`, `startTime`, `endTime` |
| `/api/schedules/:id` | GET | Get schedule | Authenticated | None |
| `/api/schedules/:id` | PUT | Update schedule | Admin/Trainer | Session details |
| `/api/schedules/course/:courseId` | GET | Course schedules | Authenticated | None |
| `/api/schedules/:id/qrcode` | GET | Generate QR code | Admin/Trainer | None |

#### Testing in Swagger

**Create Schedule:**
```json
{
  "course": "course_id_here",
  "sessionNumber": 1,
  "title": "Introduction to JavaScript",
  "description": "Basic JavaScript concepts and syntax",
  "startTime": "2024-02-01T09:00:00.000Z",
  "endTime": "2024-02-01T12:00:00.000Z",
  "location": "Room 101",
  "isVirtual": false,
  "trainer": "trainer_id_here",
  "resources": ["resource_id_1", "resource_id_2"]
}
```

### 5. Attendance (`/api/attendance`)

#### Purpose
- Track student attendance for each session
- Record check-in/check-out times
- Manage attendance status (present, absent, late, excused)
- Link to enrollments and courses
- Generate attendance reports

#### Workflow
1. QR code generated for session
2. Students scan QR code to check in
3. Attendance recorded with timestamp
4. Manual adjustments by trainers if needed
5. Attendance affects enrollment completion

#### Key Endpoints

| Endpoint | Method | Purpose | Permissions | Required Data |
|----------|--------|---------|-------------|---------------|
| `/api/attendance` | GET | List attendance | Admin/Trainer | None |
| `/api/attendance` | POST | Record attendance | Admin/Trainer | `enrollment`, `user`, `course`, `sessionNumber` |
| `/api/attendance/:id` | GET | Get attendance | Admin/Trainer | None |
| `/api/attendance/:id` | PUT | Update attendance | Admin/Trainer | `status`, `notes` |
| `/api/attendance/session/:sessionId` | GET | Session attendance | Admin/Trainer | None |
| `/api/attendance/user/:userId` | GET | User attendance | Owner or Admin | None |

#### Testing in Swagger

**Record Attendance:**
```json
{
  "enrollment": "enrollment_id_here",
  "user": "user_id_here",
  "course": "course_id_here",
  "sessionNumber": 1,
  "status": "present",
  "checkInTime": "2024-02-01T09:05:00.000Z",
  "notes": "Arrived 5 minutes late"
}
```

### 6. Resources (`/api/resources`)

#### Purpose
- Manage training resources (rooms, equipment, materials)
- Track resource availability
- Assign resources to sessions
- Manage resource capacity and accessibility
- Link resources to organizations

#### Workflow
1. Admin creates resources with details
2. Resources are assigned to sessions
3. Availability tracked during scheduling
4. Resources can be shared across courses
5. Accessibility features documented

#### Key Endpoints

| Endpoint | Method | Purpose | Permissions | Required Data |
|----------|--------|---------|-------------|---------------|
| `/api/resources` | GET | List all resources | Authenticated | None |
| `/api/resources` | POST | Create resource | Admin/Manager | `name`, `type`, `organization` |
| `/api/resources/:id` | GET | Get resource | Authenticated | None |
| `/api/resources/:id` | PUT | Update resource | Admin/Manager | Resource details |
| `/api/resources/:id/availability` | GET | Check availability | Authenticated | None |
| `/api/resources/:id/assign/:scheduleId` | POST | Assign to session | Admin/Trainer/Manager | None |

#### Testing in Swagger

**Create Resource:**
```json
{
  "name": "Conference Room A",
  "type": "room",
  "description": "Large conference room with projector",
  "capacity": 30,
  "location": "Building 1, Floor 2",
  "organization": "org_id_here",
  "accessibilityFeatures": ["wheelchair_accessible", "hearing_loop"]
}
```

## 🔐 Permission Matrix

| Role | Training Requests | Courses | Enrollments | Schedules | Attendance | Resources |
|------|------------------|---------|-------------|-----------|------------|-----------|
| **Admin** | Full access | Full access | Full access | Full access | Full access | Full access |
| **Trainer** | Create/View own | Create/View assigned | View assigned | Create/View assigned | Full access | View/Assign |
| **Manager** | View/Approve | View | View | View | View | Full access |
| **Trainee** | Create/View own | View | View own | View enrolled | View own | View |

## 🧪 Complete Testing Workflow

### Step 1: Setup Test Data

**1. Create Organization:**
```json
POST /api/organizations
{
  "name": "Test Training Organization",
  "description": "Organization for testing training workflows"
}
```

**2. Create Users:**
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Trainer",
  "email": "trainer@test.com",
  "password": "password123",
  "role": "trainer"
}
```

**3. Create Course:**
```json
POST /api/courses
{
  "title": "Test Course",
  "description": "Course for testing workflows",
  "startDate": "2024-02-01T09:00:00.000Z",
  "endDate": "2024-02-15T17:00:00.000Z",
  "capacity": 10,
  "organization": "org_id_from_step_1"
}
```

### Step 2: Training Request Workflow

**1. Create Training Request:**
```json
POST /api/requests
{
  "course": "course_id_from_step_1",
  "justification": "Need training for career development",
  "accessibilityRequirements": "None"
}
```

**2. Approve Request (Admin):**
```json
PUT /api/requests/{request_id}/approve
{
  "approvalNotes": "Approved for training"
}
```

### Step 3: Enrollment and Scheduling

**1. Enroll in Course:**
```json
POST /api/courses/{course_id}/enroll
```

**2. Create Schedule:**
```json
POST /api/schedules
{
  "course": "course_id",
  "sessionNumber": 1,
  "title": "Session 1",
  "startTime": "2024-02-01T09:00:00.000Z",
  "endTime": "2024-02-01T12:00:00.000Z",
  "location": "Room 101"
}
```

### Step 4: Resource Management

**1. Create Resource:**
```json
POST /api/resources
{
  "name": "Training Room 101",
  "type": "room",
  "capacity": 15,
  "organization": "org_id"
}
```

**2. Assign Resource to Schedule:**
```json
POST /api/resources/{resource_id}/assign/{schedule_id}
```

### Step 5: Attendance Tracking

**1. Record Attendance:**
```json
POST /api/attendance
{
  "enrollment": "enrollment_id",
  "user": "user_id",
  "course": "course_id",
  "sessionNumber": 1,
  "status": "present"
}
```

### Step 6: Feedback and Completion

**1. Submit Feedback:**
```json
POST /api/courses/{course_id}/feedback
{
  "overallRating": 5,
  "contentRating": 5,
  "instructorRating": 5,
  "commentGeneral": "Excellent course!"
}
```

**2. Update Enrollment Status:**
```json
PUT /api/enrollments/{enrollment_id}
{
  "status": "completed",
  "completionDate": "2024-02-15T17:00:00.000Z"
}
```

## 📊 Key Business Rules

### Training Requests
- Users can only have one pending/approved request per course
- Cannot request if already enrolled
- Admin approval required for enrollment

### Enrollments
- Unique enrollment per user per course
- Status transitions: enrolled → completed/dropped/failed
- Auto-completion based on attendance and course end date

### Attendance
- One attendance record per session per enrollment
- QR code verification for check-in
- Manual adjustments by trainers

### Resources
- Resources belong to organizations
- Capacity limits enforced during scheduling
- Accessibility features tracked

### Schedules
- Unique session numbers per course
- Resources assigned to sessions
- QR codes generated for attendance

## 🚀 Testing Checklist

- [ ] Create organization and users
- [ ] Create course and resources
- [ ] Submit and approve training request
- [ ] Enroll user in course
- [ ] Create session schedule
- [ ] Assign resources to schedule
- [ ] Record attendance
- [ ] Submit feedback
- [ ] Complete enrollment
- [ ] Generate reports

## 🔍 Common Issues and Solutions

### Issue: "Cannot create duplicate enrollment"
**Solution**: Check if user already enrolled or has pending request

### Issue: "Resource not available"
**Solution**: Check resource capacity and existing assignments

### Issue: "Cannot provide feedback"
**Solution**: Verify enrollment status and course completion

### Issue: "Attendance already recorded"
**Solution**: Check for existing attendance record for same session

This comprehensive analysis provides a complete understanding of the training management workflow and how to test each component effectively in Swagger. 