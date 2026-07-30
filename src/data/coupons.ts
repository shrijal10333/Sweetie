import type { Coupon } from '../types';

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'SWEET10',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 799,
    description: '10% off orders of ₹799 or more',
    isActive: true,
  },
  {
    code: 'WELCOME150',
    discountType: 'fixed',
    value: 150,
    minOrderValue: 1499,
    description: '₹150 off orders of ₹1,499 or more',
    isActive: true,
  },
];
