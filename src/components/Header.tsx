import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  User,
  Settings,
  Bot
} from 'lucide-react';
import { Category, User as UserType } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  cartCount: number;
  wishlistCount: number;
  currentUser: UserType | null;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAIStylist: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (tab?: 'customer' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  wishlistCount,
  currentUser,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenAIStylist,
  onOpenAdmin,
  onOpenAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: Category[] = [
    'Jewellery',
    'Bags',
    'Accessories',
    'Beauty Products',
    'Fashion Items',
    'Gift Items'
  ];

  const handleCategoryClick = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    setActiveTab('shop');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white text-xs font-medium py-1.5 px-4 text-center flex justify-between items-center overflow-hidden">
        <div className="hidden sm:flex items-center gap-4 mx-auto sm:mx-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
            Use Code <strong>CHERRY10</strong> for 10% OFF!
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Free Express Shipping in India above ₹999
          </span>
        </div>

        <div className="mx-auto sm:mx-0 flex items-center gap-3">
          <button 
            onClick={onOpenAIStylist}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full text-[11px] transition-all font-semibold"
          >
            <Bot className="w-3 h-3 text-pink-100" />
            <span>Cherry AI Stylist</span>
          </button>
          
          <a
            href="https://wa.me/919891454247?text=Hi%20Cherry%20Lush%20Store!%20I%20have%20an%20inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 hover:underline text-[11px]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 border-b border-[rgba(219,39,119,0.1)]">
          
          {/* Left: Search Bar Prompt / Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 md:hidden text-[#2D2D2D] hover:text-[#DB2777]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 text-xs text-[#2D2D2D]/60 hover:text-[#DB2777] bg-white px-3.5 py-1.5 rounded-full border border-[rgba(219,39,119,0.15)] transition-all shadow-xs"
            >
              <Search className="w-4 h-4 text-[#DB2777]" />
              <span>Search cute things...</span>
            </button>
          </div>

          {/* Center Brand Logo */}
          <div 
            onClick={() => { setActiveTab('home'); setSelectedCategory('All'); }}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#DB2777] hover:opacity-90 transition-opacity">
              Cherry Lush Store
            </span>
          </div>

          {/* Right Navigation Links & Utilities */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-[12px] uppercase tracking-[1px] font-semibold text-[#2D2D2D]">
              <button
                onClick={() => { setActiveTab('home'); setSelectedCategory('All'); }}
                className={`hover:text-[#DB2777] transition-colors py-1 ${
                  activeTab === 'home' ? 'text-[#DB2777]' : ''
                }`}
              >
                Shop
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`hover:text-[#DB2777] transition-colors py-1 ${
                  activeTab === 'about' ? 'text-[#DB2777]' : ''
                }`}
              >
                About
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`hover:text-[#DB2777] transition-colors py-1 ${
                  activeTab === 'tracking' ? 'text-[#DB2777]' : ''
                }`}
              >
                Tracking
              </button>
            </nav>

            <div className="hidden md:block w-px h-5 bg-gray-200"></div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSearch}
                className="p-1.5 md:hidden text-[#2D2D2D] hover:text-[#DB2777]"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenWishlist}
                className="p-1.5 text-[#2D2D2D] hover:text-[#DB2777] transition-colors relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#DB2777] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenCart}
                className="p-1.5 text-[#2D2D2D] hover:text-[#DB2777] transition-colors relative"
                title="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#DB2777] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Account / Login Button */}
              <button
                onClick={() => onOpenAuth('customer')}
                className="p-1.5 text-[#2D2D2D] hover:text-[#DB2777] transition-colors relative flex items-center gap-1.5"
                title={currentUser ? `Account (${currentUser.name})` : "Login / Sign Up"}
              >
                <User className="w-5 h-5" />
                {currentUser && (
                  <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Admin Portal Link - ONLY VISIBLE IF LOGGED IN AS ADMIN */}
              {currentUser?.isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="bg-[#FFF5F7] border border-[rgba(219,39,119,0.2)] text-[#DB2777] hover:bg-[#DB2777] hover:text-white px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  title="Admin Portal"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-pink-100 px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-medium text-gray-800 hover:text-pink-600"
          >
            Home
          </button>
          
          <div className="py-1">
            <span className="block text-xs font-bold uppercase text-pink-500 tracking-wider mb-2">
              Shop Categories
            </span>
            <div className="grid grid-cols-2 gap-2 pl-2">
              <button
                onClick={() => handleCategoryClick('All')}
                className="text-left text-sm py-1 font-semibold text-pink-600"
              >
                All Collection
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCategoryClick(c)}
                  className="text-left text-xs py-1 text-gray-600 hover:text-pink-600"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { onOpenAIStylist(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full text-left py-2 text-sm font-semibold text-pink-600 bg-pink-50 px-3 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Cherry AI Gift Stylist</span>
          </button>

          <button
            onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-medium text-gray-800 hover:text-pink-600"
          >
            About Us
          </button>

          <button
            onClick={() => { setActiveTab('tracking'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-medium text-gray-800 hover:text-pink-600"
          >
            Track My Order
          </button>

          <button
            onClick={() => { onOpenAuth('customer'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full text-left py-2 text-xs font-semibold text-gray-700 border-t border-gray-100 pt-3"
          >
            <User className="w-4 h-4 text-[#DB2777]" />
            <span>{currentUser ? `Account (${currentUser.name})` : 'Customer Login / Sign Up'}</span>
          </button>

          {/* Admin link on mobile only if logged in as Admin */}
          {currentUser?.isAdmin && (
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-left py-2 text-xs font-bold text-[#DB2777] bg-[#FFF5F7] px-3 rounded-xl"
            >
              <Settings className="w-4 h-4 text-[#DB2777]" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
