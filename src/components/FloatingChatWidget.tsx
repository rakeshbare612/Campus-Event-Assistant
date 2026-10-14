import React, { useState, useRef, useEffect } from 'react';
import { useEvents } from '../context/EventContext';
import { ChatMessage, CampusEvent } from '../types';
import {
  Sparkles,
  Bot,
  User,
  X,
  Send,
  RefreshCw,
  Maximize2,
  Calendar,
  Ticket
} from 'lucide-react';

interface FloatingChatWidgetProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  onOpenEventDetails,
  onNavigateTab,
}) => {
  const { events, registrations, studentProfile, registerForEvent } = useEvents();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'quick-welcome',
      sender: 'assistant',
      text: `Hi ${studentProfile.name}! 👋 How can I help you find or plan campus events today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputQuery.trim();
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
          events,
          studentProfile,
          registrations,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I'm sorry, I couldn't process your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedEventIds: data.relatedEventIds || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Temporary network glitch. Try asking again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4.5 py-3.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-purple-400/30"
          aria-label="Open Campus AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>Ask Campus AI</span>
        </button>
      )}

      {/* Floating Popover Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-none">Campus Event Assistant</h4>
                <p className="text-[10px] text-purple-300 mt-1">Live AI Guide • Gemini 3.8 Flash</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateTab('chat');
                }}
                className="p-1.5 text-purple-300 hover:text-white rounded-lg"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-purple-300 hover:text-white rounded-lg"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    <span className={`text-[9px] block text-right mt-1 ${isUser ? 'text-purple-200' : 'text-slate-400'}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>Assistant is thinking...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2 bg-slate-100/70 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => {
                setInputQuery('What technical events are happening?');
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 whitespace-nowrap hover:bg-purple-50 hover:text-purple-700"
            >
              Technical events
            </button>
            <button
              onClick={() => {
                setInputQuery('Check my schedule for conflicts');
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 whitespace-nowrap hover:bg-purple-50 hover:text-purple-700"
            >
              Conflict check
            </button>
            <button
              onClick={() => {
                setInputQuery('Which events have free seats?');
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 whitespace-nowrap hover:bg-purple-50 hover:text-purple-700"
            >
              Free seats
            </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-slate-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isSending}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
