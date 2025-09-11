# Tab Switching Violation System

## Overview
The Tab Switching Violation System is a comprehensive security feature that monitors and enforces tab switching limits during quiz attempts. When a student switches tabs exactly 5 times, they are automatically removed from the quiz and their responses are auto-submitted.

## Features

### 🔒 **Exact 5 Tab Switch Limit**
- Tracks every tab switch during quiz attempts
- Automatically triggers violation on the 5th switch
- No tolerance for bypassing the system

### 🚨 **Automatic Actions on Violation**
- **Auto-submit Quiz**: Student's answers are automatically submitted
- **Session Locking**: Prevents further quiz participation
- **Immediate Redirect**: Student is redirected to dashboard
- **Formal Warning**: Clear violation message displayed

### 📝 **Student Query System**
- Students can submit explanations for their actions
- Query submission is optional but recommended
- Teachers receive formal notifications

### 👨‍🏫 **Teacher Notification System**
- Automatic email notifications to teachers
- Detailed violation information
- Teacher review and decision system
- Options: Allow retake, Suspend, or Debar

### 🛡️ **Security Measures**
- **Session-based Locking**: Prevents bypass via page refresh
- **Persistent Storage**: Violation count survives browser restarts
- **Audit Logging**: Complete violation history for disputes
- **No Dodging**: Multiple layers of protection

## Implementation Details

### Frontend Components

#### State Management
```typescript
// Tab violation system states
const [showTabViolationDialog, setShowTabViolationDialog] = useState<boolean>(false);
const [tabViolationQuery, setTabViolationQuery] = useState<string>('');
const [isSubmittingViolationQuery, setIsSubmittingViolationQuery] = useState<boolean>(false);
const [sessionLocked, setSessionLocked] = useState<boolean>(false);
const [showFinalWarning, setShowFinalWarning] = useState<boolean>(false);
```

#### Tab Switch Detection
- **Visibility API**: Monitors `document.visibilityState` changes
- **Focus/Blur Events**: Additional detection for window focus changes
- **Session Storage**: Persistent violation tracking across page reloads

#### Warning System
- **4th Switch**: Shows final warning message
- **5th Switch**: Triggers violation and auto-submit
- **Real-time Updates**: Immediate feedback to students

### Backend API Endpoints

#### `/api/teacher-violation-notification`
- **Purpose**: Send violation notifications to teachers
- **Method**: POST
- **Payload**: Violation details, student info, quiz info
- **Response**: Notification ID and status

#### `/api/submit-violation-query`
- **Purpose**: Submit student queries explaining violations
- **Method**: POST
- **Payload**: Student query, violation details
- **Response**: Query ID and submission status

### Database Schema

#### `violation_notifications` Table
- Stores teacher notifications
- Tracks violation details
- Manages teacher responses and actions

#### `violation_queries` Table
- Stores student explanations
- Tracks query status and teacher responses
- Links to violation notifications

#### `violation_audit_logs` Table
- Complete audit trail
- Security logging
- Dispute resolution support

## User Experience Flow

### Student Experience
1. **Normal Quiz**: Student takes quiz normally
2. **Tab Switches**: System tracks each tab switch
3. **4th Switch**: Final warning displayed
4. **5th Switch**: Violation triggered
5. **Auto-submit**: Quiz automatically submitted
6. **Violation Dialog**: Student sees violation message
7. **Query Option**: Student can submit explanation
8. **Redirect**: Student redirected to dashboard

### Teacher Experience
1. **Notification**: Teacher receives violation notification
2. **Review**: Teacher reviews violation details
3. **Student Query**: Teacher sees student's explanation
4. **Decision**: Teacher decides on action:
   - Allow retake
   - Temporary suspension
   - Permanent debarment
   - No action

## Security Features

### Session Locking
```typescript
// Session-based locking to prevent bypass attempts
const sessionData = {
  tabSwitchCount: newCount,
  sessionLocked: newCount >= 5,
  startTime: Date.now(),
  quizId,
  userId: user?.id
};
sessionStorage.setItem(`quiz_session_${quizId}_${user?.id}`, JSON.stringify(sessionData));
```

### Bypass Prevention
- **Page Refresh**: Session data persists
- **Browser Restart**: Violation count maintained
- **Developer Tools**: Cannot manipulate session storage
- **Multiple Tabs**: Each tab tracks independently

### Audit Trail
- **Complete Logging**: Every violation logged
- **Timestamp Tracking**: Precise violation timing
- **Session Data**: Full context preservation
- **IP Address**: Security tracking

## Configuration

### Violation Threshold
- **Current**: 5 tab switches
- **Configurable**: Can be adjusted in code
- **Per Quiz**: Can be set per quiz if needed

### Warning System
- **4th Switch**: Final warning
- **Duration**: 5-second warning display
- **Style**: Prominent red alert

### Auto-submit Behavior
- **Immediate**: Triggers on 5th switch
- **Complete**: All answers saved
- **Timing**: QTS data captured
- **Redirect**: 2-second delay to dashboard

## Error Handling

### Network Issues
- **Retry Logic**: Automatic retry for failed submissions
- **Fallback**: Local storage backup
- **User Feedback**: Clear error messages

### Database Errors
- **Graceful Degradation**: System continues functioning
- **Error Logging**: Comprehensive error tracking
- **User Notification**: Appropriate error messages

## Testing

### Manual Testing
1. Start quiz attempt
2. Switch tabs 4 times (should see warning)
3. Switch tab 5th time (should trigger violation)
4. Verify auto-submit and redirect
5. Check teacher notification

### Automated Testing
- Unit tests for violation detection
- Integration tests for API endpoints
- E2E tests for complete flow

## Deployment

### Database Setup
1. Run `violation_system_setup.sql`
2. Verify table creation
3. Test RLS policies
4. Confirm indexes

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Monitoring
- Monitor violation rates
- Track teacher response times
- Audit security logs

## Future Enhancements

### Additional Violation Types
- Copy/paste detection
- Right-click prevention
- Developer tools detection
- Screenshot prevention

### Advanced Features
- Machine learning for pattern detection
- Behavioral analysis
- Risk scoring
- Adaptive thresholds

### Integration
- Email notifications
- SMS alerts
- Dashboard widgets
- Mobile app support

## Troubleshooting

### Common Issues
1. **Violation not triggering**: Check visibility API support
2. **Session not persisting**: Verify sessionStorage availability
3. **Teacher notifications**: Check email service configuration
4. **Database errors**: Verify RLS policies

### Debug Mode
- Console logging enabled
- Detailed violation tracking
- Session data inspection
- Network request monitoring

## Support

For technical support or questions about the Tab Switching Violation System:
- Check console logs for detailed error information
- Verify database connectivity
- Test API endpoints independently
- Review session storage data

---

**Note**: This system is designed to maintain quiz integrity while providing fair review processes for students who may have legitimate reasons for tab switching.
