import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Search, X, Star, ShoppingBag, ArrowRight } from 'lucide-react';

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  const categories: (Category | 'All')[] = [
    'All', 'Jewellery', 'Bags', 'Accessories', 'Beauty Products', 'Fashion Items', 'Gift Items'
  ];

  const filteredProducts = products.filter((p) => {
    const matchesQuery = !query || 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPrice = p.price <= maxPrice;

    return matchesQuery && matchesCategory && matchesPrice;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[85vh] animate-slide-down">
        
        {/* Search Header Form */}
        <div className="p-4 bg-pink-50 border-b border-pink-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-pink-600" />
          <input
            type="text"
            autoFocus
            placeholder="Search jewellery, bags, lip tints, hair bows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-none font-medium text-gray-900 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-pink-600 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters & Price Slider Bar */}
        <div className="p-3 bg-white border-b border-gray-100 space-y-2">
          <div className="flex gap-1.5 overflow-x-auto text-xs pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span>Filter Max Price: <strong>₹{maxPrice}</strong></span>
            <input
              type="range"
              min="300"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-36 accent-pink-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No products found matching "{query}". Try searching "bow", "pink", "tint", or "bag"!
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onClose();
                  onSelectProduct(p);
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50/60 border border-transparent hover:border-pink-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover border border-pink-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-pink-600">{p.category}</span>
                    <h4 className="font-serif font-bold text-xs text-gray-900">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-xs text-gray-900">₹{p.price}</span>
                      <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {p.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-pink-600 p-2">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
