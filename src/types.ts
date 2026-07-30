export type Category = 
  | 'Jewellery'
  | 'Bags'
  | 'Accessories'
  | 'Beauty Products'
  | 'Fashion Items'
  | 'Gift Items';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // in INR ₹
  originalPrice: number; // in INR ₹
  discountPercent: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  shortDescription?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  stockCount: number;
  colors?: string[];
  sizes?: string[];
  material?: string;
  careInstructions?: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

export interface Review {
  id: string;
  productId?: string;
  userName: string;
  userHandle?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  userImage?: string;
  productName?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // 10 = 10% or 150 = ₹150
  minOrderValue: number;
  description: string;
  isActive: boolean;
}

export interface ShippingSettings {
  standardFee: number;       // e.g. 79
  freeShippingThreshold: number; // e.g. 999
  codFee: number;            // e.g. 0
  courierName: string;       // e.g. 'BlueDart Express Air'
  estimatedDays: number;     // e.g. 3
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  landmark?: string;
}

export type PaymentMethod = 'upi' | 'cod' | 'card' | 'netbanking';

export interface Order {
  id: string; // e.g., SWEETIE-92841
  date: string;
  customerDetails: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponApplied?: string;
  shippingFee: number;
  codFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending COD' | 'Failed';
  orderStatus: 'Placed' | 'Packed with Ribbon' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  courierName: string;
  estimatedDeliveryDate: string;
  adminDeliveryDate?: string; // Admin-overridden delivery date
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
  taggedProductId: string;
  author?: string;
  isReel?: boolean;
  postUrl?: string;
}
