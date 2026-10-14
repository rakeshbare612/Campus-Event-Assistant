import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { StudentProfile, EventCategory } from '../types';
import { X, User, GraduationCap, Sparkles, Check, Bookmark } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Competitive Programming',
  'Cybersecurity',
  'Web3 & Blockchain',
  'Cloud DevOps',
  'Robotics & IoT',
  'UI/UX Design',
  'Cultural Arts & Music',
  'Sports & Athletics',
  'Data Science',
];

const AVAILABLE_CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: 'technical', label: 'Technical' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'competition', label: 'Competition' },
  { id: 'seminar', label: 'Seminar' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'sports', label: 'Sports' },
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { studentProfile, updateStudentProfile } = useEvents();

  const [formData, setFormData] = useState<StudentProfile>(studentProfile);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const toggleCategory = (cat: EventCategory) => {
    setFormData((prev) => {
      const exists = prev.preferredCategories.includes(cat);
      return {
        ...prev,
        preferredCategories: exists
          ? prev.preferredCategories.filter((c) => c !== cat)
          : [...prev.preferredCategories, cat],
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Profile & Preferences</h3>
              <p className="text-xs text-slate-500">
                Customizes AI recommendations and automatic event registrations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Roll No.
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Program
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
              >
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Year / Semester
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
              >
                <option value="1st Year (Semester 1-2)">1st Year (Semester 1-2)</option>
                <option value="2nd Year (Semester 3-4)">2nd Year (Semester 3-4)</option>
                <option value="3rd Year (Semester 5-6)">3rd Year (Semester 5-6)</option>
                <option value="4th Year (Semester 7-8)">4th Year (Semester 7-8)</option>
              </select>
            </div>
          </div>

          {/* Skill Level & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Skill Level
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skillLevel: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
              >
                <option value="Beginner">Beginner (Foundations & Intro)</option>
                <option value="Intermediate">Intermediate (Project-Ready)</option>
                <option value="Advanced">Advanced (Competitive & Deep Dive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Schedule Availability
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g. Weekends, Post-2 PM"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preferred Categories */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Event Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = formData.preferredCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Student Interests (Used by AI Recommendation Engine)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? `✓ ${interest}` : `+ ${interest}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md shadow-purple-600/20"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
