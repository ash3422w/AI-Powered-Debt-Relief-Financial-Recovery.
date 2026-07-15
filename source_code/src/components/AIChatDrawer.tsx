import { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { callEdgeFunction } from '../lib/supabase';
import { ChatMessage } from '../lib/types';
import { toast } from 'react-toastify';

export default function AIChatDrawer({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your DebtRelief AI Assistant. Ask me anything about debt settlement, loan negotiation, or financial recovery.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await callEdgeFunction<{ reply: string }>('gemini-ai', {
        action: 'chat',
        message: userMsg.content,
        history: messages.slice(-6),
      });
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get a response.';
      toast.error(msg);
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry, I couldn't respond right now. ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md glass border-l border-white/20 dark:border-white/5 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">AI Assistant</p>
              <p className="text-xs text-success-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-md'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-bl-md'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-5 py-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
              placeholder="Ask about debt settlement..."
              className="input-field !py-2.5 resize-none max-h-32"
            />
            <button onClick={send} disabled={!input.trim() || loading} className="btn-primary !px-3 !py-2.5">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
