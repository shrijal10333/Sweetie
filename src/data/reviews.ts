import type { Review } from '../types';

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'review-1',
    productId: 'pearl-drop-earrings',
    productName: 'Pearl Drop Earrings',
    userName: 'Ananya S.',
    userHandle: '@ananyastyles',
    rating: 5,
    date: '2026-06-18',
    comment: 'Beautiful finish and surprisingly lightweight. The packaging made it feel extra special.',
    verifiedPurchase: true,
  },
  {
    id: 'review-2',
    productId: 'rose-quilted-sling',
    productName: 'Rose Quilted Sling Bag',
    userName: 'Meera K.',
    rating: 5,
    date: '2026-06-02',
    comment: 'The color is lovely and it fits everything I need for an evening out.',
    verifiedPurchase: true,
  },
  {
    id: 'review-3',
    productId: 'berry-glow-lip-tint',
    productName: 'Berry Glow Lip Tint',
    userName: 'Riya P.',
    rating: 4,
    date: '2026-05-21',
    comment: 'Comfortable, easy to layer, and the berry shade lasts well through the day.',
    verifiedPurchase: true,
  },
];
