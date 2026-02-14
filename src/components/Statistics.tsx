import { AlertCircle, TrendingUp, Clock, CheckCircle2, type LucideIcon } from 'lucide-react';
import { Notification } from '../lib/supabase';
import { getDaysUntilDeadline } from '../lib/priorityLogic';

interface StatisticsProps {
  notifications: Notification[];
  isDark?: boolean;
}

export default function Statistics({ notifications, isDark = false }: StatisticsProps) {
  // Calculate statistics
  const stats = {
    total: notifications.length,
    critical: notifications.filter(n => n.priority === 'Critical').length,
    high: notifications.filter(n => n.priority === 'High').length,
    urgent: notifications.filter(
      n =>
        (n.priority === 'Critical' || n.priority === 'High') &&
        getDaysUntilDeadline(n.deadline) <= 3
    ).length,
    expired: notifications.filter(n => getDaysUntilDeadline(n.deadline) < 0).length,
    dueThisWeek: notifications.filter(
      n =>
        getDaysUntilDeadline(n.deadline) > 0 &&
        getDaysUntilDeadline(n.deadline) <= 7
    ).length,
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
  }: {
    icon: LucideIcon;
    label: string;
    value: number;
    color: string;
    bgColor: string;
  }) => (
    <div
      className={`rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}
    >
      <div className="flex items-end justify-between">
        <div>
          <p
            className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {label}
          </p>
          <p className={`text-4xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          label="Total Notifications"
          value={stats.total}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={AlertCircle}
          label="Critical Priority"
          value={stats.critical}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          icon={AlertCircle}
          label="High Priority"
          value={stats.high}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatCard
          icon={Clock}
          label="Urgent (≤3 days)"
          value={stats.urgent}
          color="text-red-700"
          bgColor="bg-red-100"
        />
        <StatCard
          icon={Clock}
          label="Due This Week"
          value={stats.dueThisWeek}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Expired"
          value={stats.expired}
          color="text-gray-600"
          bgColor="bg-gray-100"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notification Breakdown */}
        <div
          className={`rounded-xl shadow-lg p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Priority Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Critical</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.critical / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {stats.critical}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>High</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {stats.high}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Other</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.total > 0
                          ? ((stats.total - stats.critical - stats.high) / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {stats.total - stats.critical - stats.high}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div
          className={`rounded-xl shadow-lg p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            By Category
          </h3>
          <div className="space-y-3">
            {(['Assignment', 'Exam', 'Placement', 'Event'] as const).map((category) => {
              const count = notifications.filter(n => n.category === category).length;
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{category}</span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div
          className={`rounded-xl shadow-lg p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Quick Insights
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Completion Rate</span>
              <span className="font-semibold text-green-600">
                {stats.total > 0 ? Math.round(((stats.total - stats.urgent) / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Action Needed</span>
              <span className="font-semibold text-red-600">{stats.urgent}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {stats.dueThisWeek > 0
                  ? `${stats.dueThisWeek} items due this week`
                  : 'No items due this week'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
