import React, { useState } from 'react';
import { Category, User as UserType } from '../types';
import { Heart, Sparkles, Send, Instagram, MessageCircle, ShieldCheck, Truck, Lock, RotateCcw } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  setSelectedCategory: (cat: Category | 'All') => void;
  onOpenAIStylist: () => void;
  onOpenAdmin: () => void;
  currentUser?: UserType | null;
  onOpenAuth?: (tab?: 'customer' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  setSelectedCategory,
  onOpenAIStylist,
  onOpenAdmin,
  currentUser,
  onOpenAuth
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const categories: Category[] = [
    'Jewellery', 'Bags', 'Accessories', 'Beauty Products', 'Fashion Items', 'Gift Items'
  ];

  return (
    <footer className="bg-[#FFF5F7] border-t border-[rgba(219,39,119,0.1)] text-[#2D2D2D] py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
        
        {/* Top Newsletter & Coupon Box */}
        <div className="bg-[#DB2777] text-white p-8 sm:p-10 rounded-[28px] shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-2 text-center md:text-left">
            <span className="bg-white/20 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
              Join The Cherry Club ✨
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold">
              Get 15% OFF Your First Order
            </h3>
            <p className="text-xs text-white/80 max-w-md">
              Subscribe to get secret discount drops, new launch alerts & styling tips directly on email.
            </p>
          </div>

          <div className="md:col-span-5">
            {subscribed ? (
              <div className="bg-white text-[#DB2777] p-4 rounded-2xl text-center text-xs font-bold shadow-md">
                🎉 Yay! Use coupon <strong>PINKLOVE</strong> at checkout for 15% OFF!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs rounded-full bg-white text-[#2D2D2D] focus:outline-none placeholder-gray-400 font-medium"
                />
                <button
                  type="submit"
                  className="bg-[#2D2D2D] text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-black transition-colors shadow-md flex items-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Category Pills Bar (Editorial Theme Pattern) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedCategory(c);
                setActiveTab('shop');
              }}
              className="bg-white border border-[rgba(219,39,119,0.15)] px-5 py-2 rounded-full text-xs font-semibold text-[#DB2777] hover:bg-[#DB2777] hover:text-white transition-all shadow-xs"
            >
              {c}
            </button>
          ))}
        </div>

        {/* 4 Column Footer Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs pt-6 border-t border-[rgba(219,39,119,0.1)]">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <span className="font-serif text-3xl font-bold text-[#DB2777]">
                Cherry Lush Store
              </span>
            </div>

            <p className="text-[#2D2D2D]/70 leading-relaxed max-w-sm">
              India's premier online boutique for coquette jewellery, pastel mini bags, hair bows, glassy lip tints, and custom pamper gift hampers. Handcrafted with love.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/cherrylush.storee/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[rgba(219,39,119,0.2)] text-[#DB2777] hover:bg-[#DB2777] hover:text-white flex items-center justify-center transition-colors"
                title="Instagram @cherrylush.storee"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/919891454247"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-[rgba(219,39,119,0.2)] text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#2D2D2D] uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-[#2D2D2D]/70 font-medium">
              <li>
                <button onClick={() => { setActiveTab('home'); setSelectedCategory('All'); }} className="hover:text-[#DB2777]">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('shop'); setSelectedCategory('All'); }} className="hover:text-[#DB2777]">
                  Shop All Products
                </button>
              </li>
              <li>
                <button onClick={onOpenAIStylist} className="hover:text-[#DB2777] flex items-center gap-1 text-[#DB2777] font-bold">
                  <Sparkles className="w-3 h-3" />
                  AI Gift Finder
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#DB2777]">
                  About Our Brand
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tracking')} className="hover:text-[#DB2777]">
                  Track My Shipment
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="font-serif font-bold text-sm text-[#2D2D2D] uppercase tracking-wider">Customer Care</h4>
            <div className="space-y-2 text-[#2D2D2D]/70">
              <p>📍 Delhi & Cherry Lush Store, India</p>
              <p>💬 WhatsApp: +91 9891454247</p>
              <p>✉️ Samakshcompany@gmail.com</p>
              <p className="pt-2 text-[11px] text-[#DB2777] font-semibold">
                Express 5 to 7-Day Air Delivery to Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, Kolkata, Chennai, Jaipur & 18,000+ Indian Pincodes.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-8 border-t border-[rgba(219,39,119,0.1)] flex flex-col sm:flex-row justify-between items-center text-xs text-[#2D2D2D]/50 gap-4">
          <div className="flex items-center gap-1">
            <span>© 2026 Cherry Lush Store India. Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 fill-[#DB2777] text-[#DB2777] inline" />
            <span>for girls everywhere.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {currentUser?.isAdmin ? (
              <button onClick={onOpenAdmin} className="text-[#DB2777] font-bold hover:underline">
                Admin Dashboard
              </button>
            ) : (
              <button 
                onClick={() => onOpenAuth && onOpenAuth('admin')} 
                className="text-gray-400 hover:text-[#DB2777] underline"
              >
                Admin Access
              </button>
            )}
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms & Conditions</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
