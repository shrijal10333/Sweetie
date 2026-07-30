import React from 'react';
import { Sparkles, Heart, ArrowRight, ShieldCheck, Truck, Gift, Star, RotateCcw } from 'lucide-react';

interface HeroSectionProps {
  onShopNow: () => void;
  onOpenAIStylist: () => void;
  happyCustomerCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow, onOpenAIStylist, happyCustomerCount = 100000 }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 via-rose-50/40 to-white py-12 lg:py-20">
      {/* Background Decorative Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Tagline */}
            <span className="font-serif italic text-sm text-[#DB2777] tracking-wide font-medium">
              Premium Lifestyle Boutique
            </span>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#2D2D2D] tracking-tight leading-[0.95]">
              Cute finds, <br />
              <span>just for you.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#2D2D2D]/70 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              A curated collection of feminine elegance and pastel dreams. Handpicked essentials for the modern woman.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto bg-[#DB2777] hover:bg-[#be185d] text-white font-semibold px-8 py-4 rounded-full shadow-[0_10px_20px_rgba(219,39,119,0.15)] hover:shadow-pink-300 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAIStylist}
                className="w-full sm:w-auto bg-white hover:bg-pink-50 text-[#DB2777] font-semibold px-6 py-4 rounded-full border border-[rgba(219,39,119,0.15)] shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4 text-[#DB2777]" />
                <span>Ask AI Gift Stylist</span>
              </button>
            </div>

            {/* Editorial Featured In Note */}
            <div className="pt-4 text-xs tracking-[2px] text-[#2D2D2D]/50 uppercase font-semibold">
              Featured in: Vogue India • Elle • Harper's Bazaar
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 border-t border-pink-100 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-1 text-pink-600 font-bold text-lg font-serif">
                  <span>{happyCustomerCount > 0 ? `${happyCustomerCount.toLocaleString('en-IN')}+` : '0'}</span>
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500 inline" />
                </div>
                <p className="text-xs text-gray-500 flex items-center justify-center lg:justify-start gap-1">
                  <span>Happy Girls Across India</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live order counter"></span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500 font-bold text-lg font-serif">
                  <span>4.9★</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                </div>
                <p className="text-xs text-gray-500">Verified Reviews</p>
              </div>

              <div>
                <div className="flex items-center justify-center lg:justify-start gap-1 text-rose-600 font-bold text-lg font-serif">
                  <span>7 Days</span>
                  <Truck className="w-4 h-4 text-rose-500 inline" />
                </div>
                <p className="text-xs text-gray-500">Express Delivery</p>
              </div>
            </div>

          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[16/10]">
                <img
                  src="/images/sweetie_hero_banner_1785369621887.jpg"
                  alt="Cherry Lush Store Luxury Pink Fashion Collection"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/30 via-transparent to-transparent"></div>

                {/* Floating Tag Badge 1 */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-pink-100 flex items-center gap-3 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Custom Pink Packaging 🎁</p>
                    <p className="text-[10px] text-gray-500">Free stickers & velvet pouch</p>
                  </div>
                </div>

                {/* Floating Tag Badge 2 */}
                <div className="absolute top-4 right-4 bg-pink-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                  <span>Instagram Trending</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Feature Badges Bar */}
        <div className="mt-12 pt-8 border-t border-pink-100/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white/60 border border-pink-100 shadow-xs flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-pink-500 mb-1" />
            <span className="text-xs font-bold text-gray-800">100% Handpicked Quality</span>
            <span className="text-[10px] text-gray-500">Premium anti-tarnish alloys</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-pink-100 shadow-xs flex flex-col items-center">
            <Truck className="w-6 h-6 text-pink-500 mb-1" />
            <span className="text-xs font-bold text-gray-800">Fast All India Shipping</span>
            <span className="text-[10px] text-gray-500">BlueDart & Delhivery Partners</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-pink-100 shadow-xs flex flex-col items-center">
            <Gift className="w-6 h-6 text-pink-500 mb-1" />
            <span className="text-xs font-bold text-gray-800">Complimentary Gift Packaging</span>
            <span className="text-[10px] text-gray-500">Ready to surprise your bestie</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-pink-100 shadow-xs flex flex-col items-center">
            <RotateCcw className="w-6 h-6 text-pink-500 mb-1" />
            <span className="text-xs font-bold text-gray-800">Hassle-Free 7-Day Return</span>
            <span className="text-[10px] text-gray-500">Easy WhatsApp support</span>
          </div>
        </div>

      </div>
    </section>
  );
};
