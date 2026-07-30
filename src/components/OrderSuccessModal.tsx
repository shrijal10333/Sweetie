import React, { useRef } from 'react';
import { Order } from '../types';
import {
  CheckCircle2, Truck, MessageCircle, ArrowRight, Sparkles,
  PackageCheck, Copy, Printer, X
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder
}) => {
  if (!order) return null;

  const [copied, setCopied] = React.useState(false);
  const [showInvoice, setShowInvoice] = React.useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintInvoice = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Georgia', serif; background: #fff; color: #1a1a1a; padding: 32px; }
            .invoice { max-width: 700px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #DB2777; }
            .brand { font-size: 28px; font-weight: bold; color: #DB2777; letter-spacing: -0.5px; }
            .brand-sub { font-size: 11px; color: #888; margin-top: 3px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { font-size: 22px; color: #1a1a1a; font-weight: bold; }
            .invoice-title p { font-size: 11px; color: #888; margin-top: 2px; }
            .badge { display: inline-block; background: #fdf2f8; color: #DB2777; border: 1px solid #fbcfe8; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 20px; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
            .meta-block h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; font-family: sans-serif; margin-bottom: 6px; }
            .meta-block p { font-size: 12px; color: #333; line-height: 1.7; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            thead tr { background: #fdf2f8; }
            th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #DB2777; font-family: sans-serif; padding: 10px 12px; text-align: left; border-bottom: 1px solid #fbcfe8; }
            td { font-size: 12px; padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #444; vertical-align: top; }
            .totals { width: 280px; margin-left: auto; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 12px; color: #555; }
            .totals-row.discount { color: #059669; }
            .totals-row.total { background: #DB2777; color: #fff; font-size: 14px; font-weight: bold; padding: 12px 14px; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #bbb; }
            .footer strong { color: #DB2777; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Sweetie Studio! I just placed order ${order.id}. Please send me updates on WhatsApp at ${order.customerDetails.phone}.`
  );

  const invoiceDate = order.date;

  // Success screen
  if (!showInvoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 p-6 text-center space-y-6">

          {/* Celebration Header */}
          <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
            <CheckCircle2 className="w-10 h-10" />
            <Sparkles className="w-5 h-5 text-pink-400 absolute top-1 right-1 animate-ping" />
          </div>

          <div>
            <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
              Order Confirmed 🎉
            </span>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mt-2">
              Thank you, {order.customerDetails.fullName}!
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Packing your order with love, pink tissue paper & custom stickers!
            </p>
          </div>

          {/* Order ID Box */}
          <div className="bg-pink-50/80 p-4 rounded-2xl border border-pink-200 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">Order Number</span>
              <span className="text-lg font-serif font-bold text-pink-700">{order.id}</span>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs font-bold text-pink-600 bg-white px-3 py-1.5 rounded-xl border border-pink-200 hover:bg-pink-100 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Delivery Info */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Estimated Delivery: {order.estimatedDeliveryDate}</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Courier: <strong>{order.courierName}</strong> · Tracking: {order.trackingNumber}
            </p>
            <p className="text-[11px] text-gray-600">
              Ship to: {order.customerDetails.addressLine1}, {order.customerDetails.city}, {order.customerDetails.state} - {order.customerDetails.pincode}
            </p>
          </div>

          {/* Items mini-list */}
          <div className="text-left space-y-2 border-t border-pink-100 pt-3">
            <h4 className="text-xs font-serif font-bold text-gray-800 uppercase tracking-wider">
              Items ({order.items.length})
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-gray-600">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[240px]">{item.quantity}× {item.product.name}</span>
                  <span className="font-bold text-gray-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Paid</span>
              <span className="text-pink-600 font-serif text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => setShowInvoice(true)}
              className="w-full bg-white hover:bg-pink-50 text-pink-700 font-bold py-3 rounded-2xl border-2 border-pink-200 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>View & Download Invoice / Bill</span>
            </button>

            <button
              onClick={() => { onClose(); onTrackOrder(order.id); }}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Track My Shipment Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/919891454247?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get Live Updates on WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    );
  }

  // ── INVOICE VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 flex flex-col">

        {/* Invoice toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white text-xs font-bold">
          <button onClick={() => setShowInvoice(false)} className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back
          </button>
          <span className="text-pink-300 uppercase tracking-widest">Invoice / Bill</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded-lg transition-colors text-white"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Download
            </button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Invoice body */}
        <div className="overflow-y-auto p-6 sm:p-8" ref={invoiceRef}>
          <div className="invoice">

            {/* Header */}
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: '2px solid #DB2777', marginBottom: '24px' }}>
              <div>
                <div className="brand" style={{ fontSize: '28px', fontWeight: 'bold', color: '#DB2777', fontFamily: 'Georgia, serif' }}>
                  Sweetie Studio
                </div>
                <div className="brand-sub" style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                  Delhi & Sweetie Studio, India
                </div>
                <div className="brand-sub" style={{ fontSize: '11px', color: '#888' }}>
                  Samakshcompany@gmail.com · +91 9891454247
                </div>
                <span className="badge" style={{ display: 'inline-block', background: '#fdf2f8', color: '#DB2777', border: '1px solid #fbcfe8', fontSize: '10px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '20px', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  TAX INVOICE
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '22px', color: '#1a1a1a', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>INVOICE</h2>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>#{order.id}</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Date: {invoiceDate}</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Tracking: {order.trackingNumber}</p>
              </div>
            </div>

            {/* Bill to / Ship to */}
            <div className="meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div className="meta-block">
                <h4 style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '6px' }}>Bill To</h4>
                <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.8' }}>
                  <strong>{order.customerDetails.fullName}</strong><br />
                  {order.customerDetails.email}<br />
                  +91 {order.customerDetails.phone}
                </p>
              </div>
              <div className="meta-block">
                <h4 style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#aaa', fontFamily: 'sans-serif', marginBottom: '6px' }}>Ship To</h4>
                <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.8' }}>
                  {order.customerDetails.addressLine1}<br />
                  {order.customerDetails.addressLine2 && <>{order.customerDetails.addressLine2}<br /></>}
                  {order.customerDetails.city}, {order.customerDetails.state} - {order.customerDetails.pincode}
                </p>
              </div>
            </div>

            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#fdf2f8' }}>
                  <th style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#DB2777', fontFamily: 'sans-serif', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #fbcfe8' }}>#</th>
                  <th style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#DB2777', fontFamily: 'sans-serif', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #fbcfe8' }}>Product</th>
                  <th style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#DB2777', fontFamily: 'sans-serif', padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #fbcfe8' }}>Qty</th>
                  <th style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#DB2777', fontFamily: 'sans-serif', padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #fbcfe8' }}>Unit Price</th>
                  <th style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#DB2777', fontFamily: 'sans-serif', padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #fbcfe8' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '12px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#888' }}>{idx + 1}</td>
                    <td style={{ fontSize: '12px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#333' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.product.name}</div>
                      <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{item.product.category}{item.selectedColor ? ` · ${item.selectedColor}` : ''}{item.selectedSize ? ` · ${item.selectedSize}` : ''}</div>
                    </td>
                    <td style={{ fontSize: '12px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#555', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ fontSize: '12px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#555', textAlign: 'right' }}>₹{item.product.price.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '12px', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#1a1a1a', fontWeight: 'bold', textAlign: 'right' }}>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '280px', border: '1px solid #f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12px', color: '#555', borderBottom: '1px solid #f9fafb' }}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12px', color: '#059669', borderBottom: '1px solid #f9fafb' }}>
                    <span>Discount {order.couponApplied && `(${order.couponApplied})`}</span>
                    <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12px', color: '#555', borderBottom: '1px solid #f9fafb' }}>
                  <span>Shipping</span>
                  <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
                </div>
                {order.codFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12px', color: '#b45309', borderBottom: '1px solid #f9fafb' }}>
                    <span>COD Fee</span>
                    <span>₹{order.codFee}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', fontSize: '15px', fontWeight: 'bold', background: '#DB2777', color: '#fff' }}>
                  <span>Total Paid</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment & Courier details */}
            <div style={{ marginTop: '24px', padding: '14px', background: '#fdf2f8', borderRadius: '10px', border: '1px solid #fbcfe8' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', color: '#555' }}>
                <div><span style={{ fontWeight: 'bold', color: '#DB2777' }}>Payment Method:</span> Cash on Delivery (COD)</div>
                <div><span style={{ fontWeight: 'bold', color: '#DB2777' }}>Payment Status:</span> {order.paymentStatus}</div>
                <div><span style={{ fontWeight: 'bold', color: '#DB2777' }}>Courier:</span> {order.courierName}</div>
                <div><span style={{ fontWeight: 'bold', color: '#DB2777' }}>Est. Delivery:</span> {order.estimatedDeliveryDate}</div>
              </div>
            </div>

            {/* Footer note */}
            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: '11px', color: '#bbb' }}>
              <p>Thank you for shopping with <strong style={{ color: '#DB2777' }}>Sweetie Studio</strong> 💖 Every parcel is packed with love & pink tissue.</p>
              <p style={{ marginTop: '4px' }}>Questions? WhatsApp us at <strong style={{ color: '#DB2777' }}>+91 9891454247</strong> or email <strong style={{ color: '#DB2777' }}>Samakshcompany@gmail.com</strong></p>
              <p style={{ marginTop: '4px' }}>This is a computer-generated invoice and does not require a signature.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
