import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

const getSuggestedPrompts = (roleName) => {
  const role = roleName || 'my chosen career';
  return [
    'What should I learn next?',
    `Can I become a ${role} with my current skills?`,
    `What skills am I missing for ${role}?`,
    'Which project should I build next?',
    'What are the key benchmark skills I should focus on?'
  ];
};

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextInfo, setContextInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = getSuggestedPrompts(contextInfo?.target_career_name);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [histRes, profRes] = await Promise.all([
          api.get('/assistant/history'),
          api.get('/students/profile')
        ]);

        if (profRes.success) {
          setContextInfo(profRes.data.profile);
        }

        if (histRes.success && histRes.data.length > 0) {
          setMessages(histRes.data);
        } else {
          // Default welcoming message
          const roleName = profRes?.data?.profile?.target_career_name;
          setMessages([
            {
              sender: 'assistant',
              message: `Hello! I am your **SkillPath AI** Career and Learning Assistant. I have analyzed your active profile, assessed skills, and roadmap${roleName ? ` for **${roleName}**` : ''}. Ask me anything about what to learn next, your skill gaps, or how to prepare for your target career role!`
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', message: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: query });
      if (res.success) {
        setMessages(prev => [...prev, { sender: 'assistant', message: res.data.reply }]);
        if (res.data.context) {
          setContextInfo(prev => ({ ...prev, ...res.data.context }));
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          message: 'Sorry, I encountered an issue processing your query. Please verify your connection and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt);
  };

  // Helper to format assistant message markdown text
  const formatMessageText = (text) => {
    // Basic formatting for bullets and bold
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('• ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 leading-relaxed">
            {renderBoldText(line.replace(/^[•*]\s*/, ''))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={idx} className="font-medium text-slate-800 my-1">
            {renderBoldText(line)}
          </p>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-slate-800 leading-relaxed">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={pIdx} className="italic text-slate-600">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl flex flex-col h-[calc(100vh-65px)]">
          {/* Header & Active Context Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Context-Aware AI Assistant</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                Career & Skill Learning Assistant
              </h1>
            </div>

            {contextInfo && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                  Target: {contextInfo.target_career_name || 'Backend Developer'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                  Personalized Context Active
                </span>
              </div>
            )}
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-y-auto space-y-5">
            {messages.map((msg, index) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm space-y-1 ${
                      isAssistant
                        ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
                        : 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    {isAssistant ? (
                      formatMessageText(msg.message)
                    ) : (
                      <p className="font-medium whitespace-pre-wrap">{msg.message}</p>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center space-x-3 text-slate-500 text-xs py-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-200"></div>
                  <span className="text-[11px] font-semibold text-slate-500">Analyzing skills & roadmap...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="shrink-0 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Suggested Questions (Click to Ask):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {suggestedPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 hover:border-indigo-200 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-3 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about skills, career roles, or learning next..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center space-x-2 shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
