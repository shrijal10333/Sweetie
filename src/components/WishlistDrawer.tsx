import React from 'react';
import { Product } from '../types';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left">
        
        {/* Header */}
        <div className="p-4 bg-pink-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 fill-pink-500" />
            <h2 className="font-serif font-bold text-lg text-gray-900">Your Saved Wishlist</h2>
            <span className="bg-pink-200 text-pink-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {wishlistItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-pink-600 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <p className="font-serif font-bold text-gray-700 text-lg">Your wishlist is empty!</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Tap the heart icon on any product to save your dream jewellery & bags.
              </p>
            </div>
          ) : (
            wishlistItems.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-pink-100 bg-white shadow-xs hover:border-pink-200 transition-all"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-16 h-16 rounded-xl object-cover border border-pink-50"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-pink-600 uppercase">{p.category}</span>
                  <h4 className="font-serif font-bold text-xs text-gray-900 truncate">{p.name}</h4>
                  <p className="font-serif font-bold text-sm text-gray-900 mt-0.5">₹{p.price}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      onAddToCart(p);
                      onRemoveFromWishlist(p);
                    }}
                    className="bg-pink-600 text-white p-2 rounded-xl text-xs font-bold hover:bg-pink-700 transition-colors flex items-center gap-1 shadow-xs"
                    title="Move to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(p)}
                    className="p-1 text-gray-400 hover:text-rose-600 transition-colors text-center"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
