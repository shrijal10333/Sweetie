import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { PackageCheck, Search, Truck, CheckCircle2, Clock, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';

interface OrderTrackingViewProps {
  orders: Order[];
  initialOrderId?: string;
  onBackToHome: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  initialOrderId = '',
  onBackToHome
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    orders.find(o => o.id.toUpperCase() === initialOrderId.toUpperCase()) || orders[0] || null
  );
  const [error, setError] = useState<string | null>(null);

  // Keep displayed order in sync when admin updates status (same browser)
  useEffect(() => {
    if (!searchedOrder) return;
    const fresh = orders.find(o => o.id === searchedOrder.id);
    if (fresh && (
      fresh.orderStatus !== searchedOrder.orderStatus ||
      fresh.adminDeliveryDate !== searchedOrder.adminDeliveryDate ||
      fresh.estimatedDeliveryDate !== searchedOrder.estimatedDeliveryDate
    )) {
      setSearchedOrder(fresh);
    }
  }, [orders]);

  // Poll server every 5s so customer sees live status updates on any device
  useEffect(() => {
    if (!searchedOrder) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${searchedOrder.id}`);
        if (!res.ok) return;
        const fresh: Order = await res.json();
        setSearchedOrder(fresh);
      } catch {}
    };
    // Fetch immediately, then every 5 seconds
    poll();
    const timer = setInterval(poll, 5_000);
    return () => clearInterval(timer);
  }, [searchedOrder?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    const found = orders.find(o => 
      o.id.toUpperCase() === query || 
      o.customerDetails.phone.includes(query)
    );

    if (found) {
      setSearchedOrder(found);
    } else {
      setError(`No order found for "${searchQuery}". Please check your Order ID (e.g. SWEETIE-89241) or WhatsApp phone number.`);
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'Received & verified', icon: Clock },
    { title: 'Packed with Ribbon', desc: 'Wrapped in pink tissue', icon: PackageCheck },
    { title: 'Shipped via BlueDart', desc: 'In transit to city hub', icon: Truck },
    { title: 'Out for Delivery', desc: 'Agent assigned', icon: MapPin },
    { title: 'Delivered', desc: 'Handed over with love', icon: CheckCircle2 }
  ];

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const statusMap: Record<string, number> = {
      'Placed': 0,
      'Packed with Ribbon': 1,
      'Shipped': 2,
      'Out for Delivery': 3,
      'Delivered': 4
    };

    const currentStepIndex = statusMap[currentStatus] ?? 1;

    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-3.5 py-2 rounded-full border border-pink-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Boutique</span>
        </button>

        <span className="text-xs font-bold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
          Live Shipment Tracker 🚚
        </span>
      </div>

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Track Your Sweetie Order</h1>
        <p className="text-gray-500 text-xs">
          Enter your 6-digit Order ID (e.g. SWEETIE-89241) or phone number to see live courier status.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Order ID or Phone Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-3 text-xs rounded-2xl border border-pink-200 focus:outline-none focus:border-pink-500 shadow-sm uppercase font-semibold"
          />
        </div>
        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-colors"
        >
          Track Order
        </button>
      </form>

      {error && (
        <div className="max-w-md mx-auto p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl text-center">
          {error}
        </div>
      )}

      {/* Order Status Display */}
      {searchedOrder && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xl space-y-8">
          
          {/* Order Meta Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-pink-100 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-pink-600 tracking-wider">Tracking Shipment</span>
              <h2 className="text-2xl font-serif font-bold text-gray-900">{searchedOrder.id}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Placed on {searchedOrder.date} • {searchedOrder.customerDetails.fullName}
              </p>
            </div>

            <div className="bg-pink-50 px-4 py-2 rounded-2xl border border-pink-200 text-right">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Estimated Delivery</span>
              <span className="text-sm font-serif font-bold text-pink-700">{searchedOrder.estimatedDeliveryDate}</span>
            </div>
          </div>

          {/* Interactive Timeline Progress */}
          <div className="py-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-6">Shipment Timeline</h3>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              {steps.map((step, index) => {
                const status = getStepStatus(index, searchedOrder.orderStatus);
                const StepIcon = step.icon;

                return (
                  <div key={index} className="flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1 relative z-10">
                    
                    {/* Circle Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        status === 'completed'
                          ? 'bg-pink-600 text-white shadow-md'
                          : status === 'current'
                          ? 'bg-rose-500 text-white ring-4 ring-rose-100 animate-pulse'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    {/* Step Title & Desc */}
                    <div>
                      <h4 className={`text-xs font-bold ${status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{step.desc}</p>
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

          {/* Shipment Details & Delivery Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-pink-100">
            
            {/* Delivery Address */}
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2 text-xs">
              <h4 className="font-serif font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-600" />
                <span>Delivery Address</span>
              </h4>
              <p className="font-bold text-gray-800">{searchedOrder.customerDetails.fullName}</p>
              <p className="text-gray-600">
                {searchedOrder.customerDetails.addressLine1}, {searchedOrder.customerDetails.addressLine2 ? searchedOrder.customerDetails.addressLine2 + ', ' : ''}
                {searchedOrder.customerDetails.city}, {searchedOrder.customerDetails.state} - {searchedOrder.customerDetails.pincode}
              </p>
              <p className="text-gray-500 pt-1">Phone: +91 {searchedOrder.customerDetails.phone}</p>
            </div>

            {/* Courier info */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <h4 className="font-serif font-bold text-gray-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-pink-600" />
                <span>Courier Partner</span>
              </h4>
              <p className="text-gray-800">
                Courier: <strong>{searchedOrder.courierName}</strong>
              </p>
              <p className="text-gray-800">
                Tracking Airway Bill: <strong>{searchedOrder.trackingNumber}</strong>
              </p>
              <p className="text-gray-500 pt-1">
                Payment Method: <span className="uppercase font-bold">{searchedOrder.paymentMethod}</span> ({searchedOrder.paymentStatus})
              </p>
            </div>

          </div>

          {/* WhatsApp Support CTA */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/919891454247?text=Hi%20Sweetie%20Studio!%20I%20have%20a%20question%20about%20order%20${searchedOrder.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Need help with this shipment? Chat on WhatsApp</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
};
