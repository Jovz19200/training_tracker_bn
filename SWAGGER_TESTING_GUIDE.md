# Swagger Testing Guide - Training Management System

## 🚀 Quick Start

1. **Start the server**: `npm start`
2. **Open Swagger UI**: `http://localhost:5000/api-docs`
3. **Authenticate**: Use the `/api/auth/login` endpoint to get a JWT token
4. **Test endpoints**: Follow the workflow below

## 🔐 Authentication Setup

### Step 1: Get Authentication Token

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Next Steps**:
1. Copy the token from the response
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer YOUR_TOKEN_HERE`
4. Click "Authorize"

## 📋 Complete Testing Workflow

### Phase 1: Setup Foundation Data

#### 1.1 Create Organization

**Endpoint**: `POST /api/organizations`

**Request Body**:
```json
{
  "name": "Tech Training Institute",
  "description": "Professional training organization for technology courses",
  "address": "123 Training Street, Tech City",
  "contactEmail": "info@techtraining.com",
  "contactPhone": "+1-555-0123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "org_id_here",
    "name": "Tech Training Institute",
    "description": "Professional training organization for technology courses"
  }
}
```

**Save the organization ID** for use in subsequent requests.

#### 1.2 Create Trainer User

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@techtraining.com",
  "password": "trainer123",
  "role": "trainer",
  "organization": "org_id_from_step_1"
}
```

#### 1.3 Create Trainee User

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "firstName": "Mike",
  "lastName": "Chen",
  "email": "mike.chen@company.com",
  "password": "trainee123",
  "role": "trainee",
  "organization": "org_id_from_step_1"
}
```

### Phase 2: Course Management

#### 2.1 Create Course

**Endpoint**: `POST /api/courses`

**Request Body**:
```json
{
  "title": "Advanced JavaScript Development",
  "description": "Comprehensive course covering modern JavaScript, ES6+, and frameworks",
  "startDate": "2024-03-01T09:00:00.000Z",
  "endDate": "2024-03-15T17:00:00.000Z",
  "capacity": 15,
  "instructor": "trainer_user_id_here",
  "organization": "org_id_here",
  "price": 750,
  "category": "Programming",
  "level": "Advanced",
  "prerequisites": "Basic JavaScript knowledge",
  "objectives": [
    "Master ES6+ features",
    "Learn modern frameworks",
    "Build real-world applications"
  ]
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "course_id_here",
    "title": "Advanced JavaScript Development",
    "code": "JS-ADV-001",
    "status": "scheduled"
  }
}
```

**Save the course ID** for use in subsequent requests.

#### 2.2 Create Resources

**Endpoint**: `POST /api/resources`

**Request Body**:
```json
{
  "name": "Training Lab A",
  "type": "room",
  "description": "Computer lab with 20 workstations",
  "capacity": 20,
  "location": "Building 1, Floor 2, Room 201",
  "organization": "org_id_here",
  "availability": true,
  "accessibilityFeatures": [
    "wheelchair_accessible",
    "adjustable_lighting",
    "assistive_technology"
  ]
}
```

**Create another resource**:
```json
{
  "name": "Projector System 1",
  "type": "equipment",
  "description": "High-definition projector with sound system",
  "capacity": null,
  "location": "Training Lab A",
  "organization": "org_id_here",
  "availability": true,
  "accessibilityFeatures": ["closed_captioning"]
}
```

### Phase 3: Training Request Workflow

#### 3.1 Submit Training Request (as Trainee)

**Switch to trainee token** and use:

**Endpoint**: `POST /api/requests`

**Request Body**:
```json
{
  "course": "course_id_here",
  "justification": "Need advanced JavaScript skills for upcoming project work. This will help me contribute more effectively to our frontend development team.",
  "accessibilityRequirements": "None required"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "request_id_here",
    "status": "pending",
    "requestDate": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3.2 Approve Training Request (as Admin)

**Switch back to admin token** and use:

**Endpoint**: `PUT /api/requests/{request_id}/approve`

**Request Body**:
```json
{
  "approvalNotes": "Approved based on performance review and project requirements. Mike has shown good progress in basic JavaScript and is ready for advanced training."
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "request_id_here",
    "status": "approved",
    "approvalDate": "2024-01-15T14:00:00.000Z",
    "approver": "admin_user_id_here"
  }
}
```

### Phase 4: Enrollment Management

#### 4.1 Enroll in Course (as Trainee)

**Switch to trainee token** and use:

**Endpoint**: `POST /api/courses/{course_id}/enroll`

**No request body needed**

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "enrollment_id_here",
    "status": "enrolled",
    "enrollmentDate": "2024-01-15T15:00:00.000Z"
  }
}
```

#### 4.2 View Enrollment Details

**Endpoint**: `GET /api/enrollments/{enrollment_id}`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "enrollment_id_here",
    "user": {
      "firstName": "Mike",
      "lastName": "Chen",
      "email": "mike.chen@company.com"
    },
    "course": {
      "title": "Advanced JavaScript Development",
      "code": "JS-ADV-001"
    },
    "status": "enrolled",
    "enrollmentDate": "2024-01-15T15:00:00.000Z"
  }
}
```

