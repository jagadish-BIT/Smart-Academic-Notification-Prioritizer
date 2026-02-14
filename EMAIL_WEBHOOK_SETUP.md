# Email Webhook Integration Guide

This guide explains how to integrate email notifications with the Smart Academic Notification Prioritizer.

## Overview

The application includes an Edge Function that can receive email data via webhook and automatically create notifications with intelligent parsing of:
- **Category** (Assignment, Exam, Placement, Event)
- **Priority** (Low, Medium, High, Critical)
- **Target Group** (All, CSE, IT, Final Year)
- **Deadline** (extracted from email content)
- **Key Points** (extracted from email body)

## Edge Function Endpoint

The email webhook is deployed at:
```
https://[YOUR_SUPABASE_PROJECT].supabase.co/functions/v1/email-webhook
```

## How to Use

### Option 1: Email Service Integration (e.g., SendGrid, Mailgun)

Configure your email service to forward incoming emails to the webhook endpoint as JSON:

```bash
curl -X POST https://[YOUR_SUPABASE_PROJECT].supabase.co/functions/v1/email-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "professor@university.edu",
    "subject": "Assignment Submission - Due March 15th, 2024",
    "body": "Dear Students,\n\nPlease submit your final assignment by March 15th, 2024.\n\nThis is a high priority task for all CSE students.\n\nBest regards,\nProfessor"
  }'
```

### Option 2: Gmail Integration (Zapier/Make.com)

1. Create a Zapier or Make.com automation
2. Trigger: New email in Gmail matching criteria (e.g., from specific sender, with specific label)
3. Action: Webhook POST to the edge function endpoint
4. Map email fields: from, subject, body

### Option 3: Custom Email Parser

Create your own email parser service that:
1. Monitors an email inbox (IMAP)
2. Extracts email details
3. Sends POST request to the webhook

## Email Parsing Intelligence

The webhook automatically detects:

### Category Detection
- **Assignment**: Keywords like "assignment", "homework", "submit"
- **Exam**: Keywords like "exam", "test", "quiz"
- **Placement**: Keywords like "placement", "interview", "recruitment", "job"
- **Event**: Default for other notifications

### Priority Detection
- **Critical**: Keywords like "urgent", "critical", "important"
- **High**: Keywords like "high priority", "asap"
- **Low**: Keywords like "low priority", "fyi", "optional"
- **Medium**: Default priority

### Target Group Detection
- **CSE**: Keywords like "cse", "computer science"
- **IT**: Keywords like "it", "information technology"
- **Final Year**: Keywords like "final year", "4th year", "senior"
- **All**: Default target group

### Deadline Extraction
The system attempts to extract dates from patterns like:
- "Deadline: March 15, 2024"
- "Due: 15/03/2024"
- "Submit by March 15th"

If no date is found, it defaults to 7 days from receipt.

## Example Email Format

For best results, structure emails like this:

```
Subject: [URGENT] Final Year CSE - Placement Drive on March 20th

Body:
Dear Final Year CSE Students,

Important placement drive scheduled for March 20th, 2024.

Key Details:
- Company: Tech Corp
- Date: March 20th, 2024
- Time: 10:00 AM
- Venue: Seminar Hall

Please arrive on time. This is a critical opportunity.

Best regards,
Placement Office
```

This will automatically create a notification with:
- Category: Placement
- Priority: Critical
- Target Group: Final Year + CSE
- Deadline: March 20, 2024
- All key points extracted

## Testing

Test the webhook with curl:

```bash
curl -X POST https://[YOUR_SUPABASE_PROJECT].supabase.co/functions/v1/email-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@university.edu",
    "subject": "Test Notification",
    "body": "This is a test notification to verify the webhook is working."
  }'
```

## Security

- The webhook is public (no JWT verification) to accept emails from external services
- Database security is enforced through Row Level Security (RLS)
- All notifications are visible to authenticated users
- Only creators can delete their notifications

## Troubleshooting

If notifications aren't being created:
1. Check the webhook URL is correct
2. Verify the JSON structure matches the expected format
3. Check the Supabase Edge Function logs for errors
4. Ensure the email service is sending requests properly
