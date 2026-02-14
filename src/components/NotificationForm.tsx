import { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { Notification } from '../lib/supabase';

interface NotificationFormProps {
  onSubmit: (notification: Omit<Notification, 'id' | 'created_at' | 'created_by' | 'email_metadata'>) => void;
  onCancel: () => void;
}

export default function NotificationForm({ onSubmit, onCancel }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Assignment' as Notification['category'],
    priority: 'Medium' as Notification['priority'],
    deadline: '',
    target_group: 'All' as Notification['target_group'],
    source: 'manual' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create Notification</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Title <span className="text-red-300">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter notification title"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Description <span className="text-red-300">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
            placeholder="Enter detailed description"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Category <span className="text-red-300">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="Assignment" className="bg-blue-600">Assignment</option>
            <option value="Exam" className="bg-blue-600">Exam</option>
            <option value="Placement" className="bg-blue-600">Placement</option>
            <option value="Event" className="bg-blue-600">Event</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Priority <span className="text-red-300">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="Low" className="bg-blue-600">Low</option>
            <option value="Medium" className="bg-blue-600">Medium</option>
            <option value="High" className="bg-blue-600">High</option>
            <option value="Critical" className="bg-blue-600">Critical</option>
          </select>
        </div>

        {/* Deadline Input */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Deadline <span className="text-red-300">*</span>
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Target Group Dropdown */}
        <div>
          <label className="block text-white mb-2 font-medium">
            Target Group <span className="text-red-300">*</span>
          </label>
          <select
            name="target_group"
            value={formData.target_group}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="All" className="bg-blue-600">All</option>
            <option value="CSE" className="bg-blue-600">CSE</option>
            <option value="IT" className="bg-blue-600">IT</option>
            <option value="Final Year" className="bg-blue-600">Final Year</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 border border-white/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Create Notification
          </button>
        </div>
      </form>
    </div>
  );
}
