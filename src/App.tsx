import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, Review, Coupon, Order, Category, User, ShippingSettings, RegisteredUser, InstagramPost } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { INITIAL_REVIEWS } from './data/reviews';
import { INITIAL_COUPONS } from './data/coupons';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AboutUs } from './components/AboutUs';
import { AIStylistModal } from './components/AIStylistModal';
import { InstagramGallery } from './components/InstagramGallery';
import { AdminDashboard } from './components/AdminDashboard';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchBarModal } from './components/SearchBarModal';
import { ReviewsSection } from './components/ReviewsSection';
import { AuthModal } from './components/AuthModal';

import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const DEFAULT_SHIPPING: ShippingSettings = {
  standardFee: 0,
  freeShippingThreshold: 0,
  codFee: 0,
  courierName: 'BlueDart Express Air',
  estimatedDays: 7,
};

function normaliseCoupons(raw: Coupon[]): Coupon[] {
  return raw.map(c => ({ ...c, isActive: c.isActive ?? true }));
}

/**
 * Check whether a stored JWT token is structurally valid and not expired.
 * Signature verification happens on the server — this is a client-side
 * expiry guard only.
 */
function isAdminTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload.isAdmin === true && typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function App() {
  // ── Core Data ─────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cherrylush_products') || localStorage.getItem('sweetie_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cherrylush_cart') || localStorage.getItem('sweetie_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cherrylush_wishlist') || localStorage.getItem('sweetie_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('cherrylush_reviews') || localStorage.getItem('sweetie_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('cherrylush_coupons') || localStorage.getItem('sweetie_coupons');
    return saved ? normaliseCoupons(JSON.parse(saved)) : normaliseCoupons(INITIAL_COUPONS);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cherrylush_orders') || localStorage.getItem('sweetie_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(() => {
    const saved = localStorage.getItem('cherrylush_shipping') || localStorage.getItem('sweetie_shipping');
    return saved ? JSON.parse(saved) : DEFAULT_SHIPPING;
  });

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>(() => {
    const saved = localStorage.getItem('cherrylush_insta_posts') || localStorage.getItem('sweetie_insta_posts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cherrylush_insta_posts', JSON.stringify(instagramPosts));
  }, [instagramPosts]);

  const handleAddInstagramPost = (post: InstagramPost) => {
    setInstagramPosts(prev => [post, ...prev.filter(p => p.id !== post.id)]);
    fetch('/api/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    }).catch(() => {});
  };

  const handleDeleteInstagramPost = (id: string) => {
    setInstagramPosts(prev => prev.filter(p => p.id !== id));
    fetch(`/api/instagram/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // ── Fetch products and live order stats from server on mount ─────────────────────────
  const [serverHappyCount, setServerHappyCount] = useState<number>(0);

  const fetchPublicCount = () => {
    fetch('/api/orders/public-count')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.totalOrders === 'number') {
          setServerHappyCount(data.totalOrders);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.ok ? res.json() : null)
      .then(serverProds => {
        if (Array.isArray(serverProds) && serverProds.length >= 0) {
          setProducts(serverProds);
          localStorage.setItem('cherrylush_products', JSON.stringify(serverProds));
        }
      })
      .catch(() => {});

    fetch('/api/instagram')
      .then(res => res.ok ? res.json() : null)
      .then(serverInsta => {
        if (Array.isArray(serverInsta)) {
          setInstagramPosts(serverInsta);
          localStorage.setItem('cherrylush_insta_posts', JSON.stringify(serverInsta));
        }
      })
      .catch(() => {});

    fetchPublicCount();
    const interval = setInterval(fetchPublicCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const liveHappyCount = Math.max(serverHappyCount, orders.length);

  // ── Auth: user identity ───────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cherrylush_user') || localStorage.getItem('sweetie_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem('cherrylush_admin_token') || localStorage.getItem('sweetie_admin_token')
  );

  const isAdmin = isAdminTokenValid(adminToken);

  // ── UI States ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'discount'>('featured');
  const [priceRange, setPriceRange] = useState<number>(3500);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIStylistOpen, setIsAIStylistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [liveVisitors, setLiveVisitors] = useState(0);

  // ── Visitor heartbeat — pings server every 30s so admin can count live users ──
  useEffect(() => {
    const sid = (() => {
      let s = sessionStorage.getItem('cherrylush_sid') || sessionStorage.getItem('sweetie_sid');
      if (!s) { s = `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`; sessionStorage.setItem('cherrylush_sid', s); }
      return s;
    })();
    const ping = () => fetch('/api/analytics/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid }) }).catch(() => {});
    ping();
    const t = setInterval(ping, 30_000);
    return () => clearInterval(t);
  }, []);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedModalProduct, setSelectedModalProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [trackingInitialId, setTrackingInitialId] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Persistence Effects ───────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser) localStorage.setItem('cherrylush_user', JSON.stringify(currentUser));
    else localStorage.removeItem('cherrylush_user');
  }, [currentUser]);

  useEffect(() => {
    if (adminToken) localStorage.setItem('cherrylush_admin_token', adminToken);
    else localStorage.removeItem('cherrylush_admin_token');
  }, [adminToken]);

  useEffect(() => { localStorage.setItem('cherrylush_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cherrylush_cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('cherrylush_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('cherrylush_reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('cherrylush_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('cherrylush_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('cherrylush_shipping', JSON.stringify(shippingSettings)); }, [shippingSettings]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Admin ─────────────────────────────────────────────────────────────────
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  /** Called when a customer logs in or registers. */
  const handleLoginSuccess = (user: User) => {
    setCurrentUser({ ...user, isAdmin: false }); // never trust client-side isAdmin
  };

  /** Called after server-verified admin login — stores the signed JWT. */
  const handleAdminToken = (token: string, user: User) => {
    setAdminToken(token);
    setCurrentUser({ ...user, isAdmin: false }); // display only; real auth via token
    // Fetch registered users + server orders for admin dashboard
    fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRegisteredUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((serverOrders: Order[]) => {
        if (Array.isArray(serverOrders) && serverOrders.length > 0) {
          setOrders(prev => {
            // Merge: server orders + any local-only orders not yet on server
            const serverIds = new Set(serverOrders.map(o => o.id));
            const localOnly = prev.filter(o => !serverIds.has(o.id));
            return [...serverOrders, ...localOnly];
          });
        }
      })
      .catch(() => {});
  };

  /** Called by AdminDashboard SSE stream with fresh data */
  const handleLiveUpdate = useCallback((users: RegisteredUser[], visitors: number) => {
    setRegisteredUsers(users);
    setLiveVisitors(visitors);
  }, []);

  /** Called by AdminDashboard SSE stream when a new order arrives from a customer */
  const handleNewOrderFromSSE = useCallback((order: Order) => {
    setOrders(prev => {
      if (prev.some(o => o.id === order.id)) return prev; // dedupe
      return [order, ...prev];
    });
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setAdminToken(null);
    setIsAdminOpen(false);
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product, selectedColor?: string, selectedSize?: string, quantity = 1) => {
    const existingIndex = cartItems.findIndex(
      ci => ci.product.id === product.id && ci.selectedColor === selectedColor && ci.selectedSize === selectedSize
    );
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { product, selectedColor, selectedSize, quantity }]);
    }
    showToast(`Added "${product.name}" to cart! 🛍️`);
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCartItems(cartItems.filter((_, i) => i !== index));
    } else {
      const updated = [...cartItems];
      updated[index].quantity = newQty;
      setCartItems(updated);
    }
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
      showToast('Removed from wishlist');
    } else {
      setWishlist([...wishlist, product]);
      showToast('Saved to your wishlist! 💖');
    }
  };

  // ── Coupons ───────────────────────────────────────────────────────────────
  const handleApplyCoupon = (code: string): boolean => {
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive !== false);
    if (found) {
      setAppliedCoupon(found);
      showToast(`Coupon ${found.code} applied! 🎉`);
      return true;
    }
    return false;
  };

  // ── Orders ────────────────────────────────────────────────────────────────
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setPlacedOrder(newOrder);
    // Save to server so admin sees it from any browser
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
      .then(() => fetchPublicCount())
      .catch(() => {});
  };

  // ── Admin: Products ───────────────────────────────────────────────────────
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    }).catch(() => {});
    showToast('Product added!');
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProd),
    }).catch(() => {});
    showToast('Product updated!');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const remaining = prev.filter(p => p.id !== productId);
      localStorage.setItem('cherrylush_products', JSON.stringify(remaining));
      return remaining;
    });
    setCartItems(prev => prev.filter(ci => ci.product.id !== productId));
    setWishlist(prev => prev.filter(p => p.id !== productId));
    setSelectedModalProduct(prev => prev?.id === productId ? null : prev);
    fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
      },
    }).catch(() => {});
    showToast('Product removed');
  };

  // ── Admin: Orders ─────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus'], adminDeliveryDate?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status, ...(adminDeliveryDate !== undefined ? { adminDeliveryDate } : {}) } : o));
    showToast(`Order status → ${status}`);
    if (adminToken) {
      fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ orderStatus: status, ...(adminDeliveryDate !== undefined ? { adminDeliveryDate } : {}) }),
      }).catch(() => {});
    }
  };

  // ── Admin: Coupons ────────────────────────────────────────────────────────
  const handleAddCoupon = (coupon: Coupon) => {
    setCoupons([...coupons, coupon]);
    showToast(`Coupon ${coupon.code} created!`);
  };

  const handleUpdateCoupon = (updated: Coupon) => {
    setCoupons(coupons.map(c => c.code === updated.code ? updated : c));
    if (appliedCoupon?.code === updated.code && updated.isActive === false) setAppliedCoupon(null);
    showToast(`Coupon ${updated.code} updated`);
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(coupons.filter(c => c.code !== code));
    if (appliedCoupon?.code === code) setAppliedCoupon(null);
    showToast(`Coupon ${code} deleted`);
  };

  // ── Admin: Shipping ───────────────────────────────────────────────────────
  const handleUpdateShippingSettings = (settings: ShippingSettings) => {
    setShippingSettings(settings);
  };

  // ── Filtered Products ─────────────────────────────────────────────────────
  const displayedProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.price <= priceRange)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return 0;
    });

  const featuredProducts = products.filter(p => p.isFeatured || p.isBestSeller);
  const bestSellers = products.filter(p => p.isBestSeller);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-pink-200 selection:text-pink-900">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-pink-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAIStylist={() => setIsAIStylistOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">

        {/* HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <HeroSection
              onShopNow={() => { setSelectedCategory('All'); setActiveTab('shop'); }}
              onOpenAIStylist={() => setIsAIStylistOpen(true)}
              happyCustomerCount={liveHappyCount}
            />
            <CategoryGrid onSelectCategory={(cat) => { setSelectedCategory(cat); setActiveTab('shop'); }} />

            {/* Featured */}
            <section className="py-12 bg-gradient-to-b from-white via-pink-50/30 to-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">Trending Now 🔥</span>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mt-2">Featured Cherry Finds</h2>
                  </div>
                  <button onClick={() => { setSelectedCategory('All'); setActiveTab('shop'); }}
                    className="text-pink-600 font-bold text-xs hover:underline">View Entire Shop →</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {featuredProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product}
                      onOpenModal={(p) => setSelectedModalProduct(p)}
                      onAddToCart={(p, e) => { e.stopPropagation(); handleAddToCart(p); }}
                      onToggleWishlist={(p, e) => handleToggleWishlist(p, e)}
                      isWishlisted={wishlist.some(w => w.id === product.id)} />
                  ))}
                </div>
              </div>
            </section>

            {/* Best Sellers */}
            <section className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-200">Most Loved 💖</span>
                  <h2 className="text-3xl font-serif font-bold text-gray-900">All-Time Best Sellers</h2>
                  <p className="text-gray-500 text-xs">Our highest rated jewellery, lip tints, and bags.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {bestSellers.map((product) => (
                    <ProductCard key={product.id} product={product}
                      onOpenModal={(p) => setSelectedModalProduct(p)}
                      onAddToCart={(p, e) => { e.stopPropagation(); handleAddToCart(p); }}
                      onToggleWishlist={(p, e) => handleToggleWishlist(p, e)}
                      isWishlisted={wishlist.some(w => w.id === product.id)} />
                  ))}
                </div>
              </div>
            </section>

            <InstagramGallery
              products={products}
              posts={instagramPosts}
              onSelectProduct={(p) => setSelectedModalProduct(p)}
              onAddPost={handleAddInstagramPost}
              onDeletePost={handleDeleteInstagramPost}
              isAdmin={isAdmin}
            />
            <ReviewsSection reviews={reviews} onAddReview={(rev) => setReviews([rev, ...reviews])} />
          </div>
        )}

        {/* SHOP */}
        {activeTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 p-6 sm:p-10 rounded-3xl border border-pink-200/60 text-center space-y-3">
              <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-white px-3.5 py-1 rounded-full border border-pink-200 shadow-sm">Cherry Lush Store</span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
                {selectedCategory === 'All' ? 'Complete Collection' : selectedCategory}
              </h1>
              <p className="text-gray-500 text-xs max-w-lg mx-auto">Handpicked anti-tarnish jewellery, pastel bags, glassy tints, hair bows, and gift hampers.</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pink-100">
              <button onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-pink-600 text-white shadow-md' : 'bg-pink-50 text-gray-700 hover:bg-pink-100'}`}>
                All ({products.length})
              </button>
              {(['Jewellery', 'Bags', 'Accessories', 'Beauty Products', 'Fashion Items', 'Gift Items'] as Category[]).map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-pink-600 text-white shadow-md' : 'bg-pink-50 text-gray-700 hover:bg-pink-100'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <SlidersHorizontal className="w-4 h-4 text-pink-600" />
                <span>Showing <strong>{displayedProducts.length}</strong> items</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Max: <strong>₹{priceRange}</strong></span>
                  <input type="range" min="350" max="3500" step="100" value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-28 accent-pink-600 cursor-pointer" />
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 font-semibold text-gray-800 focus:outline-none focus:border-pink-500">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-pink-50/30 rounded-3xl border border-pink-100">
                <p className="font-serif font-bold text-lg text-gray-700">No products found!</p>
                <p className="text-xs text-gray-500">Try adjusting your filters.</p>
                <button onClick={() => { setSelectedCategory('All'); setPriceRange(3500); }}
                  className="bg-pink-600 text-white font-bold text-xs px-5 py-2 rounded-full shadow-md">Reset Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product}
                    onOpenModal={(p) => setSelectedModalProduct(p)}
                    onAddToCart={(p, e) => { e.stopPropagation(); handleAddToCart(p); }}
                    onToggleWishlist={(p, e) => handleToggleWishlist(p, e)}
                    isWishlisted={wishlist.some(w => w.id === product.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <AboutUs
            onExplore={() => { setSelectedCategory('All'); setActiveTab('shop'); }}
            happyCustomerCount={liveHappyCount}
          />
        )}

        {activeTab === 'tracking' && (
          <OrderTrackingView orders={orders} initialOrderId={trackingInitialId} onBackToHome={() => setActiveTab('home')} />
        )}
      </main>

      <Footer
        setActiveTab={setActiveTab}
        setSelectedCategory={setSelectedCategory}
        onOpenAIStylist={() => setIsAIStylistOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal — admin login verified by server JWT, never client-side */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
        onAdminToken={handleAdminToken}
        onLogout={handleLogout}
        onOpenAdminDashboard={() => setIsAdminOpen(true)}
      />

      <ProductModal
        product={selectedModalProduct}
        onClose={() => setSelectedModalProduct(null)}
        onAddToCart={(p, color, size, qty) => { handleAddToCart(p, color, size, qty); setSelectedModalProduct(null); }}
        onBuyNow={(p, color, size, qty) => { handleAddToCart(p, color, size, qty); setSelectedModalProduct(null); setIsCheckoutOpen(true); }}
        onToggleWishlist={(p) => handleToggleWishlist(p)}
        isWishlisted={selectedModalProduct ? wishlist.some(w => w.id === selectedModalProduct.id) : false}
      />

      {/* Cart — shipping values come from live admin settings */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={() => setAppliedCoupon(null)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        availableCoupons={coupons}
        shippingSettings={shippingSettings}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveFromWishlist={(p) => handleToggleWishlist(p)}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedModalProduct(p)}
      />

      <AIStylistModal
        isOpen={isAIStylistOpen}
        onClose={() => setIsAIStylistOpen(false)}
        products={products}
        onOpenProductModal={(p) => setSelectedModalProduct(p)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        appliedCoupon={appliedCoupon}
        onOrderPlaced={handleOrderPlaced}
        shippingSettings={shippingSettings}
      />

      <OrderSuccessModal
        order={placedOrder}
        onClose={() => setPlacedOrder(null)}
        onTrackOrder={(orderId) => { setTrackingInitialId(orderId); setActiveTab('tracking'); }}
      />

      {/* Admin Dashboard — only rendered when isAdmin (JWT-validated) */}
      {isAdminOpen && isAdmin && adminToken && (
        <AdminDashboard
          products={products}
          orders={orders}
          coupons={coupons}
          shippingSettings={shippingSettings}
          registeredUsers={registeredUsers}
          instagramPosts={instagramPosts}
          liveVisitors={liveVisitors}
          adminToken={adminToken}
          onLiveUpdate={handleLiveUpdate}
          onNewOrder={handleNewOrderFromSSE}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateShippingSettings={handleUpdateShippingSettings}
          onAddCoupon={handleAddCoupon}
          onUpdateCoupon={handleUpdateCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onAddInstagramPost={handleAddInstagramPost}
          onDeleteInstagramPost={handleDeleteInstagramPost}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
