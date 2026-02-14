import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Mail, Lock, User } from 'lucide-react';

type UserRole = 'admin' | 'faculty' | 'student';

interface AuthProps {
  onSignUp?: (role: UserRole) => void;
}

export default function Auth({ onSignUp }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Get user role from metadata
        const userRole = (data?.user?.user_metadata?.role as UserRole) || 'student';
        if (onSignUp) onSignUp(userRole);
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
            }
          }
        });
        if (error) throw error;
        setMessage('Account created successfully! You can now login.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-4 border border-white/30">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <p className="text-white/80">Academic Notification Prioritizer</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-white text-center ${
              message.includes('success') ? 'bg-green-500/50' : 'bg-red-500/50'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-medium">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-white mb-2 font-medium">
                  <User className="inline w-4 h-4 mr-2" />
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                >
                  <option value="student" className="text-gray-900">Student</option>
                  <option value="faculty" className="text-gray-900">Faculty</option>
                  <option value="admin" className="text-gray-900">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
              }}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Smart Academic Notification Prioritizer</p>
          <p className="mt-1">Final Year Mini Project</p>
        </div>
      </div>
    </div>
  );
}
