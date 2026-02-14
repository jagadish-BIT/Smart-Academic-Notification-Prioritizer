/**
 * Application Constants
 * Centralized configuration and enumeration values
 */

export const DEPARTMENTS = [
  'Agricultural Engineering',
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence and Machine Learning',
  'Biomedical Engineering',
  'Biotechnology',
  'Chemistry',
  'Civil Engineering',
  'Computer Science and Business Systems',
  'Computer Science and Design',
  'Computer Science and Engineering',
  'Computer Technology',
  'Electrical and Electronics Engineering',
  'Electronics and Communication Engineering',
  'Electronics and Instrumentation Engineering',
  'Fashion Technology',
  'Food Technology',
  'Humanities',
  'Information Science and Engineering',
  'Information Technology',
  'Mathematics',
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Physics',
  'Physical Education',
  'School of Management Studies',
  'Textile Technology',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const NOTIFICATION_CATEGORIES = [
  'Assignment',
  'Exam',
  'Placement',
  'Event',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const PRIORITY_LEVELS = [
  'Critical',
  'High',
  'Medium',
  'Low',
] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const TARGET_GROUPS = [
  'All',
  'Department',
  'Year',
] as const;

export type TargetGroup = (typeof TARGET_GROUPS)[number];

export const NOTIFICATION_STATUSES = [
  'draft',
  'published',
  'archived',
  'deleted',
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
