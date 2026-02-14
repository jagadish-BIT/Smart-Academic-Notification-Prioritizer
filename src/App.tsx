import { useState, useEffect } from 'react';
import { supabase, type Notification } from './lib/supabase';
import { Bell, LogOut, Plus, Trash2, Mail } from 'lucide-react';
import Auth from './components/Auth';
import NotificationForm from './components/NotificationForm';
import NotificationCard from './components/NotificationCard';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';

type UserRole = 'admin' | 'faculty' | 'student';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = (session.user.user_metadata?.role as UserRole) || 'student';
        setUserRole(role);
      }
      setLoading(false);
    })();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = (session.user.user_metadata?.role as UserRole) || 'student';
        setUserRole(role);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load notifications when user is authenticated
  useEffect(() => {
    if (user) {
      loadNotifications();

      // Subscribe to real-time changes
      const channel = supabase
        .channel('notifications_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Load all notifications from database
  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error loading notifications:', error);
    } else {
      setNotifications(data || []);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Handle notification deletion
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  // Handle notification creation
  const handleCreateNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'created_by' | 'email_metadata'>) => {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        created_by: user.id,
        source: 'manual'
      }]);

    if (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } else {
      setShowForm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onSignUp={(role) => setUserRole(role)} />;
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (userRole === 'faculty') {
    return <FacultyDashboard user={user} onLogout={handleLogout} />;
  }

  // Default to Student dashboard
  return <StudentDashboard user={user} onLogout={handleLogout} />
}

export default App;
