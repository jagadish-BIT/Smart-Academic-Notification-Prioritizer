import { useState, useEffect } from 'react';
import { AlertCircle, Calendar, CheckCircle2, LogOut, Clock } from 'lucide-react';
import { supabase, type Notification } from '../lib/supabase';

interface StudentDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    upcoming: 0,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('deadline', { ascending: true });

    if (!error && data) {
      setNotifications(data || []);
      setStats({
        critical: data.filter(n => n.priority === 'Critical').length,
        high: data.filter(n => n.priority === 'High').length,
        medium: data.filter(n => n.priority === 'Medium').length,
        upcoming: data.length,
      });
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">Student</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-700 font-medium">{user.email}</span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen p-6">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
              Menu
            </div>
            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-600 rounded-lg font-medium">
              Dashboard
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Priority Notifications
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Upcoming Events
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Mark as Done
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Notification Dashboard</h1>

          {/* Priority Notifications */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-red-100 border-l-4 border-red-500 rounded-lg shadow p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-red-900 text-sm font-medium mb-2">Critical</p>
                  <p className="text-4xl font-bold text-red-600">{stats.critical}</p>
                </div>
              </div>
              <p className="text-red-700 text-xs mt-3">Requires immediate action</p>
            </div>

            <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg shadow p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-orange-900 text-sm font-medium mb-2">Due Soon</p>
                  <p className="text-4xl font-bold text-orange-600">{stats.high}</p>
                </div>
              </div>
              <p className="text-orange-700 text-xs mt-3">Complete in next few days</p>
            </div>

            <div className="bg-green-100 border-l-4 border-green-500 rounded-lg shadow p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-green-900 text-sm font-medium mb-2">Assignments</p>
                  <p className="text-4xl font-bold text-green-600">{stats.medium}</p>
                </div>
              </div>
              <p className="text-green-700 text-xs mt-3">In progress / Upcoming</p>
            </div>
          </div>

          {/* Alert Cards */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Priority Notifications
            </h2>
            {notifications
              .filter(n => n.priority === 'Critical' || n.priority === 'High')
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg shadow p-6 border-l-4 ${
                    notification.priority === 'Critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-orange-50 border-orange-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                      <p className="text-gray-700 mt-2">{notification.description}</p>
                      <div className="flex gap-6 mt-4 text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <strong>Deadline:</strong> {new Date(notification.deadline).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <strong>{getDaysUntilDeadline(notification.deadline)} Days Left</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold block ${
                        notification.priority === 'Critical' ? 'bg-red-600' : 'bg-orange-600'
                      }`}>
                        {notification.priority}
                      </span>
                      <button className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Done
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Upcoming Events
            </h2>
            {notifications
              .filter(n => n.priority !== 'Critical' && n.priority !== 'High')
              .map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                      <p className="text-gray-700 mt-2">{notification.description}</p>
                      <div className="flex gap-6 mt-4 text-sm">
                        <span className="text-gray-600">
                          <strong>Category:</strong> {notification.category}
                        </span>
                        <span className="text-gray-600">
                          <strong>Deadline:</strong> {new Date(notification.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold block ${
                        notification.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {notification.priority}
                      </span>
                      <button className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Mark Important
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
