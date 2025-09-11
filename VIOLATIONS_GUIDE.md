# Violations Dashboard Guide

## 🔍 Finding the Action Buttons

### **Step 1: Access the Violations Dashboard**
1. Go to **Teacher Dashboard** (as a teacher user)
2. Click on **"Violations"** in the navigation menu
3. You should see the violations management page

### **Step 2: Create Test Data**
If you don't see any violations:
1. Click **"Create Test Violation"** button (blue button)
2. This will create a sample violation with status "pending_review"
3. Click **"Refresh"** to reload the violations list

### **Step 3: Locate the Action Buttons**
The action buttons are in the **"Actions"** column (rightmost column) of the violations table:

- **👁️ View Details** - Blue eye icon (always visible)
- **✅ Approve** - Green checkmark (only for pending_review status)
- **🔄 Retake** - Blue refresh icon (only for pending_review status)  
- **🚫 Debar** - Red block icon (only for pending_review status)
- **⚠️ Take Action** - Orange warning icon (only for pending_review status)

### **Step 4: Understanding Button States**
- **Enabled (colored)**: Available for violations with "pending_review" status
- **Disabled (grayed out)**: Not available for processed violations
- **Hover**: Shows tooltip with action description

## 🛠️ Troubleshooting

### **If you don't see any violations:**
1. Check the **Debug Info** box (blue box above the table)
2. It shows: "Found X violations. Pending reviews: Y"
3. If X = 0, click "Create Test Violation"
4. If Y = 0, all violations are already processed

### **If action buttons are grayed out:**
- The violation status is not "pending_review"
- Only violations awaiting teacher action show active buttons
- Use "Create Test Violation" to generate a test case

### **If you see database errors:**
1. Click **"Check Database Schema"** button
2. Check browser console for detailed error messages
3. Ensure the `minimal_fix.sql` script was run successfully

## 📋 Available Actions

### **Quick Actions (One-click)**
- **Approve**: Immediately approves and releases student results
- **Retake**: Allows student to retake the quiz
- **Debar**: Permanently suspends the student (with confirmation)

### **Detailed Action (Full Dialog)**
- **Take Action**: Opens dialog with response field
- Allows you to write a message to the student
- All three actions available with explanations

## 🎯 Expected Workflow

1. **Student violates** → Tab switching detected
2. **System creates** → Violation record with "pending_review" status
3. **Teacher sees** → Violation in dashboard with active action buttons
4. **Teacher acts** → Clicks appropriate action button
5. **System updates** → Violation status and student access accordingly

## 🔧 Debug Information

The debug info box shows:
- Total number of violations found
- Number of violations pending review
- All violation statuses in the system

This helps identify if the issue is:
- No violations in database
- Wrong violation status
- Database connection issues
