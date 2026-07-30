import React, { useState, useRef, useEffect } from 'react';
import { Product, Order, Category, Coupon, ShippingSettings, RegisteredUser, InstagramPost } from '../types';
import {
  Settings, Plus, Trash2, Edit3, Package, ShoppingBag, TrendingUp,
  X, ArrowLeft, Truck, Tag, ToggleLeft, ToggleRight, Save, AlertTriangle,
  Upload, ImageIcon, Users, Wifi, Radio, Instagram, Camera, Play
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  shippingSettings: ShippingSettings;
  registeredUsers: RegisteredUser[];
  instagramPosts: InstagramPost[];
  liveVisitors: number;
  adminToken: string;
  onLiveUpdate: (users: RegisteredUser[], visitors: number) => void;
  onNewOrder: (order: Order) => void;
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus'], adminDeliveryDate?: string) => void;
  onUpdateShippingSettings: (settings: ShippingSettings) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onAddInstagramPost: (post: InstagramPost) => void;
  onDeleteInstagramPost: (id: string) => void;
  onClose: () => void;
}

type Tab = 'overview' | 'products' | 'orders' | 'coupons' | 'instagram' | 'shipping' | 'users';

const categories: Category[] = ['Jewellery', 'Bags', 'Accessories', 'Beauty Products', 'Fashion Items', 'Gift Items'];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  coupons,
  shippingSettings,
  registeredUsers,
  instagramPosts = [],
  liveVisitors,
  adminToken,
  onLiveUpdate,
  onNewOrder,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateShippingSettings,
  onAddCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  onAddInstagramPost,
  onDeleteInstagramPost,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ── SSE connection for live updates ───────────────────────────────────────
  useEffect(() => {
    const es = new EventSource(`/api/admin/stream?token=${encodeURIComponent(adminToken)}`);
    es.onopen = () => setIsConnected(true);
    es.onerror = () => setIsConnected(false);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.users) onLiveUpdate(data.users, data.liveVisitors ?? 0);
        // New order placed by a customer → add it to the admin orders list
        if (data.type === 'new_order' && data.order) onNewOrder(data.order);
        setLastUpdated(new Date());
        setIsConnected(true);
      } catch {}
    };
    return () => es.close();
  }, [adminToken]);

  // ── Product form ──────────────────────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<Category>('Jewellery');
  const [pPrice, setPPrice] = useState<number>(799);
  const [pOriginal, setPOriginal] = useState<number>(1299);
  const [pImage1, setPImage1] = useState(DEFAULT_IMAGE);
  const [pImage2, setPImage2] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pStock, setPStock] = useState<number>(20);
  const [pBestSeller, setPBestSeller] = useState(false);
  const [pNewArrival, setPNewArrival] = useState(true);
  const [pColors, setPColors] = useState('Rose Gold, Silver');
  const [pImageUploadMode1, setPImageUploadMode1] = useState<'url' | 'file'>('url');
  const [pImageUploadMode2, setPImageUploadMode2] = useState<'url' | 'file'>('url');
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Coupon form ───────────────────────────────────────────────────────────
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState<number>(10);
  const [cMin, setCMin] = useState<number>(499);
  const [cDesc, setCDesc] = useState('');
  const [cActive, setCActive] = useState(true);
  const [couponError, setCouponError] = useState<string | null>(null);

  // ── Shipping form ─────────────────────────────────────────────────────────
  const [shipFee, setShipFee] = useState(shippingSettings.standardFee);
  const [shipThreshold, setShipThreshold] = useState(shippingSettings.freeShippingThreshold);
  const [shipCodFee, setShipCodFee] = useState(shippingSettings.codFee);
  const [shipCourier, setShipCourier] = useState(shippingSettings.courierName);
  const [shipDays, setShipDays] = useState(shippingSettings.estimatedDays);
  const [shipSaved, setShipSaved] = useState(false);

  // ── Instagram form ────────────────────────────────────────────────────────
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [instaHandle, setInstaHandle] = useState('cherrylush.storee');
  const [instaPostUrl, setInstaPostUrl] = useState('');
  const [instaImageUrl, setInstaImageUrl] = useState('');
  const [instaCaption, setInstaCaption] = useState('');
  const [instaIsReel, setInstaIsReel] = useState(true);
  const [instaTaggedProdId, setInstaTaggedProdId] = useState('');
  const [instaLikes, setInstaLikes] = useState('');
  const [instaComments, setInstaComments] = useState('');
  const [instaImgUploadMode, setInstaImgUploadMode] = useState<'url' | 'file'>('url');
  const instaFileInputRef = useRef<HTMLInputElement>(null);

  const resetInstaForm = () => {
    setInstaPostUrl('');
    setInstaImageUrl('');
    setInstaCaption('');
    setInstaTaggedProdId('');
    setInstaLikes('');
    setInstaComments('');
    setShowInstaModal(false);
  };

  const handleSaveInstaPost = (e: React.FormEvent) => {
    e.preventDefault();
    const handleClean = instaHandle.trim().replace(/^@/, '') || 'cherrylush.storee';
    const finalUrl = instaPostUrl.trim() || `https://www.instagram.com/${handleClean}/`;
    const autoIsReel = instaIsReel || finalUrl.toLowerCase().includes('/reel/');

    const newPost: InstagramPost = {
      id: `insta-${Date.now()}`,
      imageUrl: instaImageUrl.trim() || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
      likes: instaLikes ? parseInt(instaLikes) : Math.floor(Math.random() * 350) + 120,
      comments: instaComments ? parseInt(instaComments) : Math.floor(Math.random() * 25) + 6,
      caption: instaCaption.trim() || `New ${autoIsReel ? 'reel' : 'post'} from @${handleClean}! ✨`,
      taggedProductId: instaTaggedProdId,
      author: handleClean,
      isReel: autoIsReel,
      postUrl: finalUrl
    };

    onAddInstagramPost(newPost);
    resetInstaForm();
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.orderStatus !== 'Delivered').length;

  // ── Product helpers ───────────────────────────────────────────────────────
  const resetProductForm = () => {
    setPName(''); setPCategory('Jewellery'); setPPrice(799); setPOriginal(1299);
    setPImage1(DEFAULT_IMAGE); setPImage2(''); setPDesc(''); setPStock(20);
    setPBestSeller(false); setPNewArrival(true); setPColors('Rose Gold, Silver');
    setEditingProduct(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || pPrice <= 0) return;
    const discount = pOriginal > pPrice ? Math.round(((pOriginal - pPrice) / pOriginal) * 100) : 0;
    const colors = pColors ? pColors.split(',').map(s => s.trim()).filter(Boolean) : [];
    const images = [pImage1, pImage2].filter(Boolean);

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, name: pName, category: pCategory, price: pPrice, originalPrice: pOriginal, discountPercent: discount, images, description: pDesc, stockCount: pStock, inStock: pStock > 0, isBestSeller: pBestSeller, isNewArrival: pNewArrival, colors });
      setEditingProduct(null);
    } else {
      onAddProduct({
        id: `prod-${Date.now()}`, name: pName, category: pCategory, price: pPrice, originalPrice: pOriginal, discountPercent: discount,
        rating: 5.0, reviewCount: 0, images, description: pDesc, inStock: pStock > 0, stockCount: pStock,
        isBestSeller: pBestSeller, isNewArrival: pNewArrival, colors, tags: [pCategory.toLowerCase(), pName.toLowerCase()],
      });
    }
    setShowProductModal(false);
    resetProductForm();
  };

  const handleStartEditProduct = (p: Product) => {
    setEditingProduct(p); setPName(p.name); setPCategory(p.category); setPPrice(p.price);
    setPOriginal(p.originalPrice); setPImage1(p.images[0] || ''); setPImage2(p.images[1] || '');
    setPDesc(p.description); setPStock(p.stockCount); setPBestSeller(!!p.isBestSeller);
    setPNewArrival(!!p.isNewArrival); setPColors(p.colors ? p.colors.join(', ') : '');
    setShowProductModal(true);
  };

  // ── Coupon helpers ────────────────────────────────────────────────────────
  const resetCouponForm = () => {
    setCCode(''); setCType('percentage'); setCValue(10); setCMin(499); setCDesc(''); setCActive(true);
    setEditingCoupon(null); setCouponError(null);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const cleanCode = cCode.trim().toUpperCase();
    if (!cleanCode) { setCouponError('Coupon code is required.'); return; }
    if (cValue <= 0) { setCouponError('Discount value must be > 0.'); return; }
    if (cType === 'percentage' && cValue > 100) { setCouponError('Percentage cannot exceed 100.'); return; }

    if (!editingCoupon) {
      if (coupons.some(c => c.code === cleanCode)) { setCouponError('A coupon with this code already exists.'); return; }
      onAddCoupon({ code: cleanCode, discountType: cType, value: cValue, minOrderValue: cMin, description: cDesc, isActive: cActive });
    } else {
      onUpdateCoupon({ code: cleanCode, discountType: cType, value: cValue, minOrderValue: cMin, description: cDesc, isActive: cActive });
    }
    setShowCouponModal(false);
    resetCouponForm();
  };

  const handleStartEditCoupon = (c: Coupon) => {
    setEditingCoupon(c); setCCode(c.code); setCType(c.discountType); setCValue(c.value);
    setCMin(c.minOrderValue); setCDesc(c.description); setCActive(c.isActive ?? true);
    setShowCouponModal(true);
  };

  // ── Shipping save ─────────────────────────────────────────────────────────
  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShippingSettings({ standardFee: shipFee, freeShippingThreshold: shipThreshold, codFee: shipCodFee, courierName: shipCourier, estimatedDays: shipDays });
    setShipSaved(true);
    setTimeout(() => setShipSaved(false), 2500);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm flex justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl my-4 sm:my-8 rounded-3xl shadow-2xl border border-pink-100 flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="p-4 sm:p-6 bg-gray-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-pink-200">Cherry Lush Store Admin</h1>
              <p className="text-xs text-gray-400">Full store control panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back to Store</span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 bg-pink-50/50 px-4 sm:px-6 pt-3 text-xs font-bold text-gray-600 gap-1 sm:gap-4 overflow-x-auto flex-shrink-0">
          {([
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'products', icon: Package, label: `Products (${products.length})` },
            { id: 'orders', icon: ShoppingBag, label: `Orders (${orders.length})` },
            { id: 'coupons', icon: Tag, label: `Coupons (${coupons.length})` },
            { id: 'instagram', icon: Instagram, label: `Insta Feed (${instagramPosts.length})` },
            { id: 'shipping', icon: Truck, label: 'Shipping' },
            { id: 'users', icon: Users, label: `Users (${registeredUsers.length})` },
          ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors px-1 ${
                activeTab === id ? 'border-pink-600 text-pink-600' : 'border-transparent hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Live status bar */}
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-semibold ${isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span>{isConnected ? 'Live — auto-updating every 5s' : 'Connecting...'}</span>
                </div>
                {lastUpdated && (
                  <span className="text-[10px] opacity-70">Last updated: {lastUpdated.toLocaleTimeString('en-IN')}</span>
                )}
              </div>

              {/* Live visitors card + stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {/* Live visitors — prominent */}
                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-emerald-200 space-y-1 relative overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase text-emerald-700">Live on Site</span>
                  </div>
                  <p className="text-3xl font-serif font-bold text-gray-900">{liveVisitors}</p>
                  <p className="text-[10px] text-emerald-600">visitors right now</p>
                </div>
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'from-pink-50 to-rose-100 border-pink-200', text: 'text-pink-700' },
                  { label: 'Total Orders', value: String(orders.length), color: 'from-purple-50 to-pink-100 border-purple-200', text: 'text-purple-700' },
                  { label: 'Pending Orders', value: String(pendingOrders), color: 'from-amber-50 to-orange-100 border-amber-200', text: 'text-amber-700' },
                  { label: 'Registered Users', value: String(registeredUsers.length), color: 'from-emerald-50 to-teal-100 border-emerald-200', text: 'text-emerald-700' },
                ].map((card) => (
                  <div key={card.label} className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border space-y-1`}>
                    <span className={`text-[10px] font-bold uppercase ${card.text}`}>{card.label}</span>
                    <p className="text-2xl font-serif font-bold text-gray-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-pink-100 p-4 space-y-3">
                <h3 className="font-serif font-bold text-sm text-gray-900">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                          <th className="py-2">Order ID</th>
                          <th className="py-2">Customer</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.slice(0, 8).map((o) => (
                          <tr key={o.id}>
                            <td className="py-2.5 font-bold text-pink-700">{o.id}</td>
                            <td className="py-2.5">{o.customerDetails.fullName}</td>
                            <td className="py-2.5 font-bold">₹{o.totalAmount}</td>
                            <td className="py-2.5">
                              <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{o.orderStatus}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-base text-gray-900">Product Catalog</h3>
                <button
                  onClick={() => { resetProductForm(); setShowProductModal(true); }}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /><span>Add Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No products yet. Add your first product!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="p-3 bg-white rounded-2xl border border-pink-100 shadow-sm flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-pink-50 flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-pink-600">{p.category}</span>
                        <h4 className="font-serif font-bold text-xs text-gray-900 truncate">{p.name}</h4>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">₹{p.price} <span className="text-[10px] text-gray-400 font-normal line-through">₹{p.originalPrice}</span></p>
                        <p className="text-[10px] text-gray-500">Stock: {p.stockCount} {p.stockCount === 0 && <span className="text-rose-600 font-bold">• Out of stock</span>}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {confirmDeleteId === p.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-rose-600 font-bold">Delete?</span>
                            <button onClick={() => { onDeleteProduct(p.id); setConfirmDeleteId(null); }} className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-colors">Yes</button>
                            <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-colors">No</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleStartEditProduct(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => setConfirmDeleteId(p.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900">Manage Orders</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No orders placed yet.</div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 bg-white rounded-2xl border border-pink-100 shadow-sm space-y-3 text-xs">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-2 gap-2">
                        <div>
                          <span className="font-serif font-bold text-sm text-pink-700">{o.id}</span>
                          <span className="text-gray-400 text-[11px] ml-2">• {o.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">Status:</span>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['orderStatus'])}
                            className="px-2.5 py-1 rounded-xl border border-pink-200 text-xs font-bold text-pink-700 bg-pink-50"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Packed with Ribbon">Packed with Ribbon</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                        <div>
                          <p><strong>Customer:</strong> {o.customerDetails.fullName} ({o.customerDetails.phone})</p>
                          <p><strong>Address:</strong> {o.customerDetails.addressLine1}, {o.customerDetails.city}, {o.customerDetails.state} - {o.customerDetails.pincode}</p>
                        </div>
                        <div>
                          <p><strong>Payment:</strong> {o.paymentMethod.toUpperCase()} — {o.paymentStatus}</p>
                          <p><strong>Total:</strong> ₹{o.totalAmount} {o.couponApplied && `(Coupon: ${o.couponApplied})`}</p>
                          <p><strong>Items:</strong> {o.items.map(i => `${i.quantity}× ${i.product.name}`).join(', ')}</p>
                        </div>
                      </div>
                      {/* Admin custom delivery date override */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-600">Delivery Date:</span>
                          <span className="text-emerald-700 font-bold">
                            {o.adminDeliveryDate
                              ? new Date(o.adminDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : o.estimatedDeliveryDate}
                          </span>
                          {o.adminDeliveryDate && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">Custom</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-gray-400 text-[10px]">Override:</span>
                          <input
                            type="date"
                            defaultValue={o.adminDeliveryDate || ''}
                            onChange={(e) => onUpdateOrderStatus(o.id, o.orderStatus, e.target.value || undefined)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-pink-400 bg-white"
                          />
                          {o.adminDeliveryDate && (
                            <button
                              onClick={() => onUpdateOrderStatus(o.id, o.orderStatus, '')}
                              className="text-[10px] text-rose-500 font-bold hover:underline"
                              title="Reset to default 7-day delivery"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-base text-gray-900">Coupon & Redeem Codes</h3>
                <button
                  onClick={() => { resetCouponForm(); setShowCouponModal(true); }}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /><span>Add Coupon</span>
                </button>
              </div>

              {coupons.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No coupons yet. Create your first coupon!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {coupons.map((c) => (
                    <div key={c.code} className={`p-4 rounded-2xl border ${c.isActive !== false ? 'border-pink-200 bg-pink-50/40' : 'border-gray-200 bg-gray-50 opacity-60'} space-y-1.5`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-pink-700 font-mono tracking-wide">{c.code}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onUpdateCoupon({ ...c, isActive: !(c.isActive ?? true) })}
                            className="p-1 text-gray-500 hover:text-pink-600 transition-colors"
                            title={c.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {c.isActive !== false ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </button>
                          <button onClick={() => handleStartEditCoupon(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => onDeleteCoupon(c.code)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700">
                        {c.discountType === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`} — Min order: ₹{c.minOrderValue}
                      </p>
                      {c.description && <p className="text-[11px] text-gray-500">{c.description}</p>}
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                        {c.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INSTAGRAM FEED MANAGEMENT */}
          {activeTab === 'instagram' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-pink-50/60 p-4 rounded-2xl border border-pink-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span>Instagram Feed Posts & Reels</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Manage posts shown in "As Seen On Instagram" section for @cherrylush.storee.
                  </p>
                </div>
                <button
                  onClick={() => setShowInstaModal(true)}
                  className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Reel / Photo</span>
                </button>
              </div>

              {instagramPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center text-xs text-gray-500 space-y-3">
                  <p className="font-bold text-gray-700">No Instagram posts on store feed currently.</p>
                  <p>Click "Post Reel / Photo" to add your Instagram post link & photo to showcase it live on the store!</p>
                  <button
                    onClick={() => setShowInstaModal(true)}
                    className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post First Reel / Photo</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {instagramPosts.map((post) => {
                    const tagged = products.find(p => p.id === post.taggedProductId);
                    return (
                      <div key={post.id} className="bg-white rounded-2xl border border-pink-100 p-3 shadow-xs flex flex-col justify-between space-y-3">
                        <div className="flex gap-3">
                          <img src={post.imageUrl} alt={post.caption} className="w-16 h-16 rounded-xl object-cover border border-pink-100 flex-shrink-0" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0 text-xs">
                            <span className="font-bold text-pink-600 block truncate">@{post.author || 'cherrylush.storee'}</span>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{post.caption}</p>
                            {post.isReel && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded mt-1">
                                <Play className="w-2.5 h-2.5 fill-purple-600" /> Reel
                              </span>
                            )}
                          </div>
                        </div>

                        {tagged && (
                          <div className="text-[10px] bg-pink-50 p-2 rounded-xl flex items-center justify-between">
                            <span className="font-medium text-gray-700 truncate">Tagged: {tagged.name}</span>
                            <span className="font-bold text-pink-600">₹{tagged.price}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <a
                            href={post.postUrl || 'https://www.instagram.com/cherrylush.storee/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-pink-600 hover:underline"
                          >
                            View Post ↗
                          </a>
                          <button
                            onClick={() => {
                              if (confirm('Delete this Instagram post from store feed?')) {
                                onDeleteInstagramPost(post.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SHIPPING SETTINGS */}
          {activeTab === 'shipping' && (
            <div className="max-w-lg space-y-5">
              <h3 className="font-serif font-bold text-base text-gray-900">Shipping Settings</h3>
              <p className="text-xs text-gray-500">These settings apply to all new customer orders.</p>

              {shipSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-medium flex items-center gap-2">
                  ✅ Shipping settings saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveShipping} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Standard Shipping Fee (₹)</label>
                    <input type="number" min={0} value={shipFee} onChange={(e) => setShipFee(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Free Shipping Above (₹)</label>
                    <input type="number" min={0} value={shipThreshold} onChange={(e) => setShipThreshold(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">COD Handling Fee (₹)</label>
                    <input type="number" min={0} value={shipCodFee} onChange={(e) => setShipCodFee(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Est. Delivery Days</label>
                    <input type="number" min={1} max={30} value={shipDays} onChange={(e) => setShipDays(parseInt(e.target.value) || 3)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Courier Partner Name</label>
                  <input type="text" value={shipCourier} onChange={(e) => setShipCourier(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                    placeholder="e.g. BlueDart Express Air" />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Changes affect new orders only. Existing orders keep their original shipping rates.</span>
                </div>

                <button type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-2xl shadow-md transition-colors text-xs flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /><span>Save Shipping Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900">Registered Users</h3>
              {registeredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center text-xs text-gray-400">
                  No users have registered yet.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-pink-50 text-gray-500 font-bold uppercase text-[10px]">
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Registered On</th>
                          <th className="py-3 px-4">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {registeredUsers.map((u, idx) => (
                          <tr key={u.id} className="hover:bg-pink-50/40 transition-colors">
                            <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                            <td className="py-3 px-4 font-semibold text-gray-800">{u.name}</td>
                            <td className="py-3 px-4 text-pink-700">{u.email}</td>
                            <td className="py-3 px-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="py-3 px-4 text-gray-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-50 bg-pink-50/30 text-[10px] text-gray-400 font-semibold">
                    {registeredUsers.length} user{registeredUsers.length !== 1 ? 's' : ''} total
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-serif font-bold text-base text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setShowProductModal(false); resetProductForm(); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                <input type="text" required value={pName} onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select value={pCategory} onChange={(e) => setPCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 bg-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Count</label>
                  <input type="number" value={pStock} onChange={(e) => setPStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input type="number" required min={1} value={pPrice} onChange={(e) => setPPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">MRP (₹)</label>
                  <input type="number" min={0} value={pOriginal} onChange={(e) => setPOriginal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
              </div>
              {/* Primary Image */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Primary Image *</label>
                <div className="flex gap-1.5 mb-1.5">
                  <button type="button" onClick={() => setPImageUploadMode1('url')}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${pImageUploadMode1 === 'url' ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}>
                    URL
                  </button>
                  <button type="button" onClick={() => setPImageUploadMode1('file')}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${pImageUploadMode1 === 'file' ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}>
                    <Upload className="w-3 h-3" /> Upload Photo
                  </button>
                </div>
                {pImageUploadMode1 === 'url' ? (
                  <input type="text" value={pImage1} onChange={(e) => setPImage1(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                ) : (
                  <div>
                    <input ref={fileInput1Ref} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setPImage1); }} />
                    <button type="button" onClick={() => fileInput1Ref.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50 text-pink-600 font-bold text-xs hover:bg-pink-100 transition-colors">
                      <Upload className="w-4 h-4" />
                      {pImage1 && pImage1.startsWith('data:') ? '✅ Photo uploaded — click to change' : 'Click to choose photo from device'}
                    </button>
                  </div>
                )}
                {pImage1 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img src={pImage1} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-pink-100" />
                    <span className="text-[10px] text-gray-400">Preview</span>
                  </div>
                )}
              </div>

              {/* Secondary Image */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Secondary Image (optional)</label>
                <div className="flex gap-1.5 mb-1.5">
                  <button type="button" onClick={() => setPImageUploadMode2('url')}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${pImageUploadMode2 === 'url' ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}>
                    URL
                  </button>
                  <button type="button" onClick={() => setPImageUploadMode2('file')}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${pImageUploadMode2 === 'file' ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}>
                    <Upload className="w-3 h-3" /> Upload Photo
                  </button>
                </div>
                {pImageUploadMode2 === 'url' ? (
                  <input type="text" value={pImage2} onChange={(e) => setPImage2(e.target.value)}
                    placeholder="https://... (optional)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                ) : (
                  <div>
                    <input ref={fileInput2Ref} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setPImage2); }} />
                    <button type="button" onClick={() => fileInput2Ref.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 text-pink-500 font-bold text-xs hover:bg-pink-100 transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      {pImage2 && pImage2.startsWith('data:') ? '✅ Photo uploaded — click to change' : 'Click to choose second photo'}
                    </button>
                  </div>
                )}
                {pImage2 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img src={pImage2} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-pink-100" />
                    <span className="text-[10px] text-gray-400">Preview</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colors (comma separated)</label>
                <input type="text" value={pColors} onChange={(e) => setPColors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
              </div>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={pBestSeller} onChange={(e) => setPBestSeller(e.target.checked)} className="rounded text-pink-600" />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={pNewArrival} onChange={(e) => setPNewArrival(e.target.checked)} className="rounded text-pink-600" />
                  <span>New Arrival</span>
                </label>
              </div>
              <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-2xl shadow-md transition-colors">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-serif font-bold text-base text-gray-900">{editingCoupon ? 'Edit Coupon' : 'Add Coupon Code'}</h3>
              <button onClick={() => { setShowCouponModal(false); resetCouponForm(); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {couponError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{couponError}</div>
            )}
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input type="text" required value={cCode} onChange={(e) => setCCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20" disabled={!!editingCoupon}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 uppercase font-mono disabled:bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select value={cType} onChange={(e) => setCType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Value {cType === 'percentage' ? '(%)' : '(₹)'}</label>
                  <input type="number" required min={1} value={cValue} onChange={(e) => setCValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Minimum Order Value (₹)</label>
                <input type="number" min={0} value={cMin} onChange={(e) => setCMin(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description (shown to customers)</label>
                <input type="text" value={cDesc} onChange={(e) => setCDesc(e.target.value)}
                  placeholder="e.g. Get 20% OFF on orders above ₹499!"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cActive} onChange={(e) => setCActive(e.target.checked)} className="rounded text-pink-600" />
                <span className="font-semibold text-gray-700">Active (customers can use this coupon)</span>
              </label>
              <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-2xl shadow-md transition-colors">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Instagram Post Modal */}
      {showInstaModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-600" />
                <span>Post Instagram Reel / Photo</span>
              </h3>
              <button onClick={() => resetInstaForm()}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSaveInstaPost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Instagram Handle / Author *</label>
                <input
                  type="text"
                  required
                  value={instaHandle}
                  onChange={(e) => setInstaHandle(e.target.value)}
                  placeholder="cherrylush.storee"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Instagram Post or Reel URL *</label>
                <input
                  type="url"
                  required
                  value={instaPostUrl}
                  onChange={(e) => {
                    setInstaPostUrl(e.target.value);
                    if (e.target.value.toLowerCase().includes('/reel/')) setInstaIsReel(true);
                  }}
                  placeholder="https://www.instagram.com/reel/Cxxxxxx/"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-2 bg-pink-50 p-2.5 rounded-xl border border-pink-100">
                <input
                  type="checkbox"
                  id="adminIsReelCheck"
                  checked={instaIsReel}
                  onChange={(e) => setInstaIsReel(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 cursor-pointer"
                />
                <label htmlFor="adminIsReelCheck" className="font-bold text-gray-800 cursor-pointer flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
                  This is an Instagram Reel
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">Cover Photo / Thumbnail Image *</label>
                  <div className="flex gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setInstaImgUploadMode('url')}
                      className={`px-2 py-0.5 rounded ${instaImgUploadMode === 'url' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstaImgUploadMode('file')}
                      className={`px-2 py-0.5 rounded ${instaImgUploadMode === 'file' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {instaImgUploadMode === 'url' ? (
                  <input
                    type="url"
                    required
                    value={instaImageUrl}
                    onChange={(e) => setInstaImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                  />
                ) : (
                  <div>
                    <input
                      ref={instaFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setInstaImageUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => instaFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-pink-200 bg-pink-50/50 py-3 rounded-xl font-bold text-pink-600 flex items-center justify-center gap-2 text-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{instaImageUrl ? 'Photo Uploaded (Click to Change)' : 'Choose Photo File'}</span>
                    </button>
                  </div>
                )}

                {instaImageUrl && (
                  <div className="mt-2 relative aspect-video rounded-xl overflow-hidden border border-pink-200 bg-gray-900">
                    <img src={instaImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Caption / Title</label>
                <textarea
                  rows={2}
                  value={instaCaption}
                  onChange={(e) => setInstaCaption(e.target.value)}
                  placeholder="Coquette perfection with our Princess Rose Gold Earrings! 🎀✨"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tag a Product (Shoppable Link)</label>
                <select
                  value={instaTaggedProdId}
                  onChange={(e) => setInstaTaggedProdId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 bg-white"
                >
                  <option value="">-- None --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Likes Count</label>
                  <input
                    type="number"
                    value={instaLikes}
                    onChange={(e) => setInstaLikes(e.target.value)}
                    placeholder="e.g. 1420"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Comments Count</label>
                  <input
                    type="number"
                    value={instaComments}
                    onChange={(e) => setInstaComments(e.target.value)}
                    placeholder="e.g. 88"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-2xl shadow-md transition-colors text-xs flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Post to Live Store Feed</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
