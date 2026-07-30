import React from 'react';
import { Heart, Sparkles, ShieldCheck, Gift, Star, Award, ArrowRight } from 'lucide-react';

interface AboutUsProps {
  onExplore: () => void;
  happyCustomerCount?: number;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onExplore, happyCustomerCount = 100000 }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      
      {/* Hero Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 inline-block">
          Our Brand Story 🌸
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 tracking-tight">
          Welcome to Cherry Lush Store
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Crafting aesthetic, cute, and accessible luxury fashion for girls and women across India.
        </p>
      </div>

      {/* Boutique Image & Founder Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-gradient-to-r from-pink-50 via-rose-50/50 to-pink-50 p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-sm">
        
        <div className="md:col-span-6 rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
          <img
            src="/images/sweetie_boutique_about_1785369633894.jpg"
            alt="Cherry Lush Store Jaipur & Mumbai Boutique Interior"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="md:col-span-6 space-y-4">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Handpicked with Love & Sparkles ✨
          </h2>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            Cherry Lush Store was born out of a simple passion: every girl deserves to feel royal, confident, and celebrated with aesthetic pieces that don't fade or break the bank.
          </p>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            From coquette rose-gold bow earrings and anti-tarnish heart pendants to plush quilted shoulder bags, glassy lip tints, and custom pamper gift boxes, every item is handpicked, quality-checked, and packed in our signature pink tissue with free stickers and velvet pouches.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-serif font-bold flex items-center justify-center shadow-md">
              CL
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-gray-900">Cherry Lush Store</p>
              <p className="text-[11px] text-pink-600 font-medium">Founder & Creative Director, Cherry Lush Store India</p>
            </div>
          </div>
        </div>

      </div>

      {/* Why Customers Trust Us */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Why {happyCustomerCount > 0 ? `${happyCustomerCount.toLocaleString('en-IN')}+` : '0'} Girls Trust Cherry Lush Store
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            We prioritize quality, transparency, and unboxing joy above all.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-sm text-gray-900">100% Anti-Tarnish Alloys</h3>
            <p className="text-xs text-gray-500">
              Our 18k gold & rose-gold plated jewellery is water-resistant & hypoallergenic.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-sm text-gray-900">Unboxing Joy Guarantee</h3>
            <p className="text-xs text-gray-500">
              Every parcel comes wrapped in pink tissue, silk ribbons & custom stickers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-sm text-gray-900">Verified 4.9★ Reviews</h3>
            <p className="text-xs text-gray-500">
              Thousands of honest customer photos and unboxing videos across Instagram.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-sm text-gray-900">Express All-India Delivery</h3>
            <p className="text-xs text-gray-500">
              Dispatched within 24 hours via BlueDart & Delhivery Express Air.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-serif font-bold">Ready to find your next favorite piece?</h3>
        <p className="text-xs text-pink-100 max-w-lg mx-auto">
          Use coupon <strong>CHERRY10</strong> at checkout for 10% OFF your first order!
        </p>
        <button
          onClick={onExplore}
          className="bg-white text-pink-700 font-bold text-xs px-8 py-3.5 rounded-full shadow-lg hover:bg-pink-50 transition-colors inline-flex items-center gap-2"
        >
          <span>Explore Cherry Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
