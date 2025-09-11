# Email Notification Setup Guide

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Resend Setup

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get API Key**: 
   - Go to API Keys section in your Resend dashboard
   - Create a new API key
   - Copy the key and add it to your `.env.local` file
3. **Verify Domain** (for production):
   - Add your domain in Resend dashboard
   - Update the `from` email in `lib/email.ts` to use your verified domain

## Email Template Features

The violation notification email includes:

- **Professional Design**: Clean, responsive HTML template
- **Violation Details**: Student name, quiz title, tab switch count, timestamp
- **Student Query**: If the student provided an explanation
- **Action Options**: Clear list of available actions
- **Direct Link**: Button to review and take action
- **Fallback Text**: Plain text version for email clients

## Testing

1. **Development**: Emails will be sent to the console in development mode
2. **Production**: Configure Resend API key for actual email delivery
3. **Test Button**: Use the "Create Test Violation" button in the violations dashboard

## Email Content

The email follows this structure:

```
Subject: Student Flagged for Suspicious Activity (Tab Switching)

Dear [Teacher's Name],

[Student's Name] has been flagged for switching tabs exactly 5 times during the quiz. 
As a result, the quiz has been automatically submitted with the answers they provided 
up until the flagging point.

The student has submitted a query explaining their actions. Please review the query 
and take the appropriate action.

Options:
- Allow the student to retake the quiz
- Debar the student permanently from the quiz or from the portal
- Approve the current submission and release marks

[Link to Review Query and Decide Action]

Best regards,
OctoMind Assessment Portal
```
