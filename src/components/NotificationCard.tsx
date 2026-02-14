import { Trash2, Calendar, Users, AlertCircle, BookOpen, GraduationCap, Briefcase, PartyPopper, Mail } from 'lucide-react';
import type { Notification } from '../lib/supabase';

interface NotificationCardProps {
  notification: Notification;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export default function NotificationCard({ notification, onDelete, canDelete }: NotificationCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Assignment':
        return <BookOpen className="w-5 h-5" />;
      case 'Exam':
        return <GraduationCap className="w-5 h-5" />;
      case 'Placement':
        return <Briefcase className="w-5 h-5" />;
      case 'Event':
        return <PartyPopper className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500';
      case 'High':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
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

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeText = '';
    if (diffDays < 0) {
      timeText = `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      timeText = 'Due today';
    } else if (diffDays === 1) {
      timeText = 'Due tomorrow';
    } else {
      timeText = `${diffDays} days left`;
    }

    return {
      formatted: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      relative: timeText,
      isOverdue: diffDays < 0,
    };
  };

  const deadline = formatDeadline(notification.deadline);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 space-y-3">
          {/* Header Row */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(notification.category)} border`}>
              {getCategoryIcon(notification.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{notification.title}</h3>
                {notification.source === 'email' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full border border-blue-400/50">
                    <Mail className="w-3 h-3" />
                    Email
                  </span>
                )}
              </div>
              <p className="text-white/70 mt-1 leading-relaxed">{notification.description}</p>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-3">
            {/* Category Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(notification.category)} border`}>
              {getCategoryIcon(notification.category)}
              {notification.category}
            </span>

            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(notification.priority)} text-white`}>
              <AlertCircle className="w-4 h-4" />
              {notification.priority}
            </span>

            {/* Target Group Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/30">
              <Users className="w-4 h-4" />
              {notification.target_group}
            </span>
          </div>

          {/* Deadline Information */}
          <div className={`flex items-center gap-2 text-sm ${deadline.isOverdue ? 'text-red-300' : 'text-white/80'}`}>
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{deadline.formatted}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${deadline.isOverdue ? 'bg-red-500/30 text-red-200' : 'bg-blue-500/30 text-blue-200'}`}>
              {deadline.relative}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        {canDelete && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this notification?')) {
                onDelete(notification.id);
              }
            }}
            className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 rounded-lg transition-all duration-300 hover:scale-110 border border-red-400/50"
            title="Delete notification"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
