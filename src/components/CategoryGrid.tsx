import React from 'react';
import { Category } from '../types';
import { Sparkles, Heart, Gift, Sparkle, Gem, ShoppingBag, Crown, Smile } from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const categoryCards: {
    category: Category;
    title: string;
    itemCount: string;
    badge: string;
    image: string;
    bgColor: string;
  }[] = [
    {
      category: 'Jewellery',
      title: 'Jewellery',
      itemCount: '24+ Cutest Styles',
      badge: 'Anti-Tarnish Gold',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
      bgColor: 'from-pink-100/80 to-rose-50'
    },
    {
      category: 'Bags',
      title: 'Bags & Pouches',
      itemCount: '18+ Pastel Totes',
      badge: 'Soft Plush & Leather',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
      bgColor: 'from-rose-100/80 to-pink-50'
    },
    {
      category: 'Accessories',
      title: 'Hair & Accessories',
      itemCount: '30+ Hair Bows',
      badge: 'Silk & Pearl Claws',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      bgColor: 'from-purple-100/80 to-pink-50'
    },
    {
      category: 'Beauty Products',
      title: 'Beauty & Tints',
      itemCount: '15+ Glassy Tints',
      badge: 'Cruelty-Free',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
      bgColor: 'from-fuchsia-100/80 to-rose-50'
    },
    {
      category: 'Fashion Items',
      title: 'Fashion & Outfits',
      itemCount: '20+ Coquette Tops',
      badge: 'Soft Cashmere & Satin',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
      bgColor: 'from-pink-100/80 to-purple-50'
    },
    {
      category: 'Gift Items',
      title: 'Gift Hampers',
      itemCount: '12+ Luxury Boxes',
      badge: 'Custom Handwritten Note',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
      bgColor: 'from-rose-100/80 to-amber-50'
    }
  ];

  return (
    <section className="py-16 bg-[#FFF5F7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-serif italic text-sm text-[#DB2777] font-semibold tracking-wide">
            Curated Collections
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2D2D] tracking-tight mt-1">
            Shop By Category
          </h2>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categoryCards.map((item) => (
            <div
              key={item.category}
              onClick={() => onSelectCategory(item.category)}
              className="group cursor-pointer bg-white border border-[rgba(219,39,119,0.1)] hover:border-[#DB2777] rounded-[24px] p-4 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center"
            >
              {/* Image Circle */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-[#FFF5F7] shadow-sm group-hover:scale-105 transition-transform">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Info */}
              <h3 className="font-serif font-bold text-[#2D2D2D] text-sm group-hover:text-[#DB2777] transition-colors">
                {item.title}
              </h3>
              
              <span className="text-[11px] text-[#2D2D2D]/60 font-medium mt-0.5">
                {item.itemCount}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
