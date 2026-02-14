# Database Schema Documentation

## Overview
The Smart Academic Notification System uses PostgreSQL (via Supabase) for robust data management with row-level security.

## Tables

### 1. Notifications Table

**Purpose**: Store all notifications created by faculty/admins or email webhooks

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Assignment', 'Exam', 'Placement', 'Event')),
  priority text NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  deadline timestamptz NOT NULL,
  target_group text NOT NULL CHECK (target_group IN ('All', 'CSE', 'IT', 'Final Year')),
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'email')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'expired')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_metadata jsonb DEFAULT '{}'::jsonb
);
```

**Columns**:
- `id`: Unique identifier (UUID)
- `title`: Notification title (max 255 chars)
- `description`: Detailed description (text)
- `category`: One of [Assignment, Exam, Placement, Event]
- `priority`: One of [Low, Medium, High, Critical]
- `deadline`: When notification expires/due
- `target_group`: Who sees this notification (All, Department, Year)
- `source`: Whether from manual creation or email
- `status`: Current state (active, archived, expired)
- `is_read`: Whether admin/creator has read it
- `created_at`: Auto-timestamp on creation
- `updated_at`: Auto-timestamp on modification
- `created_by`: User ID of creator
- `email_metadata`: JSON metadata if from email

**Indexes**:
```sql
CREATE INDEX notifications_deadline_idx ON notifications(deadline);
CREATE INDEX notifications_priority_idx ON notifications(priority);
CREATE INDEX notifications_category_idx ON notifications(category);
CREATE INDEX notifications_created_by_idx ON notifications(created_by);
CREATE INDEX notifications_target_group_idx ON notifications(target_group);
```

### 2. Auth.Users Table (Supabase Built-in)

**Purpose**: Store user authentication and basic profile

Columns created by Supabase:
- `id`: UUID
- `email`: User email
- `encrypted_password`: Hashed password
- `user_metadata`: JSON object containing custom fields

**Custom User Metadata**:
```json
{
  "role": "student|faculty|admin",
  "department": "CSE|IT|...",
  "year": 1|2|3|4,
  "name": "User Name"
}
```

## Relationships

```
notifications.created_by → auth.users.id (Many-to-One)
```

## Row Level Security (RLS) Policies

### Notifications Table

**Policy 1: Users can view all active notifications**
```sql
CREATE POLICY "Users can view active notifications"
ON notifications
FOR SELECT
USING (status = 'active');
```

**Policy 2: Users can create notifications (with admin check)**
```sql
CREATE POLICY "Authenticated users can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

**Policy 3: Users can only delete their own notifications**
```sql
CREATE POLICY "Users can delete own notifications"
ON notifications
FOR DELETE
USING (created_by = auth.uid());
```

**Policy 4: Admin can delete any notification**
```sql
CREATE POLICY "Admin can delete any notification"
ON notifications
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND user_metadata->>'role' = 'admin'
  )
);
```

## Data Types and Constraints

### Enums (Constraints)

**Category**:
- `Assignment` - Assignment submission deadline
- `Exam` - Exam schedule/preparation
- `Placement` - Placement drive/opportunity
- `Event` - General event/announcement

**Priority**:
- `Low` - General information
- `Medium` - Moderate importance
- `High` - Important, requires attention
- `Critical` - Urgent, immediate action needed

**Target Group**:
- `All` - All students
- `CSE` - Computer Science students
- `IT` - Information Technology students
- `Final Year` - Final year students only

**Status**:
- `active` - Currently visible
- `archived` - Hidden but not deleted
- `expired` - Deadline has passed

**Source**:
- `manual` - Created by admin/faculty
- `email` - Parsed from incoming email

## Migrations

### Migration 1: Create notifications table
File: `20260213085305_create_notifications_table.sql`

### Migration 2: Enhance notifications with additional fields
File: `20260213100000_enhance_notifications_table.sql`

## Query Examples

### Get all active notifications with user's info
```sql
SELECT
  n.*,
  u.email as creator_email,
  u.user_metadata->>'name' as creator_name
FROM notifications n
LEFT JOIN auth.users u ON n.created_by = u.id
WHERE n.status = 'active'
ORDER BY n.deadline ASC;
```

### Get critical notifications due in next 3 days
```sql
SELECT *
FROM notifications
WHERE priority = 'Critical'
  AND deadline > now()
  AND deadline < now() + interval '3 days'
  AND status = 'active'
ORDER BY deadline ASC;
```

### Count notifications by category
```sql
SELECT
  category,
  COUNT(*) as count
FROM notifications
WHERE status = 'active'
GROUP BY category;
```

### Get user-specific notifications
```sql
SELECT *
FROM notifications
WHERE status = 'active'
  AND (
    target_group = 'All'
    OR target_group = $1  -- user's department
    OR (target_group = 'Final Year' AND current_setting('app.user_year')::int = 4)
  )
ORDER BY priority DESC, deadline ASC;
```

## Backup and Recovery

**Backup recommendations**:
- Daily automated backups via Supabase
- Export critical data weekly
- Test recovery procedures monthly

**Recovery procedures**:
- Use Supabase backup restore feature
- Point-in-time recovery available
- Contact Supabase support for data recovery

## Performance Optimization

### Current Indexes
- `deadline` - For sorting/filtering by deadline
- `priority` - For priority-based queries
- `category` - For category filtering
- `created_by` - For user-specific queries
- `target_group` - For group filtering

### Query Optimization
- Use indexes in WHERE clauses
- Paginate large result sets
- Use EXPLAIN ANALYZE for slow queries
-imit SELECT fields to needed columns

## Future Schema Enhancements

### Planned Additions
- `notification_reads` table - Track read status per user
- `notification_preferences` table - User notification settings
- `notification_attachments` table - Multiple file support
- `user_departments` table - Support multiple departments per user
- `notification_categories` table - Custom categories per institution

### Proposed Schema Extensions
```sql
-- Track individual read statuses
CREATE TABLE notification_reads (
  id uuid PRIMARY KEY,
  notification_id uuid REFERENCES notifications(id),
  user_id uuid REFERENCES auth.users(id),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  archived_at timestamptz
);

-- User notification preferences
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  category text,
  receive_email boolean DEFAULT true,
  receive_push boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time
);
```

## Monitoring and Maintenance

### Metrics to Monitor
- Table size growth
- Query performance
- RLS policy effectiveness
- Backup integrity
- Data consistency

### Regular Maintenance
- Monitor disk space usage
- Analyze table statistics
- Review slow queries
- Optimize indexes if needed
- Test disaster recovery

---

**Last Updated**: February 13, 2026
**Version**: 1.0.0
