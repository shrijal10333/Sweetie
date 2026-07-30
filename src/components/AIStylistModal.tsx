import React, { useState } from 'react';
import { Product } from '../types';
import { Bot, Sparkles, X, Send, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOpenProductModal: (p: Product) => void;
}

export const AIStylistModal: React.FC<AIStylistModalProps> = ({
  isOpen,
  onClose,
  products,
  onOpenProductModal
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');
  const [occasion, setOccasion] = useState('Birthday Gift');
  const [targetPerson, setTargetPerson] = useState('Best Friend');
  const [budget, setBudget] = useState('1500');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(
    '✨ **Hi darling! I am your Cherry AI Stylist.**\n\nTell me who you are shopping for or what vibe you want, and I will handpick the best jewellery, bags, and gifts from our collection for you! 💖'
  );

  const handleGetAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt || `Suggest best gifts for ${targetPerson} for ${occasion} within budget ₹${budget}`,
          budget,
          occasion,
          targetPerson,
          currentProducts: products
        })
      });

      const data = await res.json();
      setRecommendation(data.recommendation || '✨ Check out our Princess Rose Gold Bow Earrings!');
    } catch (err) {
      setRecommendation(
        '✨ **Cherry Stylist Pick:**\n\n1. **Princess Rose Gold Bow Pearl Earrings** (₹699)\n2. **Cherry Rose Blossom Lip Tint** (₹599)\n3. **Cherry Luxury Pamper Gift Hamper** (₹2,499) 💖'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-pink-100">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight flex items-center gap-1.5">
                <span>Cherry AI Gift & Style Consultant</span>
                <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" />
              </h2>
              <p className="text-[11px] text-pink-100">Smart AI recommendations tailored to your vibe & budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Preset Helper Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Shopping For</label>
              <select
                value={targetPerson}
                onChange={(e) => setTargetPerson(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
              >
                <option value="Best Friend">Best Friend</option>
                <option value="Sister">Sister</option>
                <option value="Girlfriend / Partner">Girlfriend / Partner</option>
                <option value="Myself">Myself (Self-Care)</option>
                <option value="Mom">Mom</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
              >
                <option value="Birthday Gift">Birthday Gift</option>
                <option value="Coquette Brunch Look">Coquette Brunch Look</option>
                <option value="Anniversary">Anniversary</option>
                <option value="College / Date Outfit">College / Date Outfit</option>
                <option value="Festive Party">Festive Party</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Max Budget (₹)</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
              >
                <option value="800">Under ₹800</option>
                <option value="1500">Under ₹1,500</option>
                <option value="2500">Under ₹2,500</option>
                <option value="5000">Luxury (₹5,000+)</option>
              </select>
            </div>
          </div>

          {/* AI Response Display Box */}
          <div className="p-4 bg-white rounded-2xl border border-pink-200 shadow-inner space-y-3 min-h-[140px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3 text-pink-600">
                <Sparkles className="w-8 h-8 animate-spin" />
                <p className="text-xs font-bold animate-pulse">
                  Stylist is matching aesthetic products for you... 💖
                </p>
              </div>
            ) : (
              <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                {recommendation}
              </div>
            )}
          </div>

          {/* Top Catalog Quick Pick Suggestions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Matching Catalog Highlights</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onOpenProductModal(p);
                  }}
                  className="p-2 bg-pink-50/50 rounded-2xl border border-pink-100 hover:border-pink-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-20 object-cover rounded-xl mb-1.5"
                    referrerPolicy="no-referrer"
                  />
                  <h5 className="font-serif font-bold text-[11px] text-gray-900 line-clamp-1">{p.name}</h5>
                  <p className="text-[10px] text-pink-600 font-bold">₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleGetAdvice} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Or type custom prompt (e.g., 'Need pink hair bow for college')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl border border-gray-200 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
