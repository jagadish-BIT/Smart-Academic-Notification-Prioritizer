/**
 * Smart Priority Logic Utility
 * Calculates notification priority based on deadline and category
 */

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type NotificationCategory = 'Assignment' | 'Exam' | 'Placement' | 'Event';

/**
 * Calculate days remaining until deadline
 */
export const getDaysUntilDeadline = (deadline: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if deadline has passed
 */
export const isExpired = (deadline: string): boolean => {
  return getDaysUntilDeadline(deadline) < 0;
};

/**
 * Get category weight for priority calculation
 * Placement notifications get highest weight
 * Exam notifications get higher weight
 */
export const getCategoryWeight = (category: NotificationCategory): number => {
  switch (category) {
    case 'Placement':
      return 4; // Highest weight
    case 'Exam':
      return 3;
    case 'Assignment':
      return 2;
    case 'Event':
      return 1; // Lowest weight
    default:
      return 1;
  }
};

/**
 * Smart Priority Logic
 * Calculates priority based on:
 * - Deadline proximity (most important)
 * - Category type (Placement > Exam > Assignment > Event)
 * - Custom override if needed
 */
export const calculateSmartPriority = (
  deadline: string,
  category: NotificationCategory,
  manualOverride?: PriorityLevel
): PriorityLevel => {
  // If manually overridden, use that
  if (manualOverride && manualOverride !== 'Low') {
    return manualOverride;
  }

  const daysRemaining = getDaysUntilDeadline(deadline);
  const categoryWeight = getCategoryWeight(category);

  // If expired, it's critical
  if (daysRemaining < 0) {
    return 'Critical';
  }

  // Deadline-based priority
  if (daysRemaining <= 1) {
    return 'Critical';
  }
  if (daysRemaining <= 2) {
    return categoryWeight >= 3 ? 'Critical' : 'High';
  }
  if (daysRemaining <= 5) {
    return categoryWeight >= 3 ? 'High' : 'Medium';
  }
  if (daysRemaining <= 10) {
    return categoryWeight >= 4 ? 'High' : 'Medium';
  }

  // Default based on category
  return categoryWeight >= 3 ? 'Medium' : 'Low';
};

/**
 * Get priority color for UI display
 */
export const getPriorityColor = (
  priority: PriorityLevel
): {
  bg: string;
  text: string;
  border: string;
} => {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        border: 'border-red-500',
      };
    case 'High':
      return {
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        border: 'border-orange-500',
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        border: 'border-yellow-500',
      };
    case 'Low':
      return {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-500',
      };
    default:
      return {
        bg: 'bg-gray-500',
        text: 'text-gray-600',
        border: 'border-gray-500',
      };
  }
};

/**
 * Get category color for UI display
 */
export const getCategoryColor = (category: NotificationCategory): string => {
  switch (category) {
    case 'Assignment':
      return 'bg-blue-500/20 text-blue-300 border-blue-400';
    case 'Exam':
      return 'bg-purple-500/20 text-purple-300 border-purple-400';
    case 'Placement':
      return 'bg-green-500/20 text-green-300 border-green-400';
    case 'Event':
      return 'bg-pink-500/20 text-pink-300 border-pink-400';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-400';
  }
};

/**
 * Format deadline for display
 */
export const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get status badge text based on deadline
 */
export const getStatusBadge = (deadline: string): string => {
  const daysRemaining = getDaysUntilDeadline(deadline);

  if (daysRemaining < 0) {
    return `Expired ${Math.abs(daysRemaining)} days ago`;
  }
  if (daysRemaining === 0) {
    return 'Due Today';
  }
  if (daysRemaining === 1) {
    return 'Due Tomorrow';
  }
  if (daysRemaining <= 7) {
    return `${daysRemaining} Days Left`;
  }

  return `${daysRemaining} Days Left`;
};

/**
 * Sort notifications by priority and deadline
 */
export const sortNotifications = (
  notifications: any[],
  sortBy: 'priority' | 'deadline' | 'recent' = 'priority'
): any[] => {
  const sorted = [...notifications];

  if (sortBy === 'priority') {
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return sorted.sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      return (
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    });
  }

  if (sortBy === 'deadline') {
    return sorted.sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  }

  if (sortBy === 'recent') {
    return sorted.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return sorted;
};

/**
 * Filter notifications by various criteria
 */
export const filterNotifications = (
  notifications: any[],
  filters: {
    category?: NotificationCategory;
    priority?: PriorityLevel;
    targetGroup?: string;
    showExpired?: boolean;
  }
): any[] => {
  return notifications.filter((notification) => {
    // Category filter
    if (filters.category && notification.category !== filters.category) {
      return false;
    }

    // Priority filter
    if (filters.priority && notification.priority !== filters.priority) {
      return false;
    }

    // Target group filter
    if (
      filters.targetGroup &&
      notification.target_group !== 'All' &&
      notification.target_group !== filters.targetGroup
    ) {
      return false;
    }

    // Show expired filter
    if (!filters.showExpired && isExpired(notification.deadline)) {
      return false;
    }

    return true;
  });
};
