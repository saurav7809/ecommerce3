import { useState, useEffect } from 'react';
import { Sparkles, X, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { askAssistant, fetchProducts } from '../../api/client';
import type { Product } from '../../types';
import { money } from '../../lib/utils';

export default function AiAssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; products?: Product[] }[]
  >([
    {
      role: 'assistant',
      text: 'Hello! I am your Common Goods AI shopping assistant. Looking for a gift, home decor, or wellness piece? Ask me anything!',
    },
  ]);

  useEffect(() => {
    fetchProducts().then(setCatalog).catch(() => {});
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await askAssistant(userText, catalog);
      const suggested = catalog.filter((p) => res.suggestedProductIds.includes(p.id));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.reply, products: suggested },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't reach the AI recommendation service right now. Please explore our curated collections directly from the menu!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-stone-900 hover:bg-stone-800 text-white rounded-full px-4 py-3 shadow-xl flex items-center gap-2 text-sm font-medium transition-transform hover:scale-105"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={16} className="text-amber-300" />
        <span>Ask AI Stylist</span>
      </button>

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-stone-100 rounded-xl text-stone-800">
                  <Sparkles size={18} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Shopping Assistant</h3>
                  <p className="text-[11px] text-stone-400">FastAPI AI Recommendation Engine</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2 space-y-1.5 w-full max-w-[85%]">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          to={`/products/${p.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl p-2 transition-colors text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium text-stone-800 block truncate">
                              {p.name}
                            </span>
                            <span className="text-stone-500">{money(p.price)}</span>
                          </div>
                          <ArrowRight size={14} className="text-stone-400 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-stone-400 italic">
                  <Sparkles size={14} className="animate-spin text-amber-500" />
                  Thinking and finding best matches…
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-stone-100 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'Cozy evening items under 5000'..."
                className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-stone-900 disabled:opacity-40 text-white rounded-xl p-2 hover:bg-stone-800 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

