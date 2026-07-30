import React, { useState } from 'react';
import { Review } from '../types';
import { Star, CheckCircle2, MessageSquare, Plus, Sparkles } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (newReview: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !comment) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName,
      userHandle: userHandle ? (userHandle.startsWith('@') ? userHandle : `@${userHandle}`) : undefined,
      rating,
      date: 'Just now',
      comment,
      verifiedPurchase: true
    };

    onAddReview(newRev);
    setShowForm(false);
    setUserName('');
    setUserHandle('');
    setComment('');
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <section className="py-12 bg-pink-50/30 border-y border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-pink-600 font-bold text-xs uppercase tracking-widest bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
              Verified Buyer Reviews 💖
            </span>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mt-2">
              Loved By Besties Across India
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">{avgRating} out of 5</span>
              <span className="text-xs text-gray-500">({reviews.length} total customer reviews)</span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-6 bg-white rounded-3xl border border-pink-200 shadow-lg space-y-4 max-w-xl animate-fade-in">
            <h3 className="font-serif font-bold text-base text-gray-900">Share Your Cherry Lush Store Experience</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Kapoor"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram Handle (Optional)</label>
                <input
                  type="text"
                  placeholder="@meera_looks"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Your Review *</label>
              <textarea
                required
                rows={3}
                placeholder="How was the packaging, quality, and shipping?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-pink-600 text-white font-bold text-xs px-6 py-2 rounded-xl hover:bg-pink-700 transition-colors shadow-xs"
              >
                Post Review ✨
              </button>
            </div>
          </form>
        )}

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-white rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                {/* Header User Row */}
                <div className="flex items-center gap-3">
                  {rev.userImage ? (
                    <img
                      src={rev.userImage}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover border border-pink-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-bold font-serif flex items-center justify-center text-sm">
                      {rev.userName[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-serif font-bold text-xs text-gray-900">{rev.userName}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-600 fill-pink-100" />
                    </div>
                    {rev.userHandle && (
                      <p className="text-[10px] text-pink-600 font-medium">{rev.userHandle}</p>
                    )}
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-pink-50 flex justify-between items-center text-[10px] text-gray-400">
                <span>Verified Buyer</span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