### Phase 5: Schedule Management

#### 5.1 Create Course Schedule (as Trainer)

**Switch to trainer token** and use:

**Endpoint**: `POST /api/schedules`

**Request Body**:
```json
{
  "course": "course_id_here",
  "sessionNumber": 1,
  "title": "Introduction to ES6+ Features",
  "description": "Overview of modern JavaScript features including arrow functions, destructuring, and modules",
  "startTime": "2024-03-01T09:00:00.000Z",
  "endTime": "2024-03-01T12:00:00.000Z",
  "location": "Training Lab A",
  "isVirtual": false,
  "trainer": "trainer_user_id_here",
  "resources": ["resource_id_1", "resource_id_2"],
  "materials": [
    {
      "title": "ES6+ Cheat Sheet",
      "fileUrl": "https://example.com/es6-cheatsheet.pdf",
      "fileType": "pdf"
    }
  ]
}
```

**Create additional sessions**:
```json
{
  "course": "course_id_here",
  "sessionNumber": 2,
  "title": "Advanced Functions and Closures",
  "description": "Deep dive into function programming concepts",
  "startTime": "2024-03-02T09:00:00.000Z",
  "endTime": "2024-03-02T12:00:00.000Z",
  "location": "Training Lab A",
  "isVirtual": false,
  "trainer": "trainer_user_id_here"
}
```

#### 5.2 View Course Schedule

**Endpoint**: `GET /api/schedules/course/{course_id}`

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "schedule_id_1",
      "sessionNumber": 1,
      "title": "Introduction to ES6+ Features",
      "startTime": "2024-03-01T09:00:00.000Z",
      "endTime": "2024-03-01T12:00:00.000Z",
      "status": "scheduled"
    },
    {
      "_id": "schedule_id_2",
      "sessionNumber": 2,
      "title": "Advanced Functions and Closures",
      "startTime": "2024-03-02T09:00:00.000Z",
      "endTime": "2024-03-02T12:00:00.000Z",
      "status": "scheduled"
    }
  ]
}
```

#### 5.3 Generate QR Code for Session

**Endpoint**: `GET /api/schedules/{schedule_id}/qrcode`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "sessionId": "schedule_id_here",
    "sessionNumber": 1
  }
}
```

### Phase 6: Attendance Tracking

#### 6.1 Record Attendance (as Trainer)

**Endpoint**: `POST /api/attendance`

**Request Body**:
```json
{
  "enrollment": "enrollment_id_here",
  "user": "trainee_user_id_here",
  "course": "course_id_here",
  "sessionNumber": 1,
  "status": "present",
  "checkInTime": "2024-03-01T09:02:00.000Z",
  "checkOutTime": "2024-03-01T11:58:00.000Z",
  "duration": 176,
  "notes": "Arrived 2 minutes late, participated actively throughout session",
  "verificationMethod": "qr"
}
```

**Record attendance for session 2**:
```json
{
  "enrollment": "enrollment_id_here",
  "user": "trainee_user_id_here",
  "course": "course_id_here",
  "sessionNumber": 2,
  "status": "present",
  "checkInTime": "2024-03-02T08:55:00.000Z",
  "checkOutTime": "2024-03-02T12:00:00.000Z",
  "duration": 185,
  "notes": "Arrived early, excellent participation",
  "verificationMethod": "qr"
}
```

