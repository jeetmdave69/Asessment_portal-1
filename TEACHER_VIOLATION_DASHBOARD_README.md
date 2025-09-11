# Teacher Violation Dashboard System

## Overview
The Teacher Violation Dashboard is a comprehensive management system that allows teachers to review student violations, handle queries, and take appropriate actions including releasing marks, allowing retakes, or debarring students.

## Features

### 🔍 **Violation Management**
- **View All Violations**: Complete list of student violations
- **Filter by Status**: Pending, Query Submitted, Reviewed, Resolved
- **Filter by Type**: Tab Switching, Copy/Paste, Right Click, Dev Tools
- **Detailed View**: Full violation information and context

### 📝 **Student Query Handling**
- **Review Student Explanations**: Read student queries explaining violations
- **Query Status Tracking**: Track query submission and review status
- **Response System**: Provide teacher responses to student queries

### ⚖️ **Teacher Actions**
- **Release Marks**: Allow students to see their quiz results
- **Allow Retake**: Grant permission for students to retake the quiz
- **Temporary Suspend**: Suspend student account for a period
- **Permanent Debar**: Permanently debar student from portal
- **No Action**: Mark as reviewed without specific action

### 🔔 **Notification System**
- **Automatic Notifications**: Send notifications to students about actions
- **Status Updates**: Keep students informed about their violation status
- **Action Feedback**: Provide clear communication about teacher decisions

## Implementation Details

### Frontend Components

#### Teacher Dashboard Page (`/app/teacher/violations/page.tsx`)
- **Violation List**: Table showing all violations with filtering
- **Query List**: Table showing student queries with status
- **Details Modal**: Detailed view of violation information
- **Action Modal**: Interface for taking teacher actions
- **Professional UI**: Uses Inter font and formal design [[memory:8037780]]

#### Key Features:
- **Real-time Updates**: Automatic refresh after actions
- **Responsive Design**: Works on all device sizes
- **Professional Styling**: Consistent with project design standards
- **User-friendly Interface**: Intuitive navigation and actions

### Backend API Endpoints

#### `/api/teacher-violations`
- **Purpose**: Fetch violations for a specific teacher
- **Method**: GET
- **Parameters**: `teacher_id`
- **Response**: List of violation notifications

#### `/api/teacher-violation-queries`
- **Purpose**: Fetch student queries for a specific teacher
- **Method**: GET
- **Parameters**: `teacher_id`
- **Response**: List of violation queries

#### `/api/teacher-violation-action`
- **Purpose**: Submit teacher actions on violations
- **Method**: POST
- **Payload**: Violation ID, teacher response, action type
- **Response**: Updated violation and query records

#### `/api/student-notifications`
- **Purpose**: Manage student notifications
- **Methods**: GET (fetch), PATCH (update status)
- **Parameters**: `student_id`
- **Response**: List of notifications or updated status

### Database Schema

#### `student_notifications` Table
- Stores notifications sent to students
- Tracks notification status (unread, read, archived)
- Links to teachers, students, and quizzes

#### `user_suspensions` Table
- Stores user suspension records
- Tracks suspension type (temporary, permanent)
- Manages suspension periods and status

#### `quiz_retakes` Table
- Stores quiz retake permissions
- Tracks retake status and attempts
- Links to original quiz attempts

## User Experience Flow

### Teacher Experience
1. **Access Dashboard**: Navigate to `/teacher/violations`
2. **View Violations**: See list of all student violations
3. **Filter Results**: Use filters to find specific violations
4. **View Details**: Click to see detailed violation information
5. **Review Query**: Read student explanation if provided
6. **Take Action**: Choose appropriate action and provide response
7. **Submit Decision**: Submit action and response
8. **Monitor Results**: Track action outcomes and student responses

### Student Experience
1. **Receive Notification**: Get notification about teacher action
2. **View Decision**: See teacher response and action taken
3. **Take Next Steps**: Follow instructions based on action
   - **Retake**: Attempt quiz again
   - **Suspension**: Wait for suspension period
   - **Debarment**: Contact admin for appeal

## Teacher Actions Explained

### 🎯 **Release Marks**
- **Purpose**: Allow student to see their quiz results
- **Effect**: Student can view their score and answers
- **Use Case**: When violation doesn't affect quiz validity

### 🔄 **Allow Retake**
- **Purpose**: Grant permission for student to retake quiz
- **Effect**: Student gets new attempt at the quiz
- **Use Case**: When student has legitimate reason for violation

### ⏸️ **Temporary Suspend**
- **Purpose**: Suspend student account for a period
- **Effect**: Student cannot access portal for specified time
- **Use Case**: For repeated violations or serious misconduct

### 🚫 **Permanent Debar**
- **Purpose**: Permanently remove student from portal
- **Effect**: Student loses all access to the system
- **Use Case**: For severe violations or repeated misconduct

### ✅ **No Action**
- **Purpose**: Mark violation as reviewed without specific action
- **Effect**: Case is closed, no additional consequences
- **Use Case**: When violation is minor or excusable

## Security Features

### Access Control
- **Teacher-only Access**: Only teachers can access violation dashboard
- **Own Violations Only**: Teachers only see violations for their quizzes
- **Secure API**: All endpoints require proper authentication

### Data Protection
- **Row Level Security**: Database-level access control
- **Audit Trail**: Complete action history tracking
- **Secure Updates**: All changes are logged and tracked

### Notification Security
- **Student Privacy**: Notifications only visible to intended student
- **Teacher Verification**: Actions verified against teacher permissions
- **System Integrity**: All actions are logged for audit purposes

## Configuration

### Dashboard Settings
- **Items Per Page**: Configurable table pagination
- **Filter Options**: Customizable filter categories
- **Notification Settings**: Configurable notification preferences

### Action Settings
- **Suspension Periods**: Configurable suspension durations
- **Retake Limits**: Configurable retake attempt limits
- **Notification Templates**: Customizable notification messages

## Monitoring and Analytics

### Teacher Dashboard Metrics
- **Violation Count**: Total violations by type
- **Action Statistics**: Distribution of teacher actions
- **Response Times**: Average time to review violations
- **Student Compliance**: Retake success rates

### System Analytics
- **Violation Trends**: Patterns in violation types
- **Teacher Effectiveness**: Action outcome analysis
- **Student Behavior**: Violation frequency analysis
- **System Performance**: Dashboard usage statistics

## Troubleshooting

### Common Issues
1. **Violations Not Loading**: Check teacher permissions
2. **Actions Not Submitting**: Verify API connectivity
3. **Notifications Not Sending**: Check notification service
4. **Database Errors**: Verify RLS policies

### Debug Mode
- **Console Logging**: Detailed error information
- **API Response Logging**: Request/response tracking
- **Database Query Logging**: SQL query monitoring
- **User Action Logging**: Complete action audit trail

## Future Enhancements

### Advanced Features
- **Bulk Actions**: Handle multiple violations at once
- **Automated Responses**: AI-powered response suggestions
- **Advanced Analytics**: Detailed violation analytics
- **Integration**: Connect with external systems

### User Experience
- **Mobile App**: Native mobile application
- **Real-time Updates**: Live violation notifications
- **Advanced Filtering**: More sophisticated filter options
- **Custom Dashboards**: Personalized dashboard layouts

## Support

For technical support or questions about the Teacher Violation Dashboard:
- Check console logs for detailed error information
- Verify database connectivity and permissions
- Test API endpoints independently
- Review RLS policies and user roles

---

**Note**: This system is designed to provide teachers with comprehensive tools to manage student violations while maintaining fairness and transparency in the review process.
