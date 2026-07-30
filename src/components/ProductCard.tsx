import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  isWishlisted: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenModal,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div 
      onClick={() => onOpenModal(product)}
      className="group relative rounded-[24px] overflow-hidden bg-[#FFF5F7] border border-[rgba(219,39,119,0.1)] hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Badges & Wishlist Button */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
        
        {/* Discount / Category Badge */}
        <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-[#DB2777] uppercase shadow-xs pointer-events-auto">
          {product.discountPercent > 0 ? `${product.discountPercent}% OFF` : product.category}
        </span>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => onToggleWishlist(product, e)}
          className={`p-2 rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-xs ${
            isWishlisted 
              ? 'bg-[#DB2777] text-white scale-110' 
              : 'bg-white/90 text-gray-400 hover:text-[#DB2777]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Product Image Frame */}
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-[#FCE7F3]/40"
        onMouseEnter={() => {
          if (product.images.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Low Stock Warning */}
        {product.stockCount <= 8 && product.inStock && (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stockCount} left
          </div>
        )}
      </div>

      {/* Editorial Product Info Content */}
      <div className="p-4 bg-white flex-1 flex flex-col justify-between space-y-2 border-t border-[rgba(219,39,119,0.08)]">
        <div>
          <h3 className="font-serif text-base font-bold text-[#2D2D2D] line-clamp-1 group-hover:text-[#DB2777] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#2D2D2D]/60 uppercase tracking-wider font-semibold mt-0.5">
            {product.category}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-pink-50">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-[#DB2777]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={(e) => onAddToCart(product, e)}
            className="bg-[#FFF5F7] hover:bg-[#DB2777] text-[#DB2777] hover:text-white p-2 rounded-full transition-colors border border-[rgba(219,39,119,0.15)] shadow-xs"
            title="Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