#### 6.2 View Attendance Records

**Endpoint**: `GET /api/attendance/session/{schedule_id}`

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "attendance_id_here",
      "user": {
        "firstName": "Mike",
        "lastName": "Chen"
      },
      "status": "present",
      "checkInTime": "2024-03-01T09:02:00.000Z",
      "duration": 176
    }
  ]
}
```

### Phase 7: Feedback and Completion

#### 7.1 Submit Course Feedback (as Trainee)

**Switch to trainee token** and use:

**Endpoint**: `POST /api/courses/{course_id}/feedback`

**Request Body**:
```json
{
  "overallRating": 5,
  "contentRating": 5,
  "instructorRating": 5,
  "facilitiesRating": 4,
  "accessibilityRating": 5,
  "commentContent": "The course content was excellent and well-structured. The ES6+ features were explained clearly with practical examples.",
  "commentInstructor": "Sarah is a fantastic instructor. She explains complex concepts in an easy-to-understand way and provides great real-world examples.",
  "commentGeneral": "This course exceeded my expectations. I learned a lot and feel confident applying these concepts in my work.",
  "suggestions": "Maybe add more hands-on exercises for the advanced topics.",
  "isAnonymous": false
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "feedback_id_here",
    "overallRating": 5,
    "submissionDate": "2024-03-15T16:00:00.000Z",
    "metadata": {
      "enrollmentStatus": "enrolled",
      "feedbackReason": "Has attended course sessions",
      "autoCompleted": false
    }
  }
}
```

#### 7.2 Update Enrollment Status (as Admin)

**Switch to admin token** and use:

**Endpoint**: `PUT /api/enrollments/{enrollment_id}`

**Request Body**:
```json
{
  "status": "completed",
  "completionDate": "2024-03-15T17:00:00.000Z",
  "notes": "Successfully completed all sessions with excellent attendance and participation. Ready for advanced JavaScript development work."
}
```

### Phase 8: Analytics and Reports

#### 8.1 Get Course Statistics

**Endpoint**: `GET /api/enrollments/course/{course_id}/stats`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "total": 1,
    "enrolled": 0,
    "completed": 1,
    "dropped": 0,
    "failed": 0,
    "averageAttendance": 100,
    "completionRate": 100
  }
}
```

#### 8.2 Get Dashboard Analytics

**Endpoint**: `GET /api/analytics/dashboard`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 3,
      "totalCourses": 1,
      "activeEnrollments": 0,
      "completionRate": 100
    },
    "recentActivity": {
      "newUsersThisMonth": 3,
      "newCoursesThisMonth": 1,
      "newEnrollmentsThisMonth": 1
    },
    "ratings": {
      "overall": 5,
      "content": 5,
      "instructor": 5,
      "totalFeedback": 1
    }
  }
}
```

## 🔍 Testing Scenarios

### Scenario 1: Duplicate Enrollment Prevention

1. Try to enroll the same user in the same course twice
2. **Expected**: Error message about duplicate enrollment

### Scenario 2: Resource Availability

1. Try to assign a resource that's already assigned to another session
2. **Expected**: Error message about resource unavailability

### Scenario 3: Permission Testing

1. Try to approve a training request as a trainee
2. **Expected**: 403 Forbidden error

### Scenario 4: Status Validation

1. Try to update an enrollment status to an invalid value
2. **Expected**: Validation error

## 📊 Expected Data Flow

```
User Registration → Organization Creation → Course Creation → 
Training Request → Approval → Enrollment → Scheduling → 
Attendance Tracking → Feedback → Completion → Analytics
```

## 🚨 Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden - Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

## ✅ Testing Checklist

- [ ] Authentication and authorization
- [ ] Organization and user creation
- [ ] Course creation and management
- [ ] Training request workflow
- [ ] Enrollment process
- [ ] Schedule creation and management
- [ ] Resource assignment
- [ ] Attendance tracking
- [ ] Feedback submission
- [ ] Status updates
- [ ] Analytics and reporting
- [ ] Error handling
- [ ] Permission validation

This guide provides a complete testing workflow for the Training Management System using Swagger UI. 