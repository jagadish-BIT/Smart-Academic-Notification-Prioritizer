import { useState, useEffect } from 'react';
import {
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  Filter,
  Moon,
  Sun,
} from 'lucide-react';
import { supabase, type Notification } from '../lib/supabase';
import Statistics from './Statistics';
import { useTheme } from '../lib/ThemeContext';
import { calculateSmartPriority, getDaysUntilDeadline, formatDeadline } from '../lib/priorityLogic';
import { DEPARTMENTS } from '../lib/constants';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'critical' | 'high' | 'expired'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Exam' as Notification['category'],
    priority: 'Medium' as Notification['priority'],
    deadline: '',
    target_group: 'All' as Notification['target_group'],
    selectedDepartment: '',
    selectedYear: '',
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
      setNotifications(data as Notification[]);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const smartPriority = calculateSmartPriority(formData.deadline, formData.category);
      
      // Determine target_group based on selections
      let finalTargetGroup = 'All';
      if (formData.selectedDepartment && formData.selectedDepartment !== '') {
        finalTargetGroup = formData.selectedDepartment;
      } else if (formData.selectedYear && formData.selectedYear !== '') {
        finalTargetGroup = formData.selectedYear;
      }

      const dataToSave = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        deadline: formData.deadline,
        target_group: finalTargetGroup,
        priority: smartPriority,
      };

      if (editingId) {
        // Update existing notification
        const { error } = await supabase
          .from('notifications')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        // Create new notification
        const { error } = await supabase.from('notifications').insert([
          {
            ...dataToSave,
            created_by: user.id,
            source: 'manual',
            status: 'active',
            email_metadata: {},
          },
        ]);

        if (error) throw error;
      }

      setFormData({
        title: '',
        description: '',
        category: 'Exam',
        priority: 'Medium',
        deadline: '',
        target_group: 'All',
        selectedDepartment: '',
        selectedYear: '',
      });
      setShowCreateForm(false);
      loadNotifications();
    } catch (error) {
      console.error('Error creating/updating notification:', error);
      alert('Failed to save notification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const handleEdit = (notification: Notification) => {
    // Determine if the target_group is a department or year
    const years = ['First Year', 'Second Year', 'Third Year', 'Final Year'];
    const isYear = years.includes(notification.target_group);
    
    setFormData({
      title: notification.title,
      description: notification.description,
      category: notification.category,
      priority: notification.priority,
      deadline: notification.deadline.split('T')[0] + 'T' + notification.deadline.split('T')[1].split('.')[0],
      target_group: notification.target_group,
      selectedDepartment: isYear ? '' : (notification.target_group === 'All' ? '' : notification.target_group),
      selectedYear: isYear ? notification.target_group : '',
    });
    setEditingId(notification.id);
    setShowCreateForm(true);
  };

  // Filter notifications
  let filtered = notifications;
  if (searchTerm) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (filterBy === 'critical') {
    filtered = filtered.filter((n) => n.priority === 'Critical');
  } else if (filterBy === 'high') {
    filtered = filtered.filter((n) => n.priority === 'High');
  } else if (filterBy === 'expired') {
    filtered = filtered.filter((n) => getDaysUntilDeadline(n.deadline) < 0);
  }

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-blue-100';
  const cardBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextColor = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>
        {`
          .glass-effect {
            background: ${isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
            backdrop-filter: blur(10px);
            border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="glass-effect shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <p className={`text-sm ${mutedTextColor}`}>Administrator</p>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 text-yellow-400' : 'bg-blue-100 text-blue-600'
                } hover:scale-110 transition-transform`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <span className={`font-medium ${textColor}`}>{user.email}</span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${textColor} mb-2`}>Administration Dashboard</h1>
            <p className={mutedTextColor}>Manage all academic notifications</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                title: '',
                description: '',
                category: 'Exam',
                priority: 'Medium',
                deadline: '',
                target_group: 'All',
                selectedDepartment: '',
                selectedYear: '',
              });
              setShowCreateForm(!showCreateForm);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Notification</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <Statistics notifications={notifications} isDark={isDark} />
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl ${cardBg} rounded-2xl shadow-2xl p-8`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${textColor}`}>
                  {editingId ? 'Edit Notification' : 'Create Notification'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingId(null);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label className={`block ${textColor} font-medium mb-2`}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className={`block ${textColor} font-medium mb-2`}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Detailed description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${textColor} font-medium mb-2`}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="Assignment">Assignment</option>
                      <option value="Exam">Exam</option>
                      <option value="Placement">Placement</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block ${textColor} font-medium mb-2`}>Department</label>
                    <select
                      value={formData.selectedDepartment}
                      onChange={(e) => setFormData({ ...formData, selectedDepartment: e.target.value, selectedYear: '' })}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block ${textColor} font-medium mb-2`}>Academic Year</label>
                    <select
                      value={formData.selectedYear}
                      onChange={(e) => setFormData({ ...formData, selectedYear: e.target.value, selectedDepartment: '' })}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Year (or All)</option>
                      <option value="First Year">First Year</option>
                      <option value="Second Year">Second Year</option>
                      <option value="Third Year">Third Year</option>
                      <option value="Final Year">Final Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${textColor} font-medium mb-2`}>Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block ${textColor} font-medium mb-2`}>Note: Priority Auto-Calculated</label>
                    <div className={`px-4 py-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'} ${mutedTextColor} text-sm`}>
                      Priority will be set based on deadline and category
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    {editingId ? 'Update' : 'Create'} Notification
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingId(null);
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    } ${textColor}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-3 w-5 h-5 ${mutedTextColor}`} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="flex gap-2">
              <Filter className={`w-5 h-5 ${mutedTextColor} my-auto`} />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Notifications</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Priority</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className={`${cardBg} rounded-lg shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm`}>
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50 border-b border-gray-200'}>
                <tr>
                  <th className={`px-6 py-3 text-left font-semibold ${textColor}`}>Title</th>
                  <th className={`px-6 py-3 text-left font-semibold ${textColor}`}>Category</th>
                  <th className={`px-6 py-3 text-left font-semibold ${textColor}`}>Deadline</th>
                  <th className={`px-6 py-3 text-left font-semibold ${textColor}`}>Priority</th>
                  <th className={`px-6 py-3 text-left font-semibold ${textColor}`}>Target</th>
                  <th className={`px-6 py-3 text-left font-semibold ${textColor}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-8 text-center ${mutedTextColor}`}>
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  filtered.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className={`px-6 py-4 font-medium ${textColor}`}>{notification.title}</td>
                      <td className={`px-6 py-4 ${mutedTextColor}`}>{notification.category}</td>
                      <td className={`px-6 py-4 ${mutedTextColor}`}>
                        {formatDeadline(notification.deadline)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                            notification.priority === 'Critical'
                              ? 'bg-red-600'
                              : notification.priority === 'High'
                              ? 'bg-orange-600'
                              : notification.priority === 'Medium'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                        >
                          {notification.priority}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${mutedTextColor}`}>{notification.target_group}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(notification)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
