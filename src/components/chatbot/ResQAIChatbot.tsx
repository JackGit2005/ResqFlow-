import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  X,
  Send,
  Minimize2,
  PhoneCall,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ChatMessage, SUGGESTED_QUERIES, queryResQAI } from '../../services/aiChatbot';
import { StorageService } from '../../services/storage';

interface ResQAIChatbotProps {
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const ResQAIChatbot: React.FC<ResQAIChatbotProps> = ({
  isOpenExternal,
  onCloseExternal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 Greetings! I am **ResQAI**, your rescue operations and public guidance assistant for **Ballari, Karnataka**.

I can answer questions regarding:
• **How ResQFlow works** & role privileges
• **Civilian reporting & humanitarian aid requests**
• **How request statuses work** (Pending Review → Approved → Dispatched → Completed)
• **How to securely attach incident photos**
• **Coordinator resource allocation heuristics**
• **Responder mission tracking**
• **Relief shelters & available bed capacities**
• **Emergency contacts** (112, 108, 101, DDMA desk)

*Click a prompt below or type your question.*`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNoupeLoaded, setIsNoupeLoaded] = useState(false);
  const [noupeActive, setNoupeActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Noupe Chatbot Script Loader (Loads once, handles availability & prevents duplication)
  useEffect(() => {
    const settings = StorageService.getSettings();
    if (!settings.enableNoupeEmbed && !(window as any).noupeSettings) return;

    const SCRIPT_ID = 'noupe-resqai-widget-script';
    let existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!existingScript) {
      existingScript = document.createElement('script');
      existingScript.id = SCRIPT_ID;
      existingScript.src = settings.noupeScriptUrl || 'https://cdn.noupe.com/widget.js';
      existingScript.async = true;
      existingScript.setAttribute('data-bot-id', settings.noupeBotId || 'resqflow-ballari');
      
      existingScript.onload = () => {
        setIsNoupeLoaded(true);
        setNoupeActive(true);
        if (typeof (window as any).initNoupeWidget === 'function') {
          try {
            (window as any).initNoupeWidget();
          } catch (e) {
            console.warn('Noupe widget init notice:', e);
          }
        }
      };

      existingScript.onerror = () => {
        console.warn('Noupe script blocked or offline. Falling back seamlessly to ResQAI native engine.');
        setNoupeActive(false);
      };

      document.head.appendChild(existingScript);
    } else {
      setIsNoupeLoaded(true);
    }
  }, []);

  // Sync external open triggers (e.g. from sidebar "Ask ResQAI" button)
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await queryResQAI(prompt, messages);
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: 'I encountered a brief connection error. If someone is in immediate danger, please dial **112** directly.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (!next && onCloseExternal) {
      onCloseExternal();
    }
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>');

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div
            key={idx}
            className="pl-2.5 my-1 text-xs text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="text-xs text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Expanded Chat Box Window */}
      {isOpen && (
        <div className="pointer-events-auto w-[calc(100vw-2.5rem)] sm:w-[400px] h-[540px] max-h-[calc(100vh-6rem)] bg-white/98 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden mb-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-slate-900 tracking-tight">ResQAI Assistant</h3>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Ballari DDMA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Emergency & Logistics Guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'assistant',
                      text: `👋 ResQAI conversation reset. How can I assist your emergency response?`,
                      timestamp: new Date().toISOString()
                    }
                  ])
                }
                className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleToggle}
                className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Minimize assistant"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety Notice Strip */}
          <div className="px-3.5 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="font-medium text-[11px]">Immediate Danger? Dial National Emergency:</span>
            </div>
            <a
              href="tel:112"
              className="font-bold underline text-red-700 hover:text-red-900 text-xs flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" /> 112
            </a>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#2563EB] text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                  <div
                    className={`text-[9px] mt-1.5 text-right font-mono ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] text-slate-600">Consulting rescue protocols...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sq)}
                className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 font-medium shrink-0 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about reporting, shelters, allocation rules..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 text-white transition-colors shrink-0 shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Apple-Style Launcher Button */}
      <button
        onClick={handleToggle}
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Toggle ResQAI Assistant"
        title="Open ResQAI Emergency Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
};
