import React, { useState, useEffect } from 'react';
import { CartItem, Coupon, CustomerDetails, Order, PaymentMethod, ShippingSettings } from '../types';
import { X, ShieldCheck, Banknote, CheckCircle2, Lock, Sparkles, ChevronRight, Truck, User, MapPin, CreditCard } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  onOrderPlaced: (order: Order) => void;
  shippingSettings: ShippingSettings;
}

const STEPS = [
  { id: 1, label: 'Customer Details', icon: User },
  { id: 2, label: 'Delivery Address', icon: MapPin },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Confirm Order', icon: CheckCircle2 },
];

const indianStates = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab',
  'Haryana', 'Kerala', 'Goa', 'Madhya Pradesh', 'Bihar', 'Assam',
  'Odisha', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Andhra Pradesh', 'Manipur', 'Meghalaya', 'Tripura',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  onOrderPlaced,
  shippingSettings,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);

  // Step 1 – Customer Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 – Delivery Address
  const [pincode, setPincode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Delhi');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeFound, setPincodeFound] = useState(false);

  // Auto-fill city & state from PIN using India Post API
  useEffect(() => {
    if (pincode.length !== 6) { setPincodeFound(false); return; }
    setPincodeLoading(true);
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setCity(po.District || po.Division || '');
          const apiState: string = po.State || '';
          const match = indianStates.find(s => s.toLowerCase() === apiState.toLowerCase());
          setStateName(match || apiState || 'Delhi');
          setPincodeFound(true);
        } else {
          setPincodeFound(false);
        }
      })
      .catch(() => setPincodeFound(false))
      .finally(() => setPincodeLoading(false));
  }, [pincode]);

  // Step 3 – Payment (COD only)
  const [paymentMethod] = useState<PaymentMethod>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // ── Pricing ──────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountType === 'percentage'
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value;
  }
  const shippingFee = 0; // Always free
  const codFee = 0;      // Free COD
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Delivery = 7 days from today
  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  })();

  // ── Validation per step ───────────────────────────────────────────────────
  const validateStep = (): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!fullName.trim()) { setErrorMsg('Please enter your full name.'); return false; }
      if (!email.trim() || !email.includes('@')) { setErrorMsg('Please enter a valid email address.'); return false; }
      if (phone.replace(/\D/g, '').length < 10) { setErrorMsg('Please enter a valid 10-digit phone number.'); return false; }
    }
    if (step === 2) {
      if (!addressLine1.trim()) { setErrorMsg('Please enter your house/flat number.'); return false; }
      if (!pincode.trim() || pincode.trim().length < 6) { setErrorMsg('Please enter a valid 6-digit pincode.'); return false; }
      if (!city.trim()) { setErrorMsg('Please enter your city.'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = `CHERRY-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingNumber = `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const customer: CustomerDetails = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone,
        pincode: pincode.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: stateName,
      };

      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        customerDetails: customer,
        items: [...cartItems],
        subtotal,
        discountAmount,
        couponApplied: appliedCoupon?.code,
        shippingFee,
        codFee,
        totalAmount,
        paymentMethod,
        paymentStatus: 'Pending COD',
        orderStatus: 'Placed',
        trackingNumber,
        courierName: shippingSettings.courierName || 'BlueDart Express Air',
        estimatedDeliveryDate: deliveryDate,
      };

      setPlacedOrder(newOrder);
      setStep(4);
      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-pink-200" />
            <div>
              <h2 className="font-serif font-bold text-base leading-tight">Secure Checkout</h2>
              <p className="text-[10px] text-pink-100">Free Shipping · Free COD · 7-Day Delivery</p>
            </div>
          </div>
          {step < 4 && (
            <button onClick={onClose} className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center px-5 py-3 border-b border-pink-50 bg-pink-50/40 flex-shrink-0">
            {STEPS.slice(0, 3).map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    step > s.id ? 'bg-pink-600 text-white' : step === s.id ? 'bg-pink-600 text-white ring-2 ring-pink-200' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${step === s.id ? 'text-pink-700' : step > s.id ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {idx < 2 && <div className={`flex-1 h-px mx-2 ${step > s.id ? 'bg-pink-400' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">{errorMsg}</div>
          )}

          {/* ── STEP 1: Customer Details ────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-500" /> Customer Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600">+91</span>
                    <input type="tel" maxLength={10} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Delivery Address ────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-500" /> Delivery Address
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">House / Flat No & Building *</label>
                  <input type="text" placeholder="Flat 402, Rose Villa Apartments" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                    <div className="relative">
                      <input type="text" inputMode="numeric" maxLength={6} placeholder="110001" value={pincode}
                        onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setPincodeFound(false); }}
                        className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-pink-500 pr-7 ${pincodeFound ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`} />
                      {pincodeLoading && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-pink-500 animate-pulse">...</span>}
                      {pincodeFound && !pincodeLoading && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">✓</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                    <input type="text" placeholder="Auto-filled from PIN" value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Street / Locality / Landmark</label>
                  <input type="text" placeholder="Near Park, MG Road" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                  <select value={stateName} onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 bg-white">
                    {indianStates.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                {/* Delivery info */}
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-700">Free Express Delivery</p>
                    <p className="text-emerald-600">Estimated by <strong>{deliveryDate}</strong> (7 days)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Payment ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-500" /> Payment
              </h3>
              <div className="p-4 rounded-2xl border-2 border-pink-400 bg-pink-50 space-y-2">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-pink-600" />
                  <span className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</span>
                  <span className="ml-auto bg-pink-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">FREE</span>
                </div>
                <p className="text-xs text-gray-600">Pay cash when your parcel arrives. Zero COD fee.</p>
                <div className="flex items-center gap-1.5 text-[11px] text-pink-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Verified Delivery</span>
                </div>
              </div>

              {/* Order summary */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-serif font-bold text-xs text-gray-900 uppercase tracking-wider">Order Summary</h4>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {cartItems.map((ci, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-700 truncate max-w-[200px]">{ci.quantity}× {ci.product.name}</span>
                      <span className="font-semibold text-gray-900">₹{(ci.product.price * ci.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Shipping</span><span>FREE</span>
                  </div>
                  <div className="flex justify-between font-serif text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-300">
                    <span>Total Payable (COD)</span>
                    <span className="text-pink-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Order Confirmed ──────────────────────────────────── */}
          {step === 4 && placedOrder && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900">Order Confirmed! 🎀</h3>
                <p className="text-xs text-gray-500 mt-1">Thank you, {placedOrder.customerDetails.fullName.split(' ')[0]}!</p>
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-bold text-pink-700">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total (COD)</span>
                  <span className="font-bold text-gray-900">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deliver to</span>
                  <span className="font-semibold text-gray-700 text-right max-w-[55%]">{placedOrder.customerDetails.city}, {placedOrder.customerDetails.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected by</span>
                  <span className="font-bold text-emerald-700">{placedOrder.estimatedDeliveryDate}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">A confirmation will be sent to {placedOrder.customerDetails.email}</p>
              <button onClick={onClose}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-lg text-sm">
                Continue Shopping 💖
              </button>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {step < 4 && (
          <div className="p-4 border-t border-pink-50 flex gap-3 flex-shrink-0">
            {step > 1 && (
              <button onClick={() => { setStep(s => s - 1); setErrorMsg(null); }}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors">
                ← Back
              </button>
            )}
            {step < 3 && (
              <button onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold py-3 rounded-2xl shadow-md text-xs flex items-center justify-center gap-1.5 hover:from-pink-700 hover:to-rose-600 transition-all">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && (
              <button onClick={handlePlaceOrder} disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold py-3 rounded-2xl shadow-md text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 hover:from-pink-700 hover:to-rose-600 transition-all">
                {isSubmitting
                  ? <><Sparkles className="w-4 h-4 animate-spin" /> Placing Order...</>
                  : <><ShieldCheck className="w-4 h-4" /> Confirm & Place Order (₹{totalAmount.toLocaleString('en-IN')})</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
