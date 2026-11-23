import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AssistantContext } from '../types/assistant';
import { sendChatMessage } from '../services/geminiService';
import { Sparkles, Send, Bot, User, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

interface AiAssistantChatProps {
  context: AssistantContext;
  apiKey: string;
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  context,
  apiKey
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am **AeroGuardian**, your GenAI urban air quality advisor.

I am tracking severe winter smog and thermal inversion conditions for **${context.cityName}** (AQI: **${context.currentAqi}** - ${context.aqiCategory}).

Ask me anything about:
* **Diurnal Inversion Timing:** When to lock or open windows safely today.
* **Low-Cost Purifier Hacks:** How to build a DIY Corsi-Rosenthal box for under $50.
* **Commute & Routines:** How to adjust school runs, workouts, and travel to cut emissions.
* **Vulnerable Care:** Specific shields for infants, asthma sufferers, and elderly relatives.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'When is it safe to ventilate today?',
        'How to build a DIY air purifier?',
        'How to protect our children and elderly?',
        'What commute saves the most emissions?'
      ]
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const assistantMsg = await sendChatMessage(messages, text, context, apiKey);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 card-surface flex flex-col h-[750px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                AeroGuardian GenAI Reasoning Assistant
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {apiKey ? 'Gemini 1.5 Live' : 'Heuristic AI Model'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Context-aware guidance for {context.cityName} • PM2.5: {context.pm25} µg/m³
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 overflow-y-auto py-4 space-y-4 pr-1"
        aria-live="polite"
        aria-atomic="false"
        role="log"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs ${
                msg.role === 'user' ? 'bg-slate-800' : 'bg-emerald-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Impact Highlight box */}
              {msg.impactHighlight && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{msg.impactHighlight.label}:</strong> {msg.impactHighlight.value}</span>
                </div>
              )}

              {/* Suggested follow-up prompt pills */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Suggested Exploration:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(action)}
                        className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1 text-left flex items-center gap-1 transition-colors"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-400 mt-2 text-right">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Analyzing air speciation and generating environmental recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="pt-3 border-t border-slate-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="chat-user-input" className="sr-only">
            Ask AeroGuardian about air quality, smog hacks, or routine advice
          </label>
          <input
            id="chat-user-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about smog hacks, ventilation timing, Corsi-Rosenthal boxes..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Send Message to AeroGuardian"
          >
            <span>Ask AI</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
};
