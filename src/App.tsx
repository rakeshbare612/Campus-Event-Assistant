import React, { useState } from 'react';
import { EventProvider, useEvents } from './context/EventContext';
import { CampusEvent } from './types';
import { NotificationToast } from './components/NotificationToast';
import { EventDetailModal } from './components/EventDetailModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';

// Views
import { DashboardView } from './components/views/DashboardView';
import { EventsListView } from './components/views/EventsListView';
import { MyRegistrationsView } from './components/views/MyRegistrationsView';
import { SchedulePlannerView } from './components/views/SchedulePlannerView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { RecommendationsView } from './components/views/RecommendationsView';
import { OrganizerPanelView } from './components/views/OrganizerPanelView';
import { CIE3ProjectHub } from './components/views/CIE3ProjectHub';

import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Ticket,
  Bot,
  Zap,
  Sliders,
  Award,
  User,
  RotateCcw,
  Menu,
  X,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    registrations,
    studentProfile,
    registeredEventsWithConflicts,
    resetDemoData,
  } = useEvents();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEventForModal, setSelectedEventForModal] = useState<CampusEvent | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeRegistrationsCount = registrations.filter((r) => r.status === 'confirmed').length;
  const conflictCount = registeredEventsWithConflicts.length;

  const handleStartAiChatWithPrompt = (prompt: string) => {
    setAiChatInitialPrompt(prompt);
    setActiveTab('chat');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'events', label: 'Events Catalog', icon: <Calendar className="w-4 h-4" /> },
    {
      id: 'registrations',
      label: 'My Registrations',
      icon: <Ticket className="w-4 h-4" />,
      badge: activeRegistrationsCount > 0 ? activeRegistrationsCount : undefined,
    },
    {
      id: 'schedule',
      label: 'Schedule Planner',
      icon: <Calendar className="w-4 h-4" />,
      conflictBadge: conflictCount > 0,
    },
    { id: 'chat', label: 'AI Assistant', icon: <Bot className="w-4 h-4 text-purple-600" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'organizer', label: 'Organizer Panel', icon: <Sliders className="w-4 h-4" /> },
    { id: 'evaluation', label: 'CIE-3 Hub', icon: <Award className="w-4 h-4 text-indigo-600" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Application Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white flex items-center justify-center shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none group-hover:text-purple-700 transition-colors">
                  Campus Event Assistant
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  CIE-3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block leading-tight mt-0.5">
                Your AI-powered guide to everything happening on campus.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>

                  {/* Badges */}
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-white text-purple-700 font-extrabold' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.conflictBadge && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5"
                      title="Schedule conflict detected"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Profile Chip, Reset Data, Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Student Profile Quick Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-200 transition-all text-left"
              title="Edit Student Preferences"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-xs leading-tight">
                <span className="font-bold text-slate-800 block truncate max-w-[110px]">
                  {studentProfile.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                  {studentProfile.department}
                </span>
              </div>
            </button>

            {/* Reset Demo State Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset Campus Event Assistant demo data back to baseline defaults?')) {
                  resetDemoData();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-slate-100 transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800">
                      {item.badge}
                    </span>
                  )}
                  {item.conflictBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                      Conflict
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenEventDetails={(e) => setSelectedEventForModal(e)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onStartAiChatWithPrompt={handleStartAiChatWithPrompt}
          />
        )}

        {activeTab === 'events' && (
          <EventsListView
            onOpenEventDetails={(e) => setSelectedEventForModal(e)}
            onQuickSummarize={(e) => setSelectedEventForModal(e)}
          />
        )}

        {activeTab === 'registrations' && (
          <MyRegistrationsView
            onOpenEventDetails={(e) => setSelectedEventForModal(e)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'schedule' && (
          <SchedulePlannerView
            onOpenEventDetails={(e) => setSelectedEventForModal(e)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'chat' && (
          <AIAssistantView
            onOpenEventDetails={(e) => setSelectedEventForModal(e)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            initialPrompt={aiChatInitialPrompt}
            onClearInitialPrompt={() => setAiChatInitialPrompt(undefined)}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            onOpenEventDetails={(e) => setSelectedEventForModal(e)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'organizer' && <OrganizerPanelView />}

        {activeTab === 'evaluation' && (
          <CIE3ProjectHub
            onStartAiChatWithPrompt={handleStartAiChatWithPrompt}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-700">Campus Event Assistant</span>
            <span>•</span>
            <span>CIE-3 AI Agent Design Challenge (Computer Engineering)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Google Gemini 3.8 Flash</span>
            <span>•</span>
            <span>All event details are demo records</span>
          </div>
        </div>
      </footer>

      {/* Modals & Floating Components */}
      <EventDetailModal
        event={selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        onNavigateToSchedule={() => setActiveTab('schedule')}
      />

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Floating Chat Widget (Visible except on dedicated full chat tab) */}
      {activeTab !== 'chat' && (
        <FloatingChatWidget
          onOpenEventDetails={(e) => setSelectedEventForModal(e)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Notification Toast Container */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}
