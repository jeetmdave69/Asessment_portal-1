import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ViolationEmailData {
  teacherName: string;
  teacherEmail: string;
  studentName: string;
  quizTitle: string;
  violationCount: number;
  violationTimestamp: string;
  studentQuery: string;
  reviewLink: string;
}

export async function sendViolationNotificationEmail(data: ViolationEmailData) {
  try {
    console.log('📧 Sending violation notification email to:', data.teacherEmail);
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'OctoMind Assessment Portal <noreply@octomind.com>',
      to: [data.teacherEmail],
      subject: 'Student Flagged for Suspicious Activity (Tab Switching)',
      html: generateViolationEmailHTML(data),
      text: generateViolationEmailText(data),
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', emailData);
    return { success: true, messageId: emailData?.id };
  } catch (error) {
    console.error('❌ Email service error:', error);
    throw error;
  }
}

function generateViolationEmailHTML(data: ViolationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student Violation Alert</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e74c3c;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .alert-icon {
          font-size: 48px;
          color: #e74c3c;
          margin-bottom: 15px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #e74c3c;
          margin: 0;
        }
        .content {
          margin-bottom: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .violation-details {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #2c3e50;
          min-width: 120px;
        }
        .detail-value {
          color: #4a5568;
        }
        .student-query {
          background: #f7fafc;
          border-left: 4px solid #3182ce;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .query-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        .query-text {
          font-style: italic;
          color: #4a5568;
        }
        .actions {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .action-title {
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 15px;
        }
        .action-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .action-item {
          margin-bottom: 8px;
          color: #4a5568;
        }
        .action-item::before {
          content: "• ";
          color: #3182ce;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          background: #e74c3c;
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .cta-button:hover {
          background: #c0392b;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #718096;
          font-size: 14px;
        }
        .timestamp {
          color: #718096;
          font-size: 14px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OctoMind</div>
          <div class="alert-icon">⚠️</div>
          <h1 class="title">Student Flagged for Suspicious Activity</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Dear ${data.teacherName},</p>
          
          <p><strong>${data.studentName}</strong> has been flagged for switching tabs exactly <strong>${data.violationCount} times</strong> during the quiz "<strong>${data.quizTitle}</strong>". As a result, the quiz has been automatically submitted with the answers they provided up until the flagging point.</p>
          
          <div class="violation-details">
            <div class="detail-row">
              <span class="detail-label">Student:</span>
              <span class="detail-value">${data.studentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Quiz:</span>
              <span class="detail-value">${data.quizTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tab Switches:</span>
              <span class="detail-value">${data.violationCount} times</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Violation Time:</span>
              <span class="detail-value">${new Date(data.violationTimestamp).toLocaleString()}</span>
            </div>
          </div>
          
          ${data.studentQuery ? `
          <div class="student-query">
            <div class="query-label">Student's Explanation:</div>
            <div class="query-text">"${data.studentQuery}"</div>
          </div>
          ` : ''}
          
          <p>The student has submitted a query explaining their actions. Please review the query and take the appropriate action.</p>
          
          <div class="actions">
            <div class="action-title">Available Actions:</div>
            <ul class="action-list">
              <li class="action-item">Allow the student to retake the quiz</li>
              <li class="action-item">Debar the student permanently from the quiz or from the portal</li>
              <li class="action-item">Approve the current submission and release marks</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.reviewLink}" class="cta-button">Review Query and Decide Action</a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br><strong>OctoMind Assessment Portal</strong></p>
          <div class="timestamp">
            This notification was sent on ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateViolationEmailText(data: ViolationEmailData): string {
  return `
Student Flagged for Suspicious Activity (Tab Switching)

Dear ${data.teacherName},

${data.studentName} has been flagged for switching tabs exactly ${data.violationCount} times during the quiz "${data.quizTitle}". As a result, the quiz has been automatically submitted with the answers they provided up until the flagging point.

VIOLATION DETAILS:
- Student: ${data.studentName}
- Quiz: ${data.quizTitle}
- Tab Switches: ${data.violationCount} times
- Violation Time: ${new Date(data.violationTimestamp).toLocaleString()}

${data.studentQuery ? `STUDENT'S EXPLANATION:
"${data.studentQuery}"` : ''}

The student has submitted a query explaining their actions. Please review the query and take the appropriate action.

AVAILABLE ACTIONS:
• Allow the student to retake the quiz
• Debar the student permanently from the quiz or from the portal
• Approve the current submission and release marks

Review Query and Decide Action: ${data.reviewLink}

Best regards,
OctoMind Assessment Portal

This notification was sent on ${new Date().toLocaleString()}
  `;
}
