import React, { useState } from 'react';
import { CartItem, Coupon, ShippingSettings } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
  availableCoupons: Coupon[];
  shippingSettings: ShippingSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
  availableCoupons,
  shippingSettings,
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  // Use live shipping settings from admin
  const { freeShippingThreshold, standardFee } = shippingSettings;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const shippingFee = isFreeShipping ? 0 : standardFee;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  // Only show active coupons to customers
  const activeCoupons = availableCoupons.filter(c => c.isActive !== false);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const success = onApplyCoupon(couponInput.trim().toUpperCase());
    if (success) {
      setCouponInput('');
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 bg-pink-50 border-b border-pink-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h2 className="font-serif font-bold text-lg text-gray-900">Your Shopping Cart</h2>
            <span className="bg-pink-200 text-pink-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-pink-600 rounded-full hover:bg-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-pink-100/60 p-3 border-b border-pink-200/50 flex-shrink-0">
          <div className="flex justify-between items-center text-xs font-semibold mb-1">
            {isFreeShipping ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Yay! You unlocked FREE Shipping! 🎉
              </span>
            ) : (
              <span className="text-pink-800">
                Add <strong>₹{amountNeededForFreeShipping}</strong> more for FREE Shipping!
              </span>
            )}
            <span className="text-gray-500 text-[11px]">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
          {!isFreeShipping && (
            <p className="text-[10px] text-pink-600 mt-1">
              Free shipping on orders above ₹{freeShippingThreshold}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-serif font-bold text-gray-700 text-lg">Your cart is empty!</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Explore our cute collection of jewellery, bags, and beauty finds.</p>
              <button onClick={onClose}
                className="bg-pink-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md hover:bg-pink-700 transition-colors">
                Start Shopping ✨
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-2xl border border-pink-100 bg-white shadow-sm hover:border-pink-200 transition-all">
                <img src={item.product.images[0]} alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-pink-50 flex-shrink-0"
                  referrerPolicy="no-referrer" />

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-xs text-gray-900 truncate">{item.product.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                    {item.selectedColor && (
                      <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded border border-pink-100">{item.selectedColor}</span>
                    )}
                    {item.selectedSize && (
                      <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded border border-pink-100">Size: {item.selectedSize}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif font-bold text-sm text-gray-900">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 px-1 py-0.5">
                      <button onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="w-5 h-5 rounded-full bg-white text-gray-700 text-xs font-bold hover:bg-pink-100 flex items-center justify-center">−</button>
                      <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="w-5 h-5 rounded-full bg-white text-gray-700 text-xs font-bold hover:bg-pink-100 flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>

                <button onClick={() => onRemoveItem(index)} className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors flex-shrink-0" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-pink-100 space-y-3 flex-shrink-0">

            {/* Coupon */}
            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Tag className="w-4 h-4" />
                  <span>Code <strong>{appliedCoupon.code}</strong> Applied!</span>
                </div>
                <button onClick={onRemoveCoupon} className="text-rose-600 hover:underline font-bold text-[11px]">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="space-y-1">
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter Coupon Code" value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 uppercase font-semibold" />
                  <button type="submit" className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-pink-600 transition-colors">Apply</button>
                </div>
                {couponError && <p className="text-[10px] text-rose-600 font-medium pl-1">{couponError}</p>}
              </form>
            )}

            {/* Quick coupon chips — only active ones */}
            {!appliedCoupon && activeCoupons.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
                {activeCoupons.map((c) => (
                  <button key={c.code} onClick={() => onApplyCoupon(c.code)}
                    className="bg-pink-50 border border-pink-200 text-pink-700 px-2 py-0.5 rounded-full font-bold hover:bg-pink-100 whitespace-nowrap">
                    Use {c.code}
                  </button>
                ))}
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {isFreeShipping
                    ? <strong className="text-emerald-600 uppercase text-[10px]">FREE</strong>
                    : `₹${shippingFee}`
                  }
                </span>
              </div>
              <div className="flex justify-between font-serif text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-pink-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); onProceedToCheckout(); }}
              className="w-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-700 hover:to-rose-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Proceed To Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
