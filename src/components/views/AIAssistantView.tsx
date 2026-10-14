import React, { useState, useEffect, useRef } from 'react';
import { useEvents } from '../../context/EventContext';
import { ChatMessage, CampusEvent } from '../../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Calendar,
  Ticket,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Clock
} from 'lucide-react';

interface AIAssistantViewProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const PRESET_QUERIES = [
  { label: 'Technical Events Coming Up', prompt: 'What technical events are coming up?' },
  { label: 'AI Recommendations', prompt: 'I am interested in artificial intelligence. What should I attend?' },
  { label: 'Coding Competition Details', prompt: 'Tell me about the coding competition.' },
  { label: 'Registered Schedule Planning', prompt: 'Create a schedule for my registered events.' },
  { label: 'Robotics Registration Guide', prompt: 'I want to register for the robotics workshop.' },
  { label: 'Events with Free Seats', prompt: 'Which events have free seats available right now?' },
  { label: 'Cybersecurity Seminar Info', prompt: 'I am interested in cybersecurity. Which event should I attend?' },
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onOpenEventDetails,
  onNavigateTab,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const {
    events,
    registrations,
    studentProfile,
    registerForEvent,
  } = useEvents();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `Hello ${studentProfile.name}! 👋 I am **Campus Event Assistant**, your intelligent AI guide for everything happening across campus.\n\nI can help you:\n• Discover upcoming technical symposiums, hackathons, and cultural fests\n• Provide personalized recommendations for ${studentProfile.department}\n• Answer questions about timings, venues, and registration deadlines\n• Check for schedule conflicts among your registered events\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'What technical events are coming up?', action: 'open_tab', targetId: 'chat' },
          { label: 'Recommend events for me', action: 'open_tab', targetId: 'recommendations' },
        ],
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Handle incoming initial prompt from other pages (e.g. Dashboard search bar)
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isSending) return;

    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          events,
          studentProfile,
          registrations,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedEventIds: data.relatedEventIds || [],
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a communication error connecting to the AI service. Please ensure your network connection is active or test one of the preset prompts.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        sender: 'assistant',
        text: `Conversation cleared. How can I assist you with campus events, ${studentProfile.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to render markdown bold and bullet lines cleanly
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Process bold markers **text**
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-purple-700 text-xs">{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1">
            <span className="text-purple-600 font-bold leading-relaxed">•</span>
            <span className="flex-1 leading-relaxed">{formattedLine}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[580px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Top Agent Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white flex items-center justify-between border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-white">Campus Event Assistant</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Ground truth data source: Live Campus Database • CIE-3 Agent
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5"
          title="Reset Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Preset Prompt Suggestions Carousel */}
      <div className="p-3 bg-purple-50/70 border-b border-purple-100/80 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
        <span className="text-purple-900 font-bold shrink-0 flex items-center gap-1 pl-1">
          <HelpCircle className="w-3.5 h-3.5" /> Sample Queries:
        </span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(preset.prompt)}
            disabled={isSending}
            className="px-3 py-1.5 rounded-xl bg-white text-purple-800 hover:bg-purple-600 hover:text-white border border-purple-200 transition-all shrink-0 font-medium shadow-2xs"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-2xl space-y-2.5`}>
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm shadow-xs ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {renderFormattedText(msg.text)}
                  </div>

                  <div className={`mt-2 text-[10px] text-right ${isUser ? 'text-purple-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* Related Event Action Buttons in Assistant Response */}
                {!isUser && msg.relatedEventIds && msg.relatedEventIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pl-1">
                    {msg.relatedEventIds.map((evtId) => {
                      const evt = events.find((e) => e.id === evtId);
                      if (!evt) return null;
                      return (
                        <div
                          key={evtId}
                          className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-purple-200 text-xs shadow-2xs"
                        >
                          <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                            {evt.title}
                          </span>
                          <button
                            onClick={() => onOpenEventDetails(evt)}
                            className="text-purple-700 hover:text-purple-900 font-bold ml-1 hover:underline flex items-center gap-0.5"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Direct Action Chips */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pl-1">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.action === 'register_event' && act.targetId) {
                            registerForEvent(act.targetId);
                          } else if (act.action === 'view_event' && act.targetId) {
                            const e = events.find((item) => item.id === act.targetId);
                            if (e) onOpenEventDetails(e);
                          } else if (act.action === 'open_schedule') {
                            onNavigateTab('schedule');
                          } else if (act.targetId) {
                            onNavigateTab(act.targetId);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Thinking State */}
        {isSending && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-none bg-white border border-slate-200 text-slate-500 text-xs flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span>Campus Event Assistant is analyzing catalog & schedule...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isSending}
            placeholder="Ask anything about events, venues, conflicts, or registration..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSending}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Demonstration AI assistant powered by Google Gemini API • Accurate college event ground truth enforcement
        </p>
      </div>
    </div>
  );
};
