import React, { useState, useEffect } from 'react';
import { useEvents } from '../../context/EventContext';
import { RecommendationResult, CampusEvent, EventCategory } from '../../types';
import {
  Sparkles,
  Zap,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  RefreshCw,
  BookOpen,
  Filter
} from 'lucide-react';

interface RecommendationsViewProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  onOpenEventDetails,
  onNavigateTab,
}) => {
  const {
    events,
    studentProfile,
    updateStudentProfile,
    registerForEvent,
    isRegistered,
  } = useEvents();

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelSource, setModelSource] = useState<string>('');
  const [hasFetched, setHasFetched] = useState(false);

  // Local preferences adjustments
  const [dept, setDept] = useState(studentProfile.department);
  const [skill, setSkill] = useState(studentProfile.skillLevel);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(studentProfile.interests);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: {
            ...studentProfile,
            department: dept,
            skillLevel: skill,
            interests: selectedInterests,
          },
          events,
        }),
      });

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setModelSource(data.source || 'gemini-3.8-flash');
      setHasFetched(true);
    } catch (err) {
      console.warn('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Engine • {modelSource || 'Gemini 3.8 Flash'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Intelligent Event Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized event scoring based on your academic department, technical interests, and skill level.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Recalculating...' : 'Refresh AI Matches'}</span>
        </button>
      </div>

      {/* Student Preference Configurator Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            Configure Recommendation Factors
          </h3>
          <span className="text-xs text-slate-400">
            Real-time weight adjustment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecom</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Skill Tier</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              <option value="Beginner">Beginner (Foundations)</option>
              <option value="Intermediate">Intermediate (Project-Ready)</option>
              <option value="Advanced">Advanced (Deep Dive)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              onClick={() => {
                updateStudentProfile({ department: dept, skillLevel: skill, interests: selectedInterests });
                fetchRecommendations();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Apply & Re-Rank Events</span>
            </button>
          </div>
        </div>

        {/* Interests Selection */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Active Student Interests:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Artificial Intelligence',
              'Machine Learning',
              'Competitive Programming',
              'Cybersecurity',
              'Web3 & Blockchain',
              'Cloud DevOps',
              'Robotics & IoT',
              'UI/UX Design',
              'Sports & Athletics',
            ].map((tag) => {
              const active = selectedInterests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {active ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Recommendation Output Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Evaluating Campus Catalog with Gemini AI...</h3>
          <p className="text-xs text-slate-500">
            Matching syllabus topics, event difficulty, and career pathways.
          </p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const event = events.find((e) => e.id === rec.eventId);
            if (!event) return null;
            const registered = isRegistered(event.id);
            const seatsLeft = Math.max(0, event.capacity - event.registeredCount);

            return (
              <div
                key={rec.eventId}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Score Badge */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1.5 border border-purple-200">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>{rec.matchScore}% Match Index</span>
                    </span>

                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {event.category}
                    </span>
                  </div>

                  {/* Highlight Benefit */}
                  {rec.highlightBenefit && (
                    <div className="text-xs font-bold text-indigo-700 mb-1">
                      ★ {rec.highlightBenefit}
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {event.title}
                  </h3>

                  {/* AI Reason Box */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 leading-relaxed">
                    <span className="font-bold block text-purple-900 mb-0.5">
                      Why this fits your profile:
                    </span>
                    {rec.reason}
                  </div>

                  {/* Event Metadata snippet */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.date} ({event.startTime})</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    {seatsLeft} / {event.capacity} seats open
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEventDetails(event)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Details
                    </button>

                    {registered ? (
                      <span className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => registerForEvent(event.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all flex items-center gap-1"
                      >
                        <span>Register Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-700">No Recommendations Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try selecting more interest tags or switching your target department to generate recommendations across the catalog.
          </p>
        </div>
      )}
    </div>
  );
};
