import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MessageCircle, 
  Check, 
  MapPin, 
  Sparkles,
  Share2
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  onBuyNow: (product: Product, color?: string, size?: string, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [copied, setCopied] = useState(false);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus(`✨ Eligible for Express Delivery to ${pincode} by ${getEstimatedDeliveryDate()}! Cash on Delivery Available.`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian Pincode.');
    }
  };

  const getEstimatedDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Cherry Lush Store! I want to order "${product.name}" (Price: ₹${product.price}). Color: ${selectedColor || 'Default'}, Size: ${selectedSize || 'Standard'}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-pink-100 max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-pink-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="md:w-1/2 p-6 bg-pink-50/40 flex flex-col items-center justify-between">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-inner mb-4">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {/* Discount Badge */}
            {product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                SAVE {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2 w-full justify-center">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-pink-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Purchase Controls */}
        <div className="md:w-1/2 p-6 overflow-y-auto space-y-6">
          
          {/* Category & Title */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                {product.category}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-1.5 text-gray-500 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors text-xs flex items-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2 rounded-full border transition-all ${
                    isWishlisted ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-200 text-gray-500 hover:text-pink-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-amber-600 font-bold text-xs border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">({product.reviewCount} reviews)</span>
              </div>

              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                In Stock ({product.stockCount} left)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Inclusive of all taxes • Free Shipping on orders ₹999+
              </p>
            </div>

            {product.originalPrice > product.price && (
              <span className="text-xs font-bold text-pink-700 bg-pink-200 px-3 py-1 rounded-full">
                Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Shade / Color: <span className="text-pink-600">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedColor === c
                        ? 'border-pink-600 bg-pink-600 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Size: <span className="text-pink-600">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                      selectedSize === s
                        ? 'border-pink-600 bg-pink-600 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Quantity
            </label>
            <div className="inline-flex items-center border border-gray-200 rounded-full bg-gray-50 p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white text-gray-700 font-bold hover:bg-pink-100 flex items-center justify-center shadow-xs"
              >
                -
              </button>
              <span className="px-4 font-bold text-sm text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                className="w-8 h-8 rounded-full bg-white text-gray-700 font-bold hover:bg-pink-100 flex items-center justify-center shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <MapPin className="w-4 h-4 text-pink-600" />
              <span>Check Delivery & COD Availability</span>
            </div>
            
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-pink-600 transition-colors"
              >
                Check
              </button>
            </form>

            {pincodeStatus && (
              <p className="text-xs text-pink-700 bg-pink-50 p-2 rounded-xl font-medium border border-pink-100">
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* CTA Buttons (Add to Cart, Buy Now, WhatsApp) */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onAddToCart(product, selectedColor, selectedSize, quantity);
                }}
                className="w-full bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm border border-pink-200"
              >
                <ShoppingBag className="w-4 h-4 text-pink-600" />
                <span>Add To Cart</span>
              </button>

              <button
                onClick={() => {
                  onBuyNow(product, selectedColor, selectedSize, quantity);
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* WhatsApp Direct Order Button */}
            <a
              href={`https://wa.me/919891454247?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Instantly via WhatsApp 💬</span>
            </a>
          </div>

          {/* Details Tabs */}
          <div className="pt-4 border-t border-pink-100">
            <div className="flex border-b border-gray-200 text-xs font-bold text-gray-500">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-pink-600 text-pink-600' : 'border-transparent hover:text-gray-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'care' ? 'border-pink-600 text-pink-600' : 'border-transparent hover:text-gray-800'
                }`}
              >
                Material & Care
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'shipping' ? 'border-pink-600 text-pink-600' : 'border-transparent hover:text-gray-800'
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="py-3 text-xs text-gray-600 leading-relaxed">
              {activeTab === 'details' && (
                <p>{product.description}</p>
              )}

              {activeTab === 'care' && (
                <div className="space-y-1">
                  <p><strong>Material:</strong> {product.material || 'Premium Quality Handcrafted'}</p>
                  <p><strong>Care Instructions:</strong> {product.careInstructions || 'Handle with gentle care. Store in custom velvet pouch provided.'}</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-1">
                  <p>• <strong>Free Shipping:</strong> On all India orders above ₹999.</p>
                  <p>• <strong>Delivery Time:</strong> 5-7 business days via express air courier.</p>
                  <p>• <strong>Returns:</strong> 7-day hassle-free returns & replacement policy.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
