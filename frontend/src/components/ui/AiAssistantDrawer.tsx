import React, { useState } from 'react';
import { X, Sparkles, Send, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeAiDrawer } from '../../store/uiSlice';
import { useAskAiAssistantMutation } from '../../store/apiSlice';
import { addToCart } from '../../store/cartSlice';
import { addToast } from '../../store/uiSlice';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: any[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content:
      "Hello! I'm your HomeNest AI Interior Design & Shopping Assistant. Tell me about your room, favorite design style (like Mid-Century, Scandinavian, or Boho), or budget constraints, and I'll tailor the perfect furniture & decor pairings for you!",
  },
];

const SUGGESTION_PROMPTS = [
  'Furnish a Scandinavian living room under ₹30,000',
  'Velvet accent chairs for bedroom reading nook',
  'Solid wood dining table and comfortable chairs',
  'Boho textured rugs and floor lighting',
];

export default function AiAssistantDrawer() {
  const dispatch = useAppDispatch();
  const isAiDrawerOpen = useAppSelector((state) => state.ui.isAiDrawerOpen);
  const [askAi, { isLoading }] = useAskAiAssistantMutation();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  if (!isAiDrawerOpen) return null;

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');

    try {
      const resp = await askAi({
        message: text,
        history: newMessages.map((m) => ({ role: m.role, content: m.content })),
      }).unwrap();

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: resp.reply,
          suggestedProducts: resp.suggestedProducts,
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "I'm currently unable to connect to the AI design service, but you can explore our curated departments and Deals section above!",
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(closeAiDrawer())}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#581172] to-[#7b189f] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold">AI Interior Designer</h3>
                <p className="text-[11px] text-purple-200">Room styling, space planning & pairings</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(closeAiDrawer())}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#7b189f] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Recommended Product Cards inside Chat */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400 pl-1">
                      Recommended Pieces:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.suggestedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-lg border border-gray-200 p-2 flex space-x-2 shadow-2xs hover:border-[#7b189f] transition-all"
                        >
                          <img
                            src={p.imageUrl || p.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'}
                            alt={p.name}
                            className="w-14 h-14 object-cover rounded-md bg-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <Link
                                to={`/product/${p.slug || p.id}`}
                                onClick={() => dispatch(closeAiDrawer())}
                                className="text-[11px] font-bold text-gray-900 truncate hover:text-[#7b189f] block"
                              >
                                {p.name}
                              </Link>
                              <span className="text-[11px] font-extrabold text-[#7b189f]">
                                {formatCurrency(p.price)}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                dispatch(addToCart({ product: p, quantity: 1, openDrawer: true }));
                                dispatch(addToast({ message: `Added "${p.name}" to cart`, type: 'success' }));
                              }}
                              className="self-start text-[10px] font-bold text-[#7b189f] bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-sm flex items-center space-x-1"
                            >
                              <ShoppingBag className="w-2.5 h-2.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-100 w-fit">
                <Sparkles className="w-4 h-4 text-[#7b189f] animate-spin" />
                <span>Searching catalog and harmonizing room styles...</span>
              </div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="p-2.5 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTION_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#7b189f] font-medium rounded-full whitespace-nowrap shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rooms, styles, measurements, or budget..."
                className="flex-1 px-3.5 py-2 text-xs rounded-full border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-[#7b189f] hover:bg-[#581172] text-white rounded-full transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
