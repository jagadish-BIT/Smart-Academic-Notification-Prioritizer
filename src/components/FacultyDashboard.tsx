import { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, LogOut, MessageSquare } from 'lucide-react';
import { supabase, type Notification } from '../lib/supabase';
import { DEPARTMENTS } from '../lib/constants';

interface FacultyDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function FacultyDashboard({ user, onLogout }: FacultyDashboardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Assignment' as Notification['category'],
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
      setNotifications(data || []);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine target_group based on selections
    let finalTargetGroup = 'All';
    if (formData.selectedDepartment && formData.selectedDepartment !== '') {
      finalTargetGroup = formData.selectedDepartment;
    } else if (formData.selectedYear && formData.selectedYear !== '') {
      finalTargetGroup = formData.selectedYear;
    }

    const { error } = await supabase
      .from('notifications')
      .insert([{
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        deadline: formData.deadline,
        target_group: finalTargetGroup,
        created_by: user.id,
        source: 'manual',
        email_metadata: {},
      }]);

    if (!error) {
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'Assignment',
        priority: 'Medium',
        deadline: '',
        target_group: 'All',
        selectedDepartment: '',
        selectedYear: '',
      });
      loadNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    loadNotifications();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-purple-600">Faculty</span>
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
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-medium">
              Dashboard
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              My Notifications
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Create Notification
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Student Reports
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
              Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex gap-2">
              <div className="flex gap-2 bg-white rounded-lg shadow px-4 py-2">
                <span className="text-purple-600 font-medium">Notifications</span>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {notifications.length}
                </span>
              </div>
              <div className="flex gap-2 bg-white rounded-lg shadow px-4 py-2">
                <span className="text-blue-600 font-medium">Pending Approvals</span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  5
                </span>
              </div>
              <div className="flex gap-2 bg-white rounded-lg shadow px-4 py-2">
                <span className="text-orange-600 font-medium">Upcoming Deadlines</span>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  3
                </span>
              </div>
            </div>
          </div>

          {/* Create Notification Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notification</span>
            </button>
          </div>

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Notification</h2>
                <form onSubmit={handleCreateNotification} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Notification title"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Notification description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>Assignment</option>
                        <option>Exam</option>
                        <option>Placement</option>
                        <option>Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Deadline</label>
                      <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Department</label>
                      <select
                        value={formData.selectedDepartment}
                        onChange={(e) => setFormData({...formData, selectedDepartment: e.target.value, selectedYear: ''})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      <label className="block text-gray-700 font-medium mb-2">Academic Year</label>
                      <select
                        value={formData.selectedYear}
                        onChange={(e) => setFormData({...formData, selectedYear: e.target.value, selectedDepartment: ''})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Year (or All)</option>
                        <option value="First Year">First Year</option>
                        <option value="Second Year">Second Year</option>
                        <option value="Third Year">Third Year</option>
                        <option value="Final Year">Final Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                    >
                      Create Notification
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">My Notifications</h2>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                      <p className="text-gray-600 mt-2">{notification.description}</p>
                      <div className="flex gap-4 mt-4 text-sm">
                        <span className="text-gray-600">
                          <strong>Category:</strong> {notification.category}
                        </span>
                        <span className="text-gray-600">
                          <strong>Target:</strong> {notification.target_group}
                        </span>
                        <span className="text-gray-600">
                          <strong>Deadline:</strong> {new Date(notification.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                        notification.priority === 'Critical' ? 'bg-red-500' :
                        notification.priority === 'High' ? 'bg-orange-500' :
                        notification.priority === 'Medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {notification.priority}
                      </span>
                      {notification.created_by && (
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
