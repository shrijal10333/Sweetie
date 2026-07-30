import React, { useState, useRef } from 'react';
import { Product, InstagramPost } from '../types';
import {
  Heart, MessageCircle, Instagram, ExternalLink, ShoppingBag,
  Play, Camera, X, Check, Sparkles, Plus, Upload, Trash2, Link as LinkIcon
} from 'lucide-react';

interface InstagramGalleryProps {
  products: Product[];
  posts: InstagramPost[];
  onSelectProduct: (product: Product) => void;
  onAddPost: (post: InstagramPost) => void;
  onDeletePost?: (id: string) => void;
  isAdmin?: boolean;
}

const DEFAULT_POST_IMAGE = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80';

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({
  products,
  posts,
  onSelectProduct,
  onAddPost,
  onDeletePost,
  isAdmin = false,
}) => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isUserTagModalOpen, setIsUserTagModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Add post form state
  const [authorHandle, setAuthorHandle] = useState('cherrylush.storee');
  const [postUrl, setPostUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isReel, setIsReel] = useState(true);
  const [taggedProductId, setTaggedProductId] = useState('');
  const [likesCount, setLikesCount] = useState<string>('');
  const [commentsCount, setCommentsCount] = useState<string>('');
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'file'>('url');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handleClean = authorHandle.trim().replace(/^@/, '') || 'cherrylush.storee';
    const finalUrl = postUrl.trim() || `https://www.instagram.com/${handleClean}/`;
    const autoIsReel = isReel || finalUrl.toLowerCase().includes('/reel/');

    const newPost: InstagramPost = {
      id: `insta-${Date.now()}`,
      imageUrl: imageUrl.trim() || DEFAULT_POST_IMAGE,
      likes: likesCount ? parseInt(likesCount) : Math.floor(Math.random() * 350) + 120,
      comments: commentsCount ? parseInt(commentsCount) : Math.floor(Math.random() * 25) + 6,
      caption: caption.trim() || `New ${autoIsReel ? 'reel' : 'post'} from @${handleClean}! ✨`,
      taggedProductId: taggedProductId,
      author: handleClean,
      isReel: autoIsReel,
      postUrl: finalUrl
    };

    onAddPost(newPost);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setIsSubmitModalOpen(false);
      // Reset form
      setPostUrl('');
      setImageUrl('');
      setCaption('');
      setTaggedProductId('');
      setLikesCount('');
      setCommentsCount('');
    }, 1500);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white via-pink-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md hover:scale-105 transition-transform cursor-pointer"
            onClick={() => window.open('https://www.instagram.com/cherrylush.storee/', '_blank')}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <Instagram className="w-4 h-4" />
            <span>@cherrylush.storee</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">LIVE FEED</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
            As Seen On Instagram
          </h2>

          <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto font-medium">
            Tag <strong className="text-pink-600">@cherrylush.storee</strong> on Instagram to get featured on our store feed! 📸✨
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {isAdmin ? (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-700 hover:to-rose-700 px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>👑 Admin: Post Reel / Photo</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUserTagModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-pink-700 bg-pink-100/90 hover:bg-pink-200 border border-pink-200 px-5 py-2.5 rounded-full transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-pink-600" />
                <span>Tag @cherrylush.storee To Get Featured</span>
              </button>
            )}

            <a
              href="https://www.instagram.com/cherrylush.storee/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-800 bg-white hover:bg-pink-50 border border-pink-200 px-4 py-2.5 rounded-full transition-all shadow-xs"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Follow Us</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Shoppable Posts Grid or Empty State */}
        {posts.length === 0 ? (
          <div className="text-center py-14 px-6 bg-pink-50/40 rounded-3xl border border-pink-100 max-w-xl mx-auto space-y-4 my-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg rotate-3">
              <Instagram className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-serif font-bold text-gray-900">No Instagram Posts Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                {isAdmin
                  ? 'When you post a reel or photo on Instagram, click below to add your post link & photo to showcase it here live!'
                  : 'When you post a reel or photo on Instagram, tag @cherrylush.storee to get featured on our store feed live!'}
              </p>
            </div>
            {isAdmin ? (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Reel or Post</span>
              </button>
            ) : (
              <a
                href="https://www.instagram.com/cherrylush.storee/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md hover:scale-105 transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow @cherrylush.storee on Instagram</span>
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {posts.map((post) => {
              const taggedProduct = products.find(p => p.id === post.taggedProductId);

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square rounded-3xl overflow-hidden border border-pink-100 shadow-xs cursor-pointer hover:shadow-xl transition-all duration-300 bg-gray-100"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Reel Badge */}
                  {post.isReel && (
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-full shadow-sm">
                      <Play className="w-3 h-3 fill-white" />
                    </div>
                  )}

                  {/* Delete Button for Admin */}
                  {(isAdmin || onDeletePost) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this Instagram post?')) {
                          onDeletePost?.(post.id);
                        }
                      }}
                      className="absolute top-2.5 left-2.5 z-20 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Hover Details Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-950/80 via-pink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                    
                    {/* Likes & Comments */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                        {post.likes.toLocaleString('en-IN')}
                      </span>
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        {post.comments}
                      </span>
                    </div>

                    {/* Caption & Tagged Product Pill */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] line-clamp-2 text-pink-100 leading-snug">
                        {post.caption}
                      </p>

                      {taggedProduct && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(taggedProduct);
                          }}
                          className="bg-white/95 text-gray-900 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center justify-between shadow-md hover:bg-pink-50 transition-colors"
                        >
                          <span className="truncate max-w-[80px]">{taggedProduct.name}</span>
                          <span className="text-pink-600 font-serif font-bold">₹{taggedProduct.price}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Corner Shopping Bag Icon */}
                  <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs p-1.5 rounded-full text-pink-600 shadow-sm group-hover:opacity-0 transition-opacity">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Instagram Follow Bar */}
        <div className="mt-8 text-center">
          <a
            href="https://www.instagram.com/cherrylush.storee/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-xs font-bold text-gray-800 hover:text-pink-600 bg-white px-6 py-3 rounded-full border border-pink-200 shadow-sm hover:shadow-md transition-all hover:border-pink-300"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>Follow @cherrylush.storee on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

      </div>

      {/* ── Lightbox / Post Detail Modal ────────────────────────────────────── */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-pink-100 relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Post Image */}
            <div className="md:w-1/2 relative bg-gray-900 flex items-center justify-center">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.caption}
                className="w-full h-64 md:h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {selectedPost.isReel && (
                <a
                  href={selectedPost.postUrl || 'https://www.instagram.com/cherrylush.storee/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-white/95 text-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-pink-600 ml-1" />
                  </div>
                </a>
              )}
            </div>

            {/* Post Info */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4 bg-white overflow-y-auto">
              <div>
                {/* Profile Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-pink-600 font-bold text-xs uppercase">
                        {(selectedPost.author || 'CL').slice(0, 2)}
                      </div>
                    </div>
                    <div>
                      <a
                        href={selectedPost.postUrl || 'https://www.instagram.com/cherrylush.storee/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-xs text-gray-900 hover:text-pink-600 flex items-center gap-1"
                      >
                        @{selectedPost.author || 'cherrylush.storee'}
                        <Sparkles className="w-3 h-3 text-pink-500" />
                      </a>
                      <p className="text-[10px] text-gray-400">Instagram {selectedPost.isReel ? 'Reel' : 'Post'}</p>
                    </div>
                  </div>

                  <a
                    href={selectedPost.postUrl || 'https://www.instagram.com/cherrylush.storee/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-full border border-pink-200 transition-colors"
                  >
                    View
                  </a>
                </div>

                {/* Caption */}
                <p className="text-xs text-gray-700 leading-relaxed mt-4">
                  {selectedPost.caption}
                </p>

                {/* Likes & Comments stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 font-bold text-rose-600">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    {selectedPost.likes.toLocaleString('en-IN')} likes
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    {selectedPost.comments} comments
                  </span>
                </div>
              </div>

              {/* Tagged Product */}
              {(() => {
                const tagged = products.find(p => p.id === selectedPost.taggedProductId);
                if (!tagged) return null;
                return (
                  <div className="bg-pink-50/70 p-3.5 rounded-2xl border border-pink-100 flex items-center gap-3">
                    <img src={tagged.images[0]} alt={tagged.name} className="w-12 h-12 rounded-xl object-cover border border-pink-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{tagged.name}</p>
                      <p className="text-xs font-serif font-bold text-pink-600">₹{tagged.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPost(null);
                        onSelectProduct(tagged);
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                    >
                      Shop Now
                    </button>
                  </div>
                );
              })()}

              <a
                href={selectedPost.postUrl || 'https://www.instagram.com/cherrylush.storee/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Instagram className="w-4 h-4 text-white" />
                <span>Open on Instagram</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Post / Reel Modal ────────────────────────────────────────────── */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900">Add Instagram Reel or Post</h3>
              <p className="text-xs text-gray-500">
                Post on Instagram & submit details here to automatically display it live on our store feed!
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm">Post Added Live to Feed! 🎉</p>
                <p className="text-xs text-emerald-700">Your post is now visible in the "As Seen On Instagram" section.</p>
              </div>
            ) : (
              <form onSubmit={handleAddPostSubmit} className="space-y-4 pt-1">
                
                {/* Author handle */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instagram Handle / Author</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-xs">@</span>
                    <input
                      type="text"
                      required
                      placeholder="cherrylush.storee"
                      value={authorHandle}
                      onChange={(e) => setAuthorHandle(e.target.value)}
                      className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                    />
                  </div>
                </div>

                {/* Reel or Post URL */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Instagram Post or Reel Link (URL)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://www.instagram.com/reel/Cxxxxxx/"
                      value={postUrl}
                      onChange={(e) => {
                        setPostUrl(e.target.value);
                        if (e.target.value.toLowerCase().includes('/reel/')) {
                          setIsReel(true);
                        }
                      }}
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Is Reel Checkbox */}
                <div className="flex items-center gap-2 bg-pink-50/60 p-3 rounded-2xl border border-pink-100">
                  <input
                    type="checkbox"
                    id="isReelCheck"
                    checked={isReel}
                    onChange={(e) => setIsReel(e.target.checked)}
                    className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isReelCheck" className="text-xs font-bold text-gray-800 cursor-pointer flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
                    This is an Instagram Reel 🎬
                  </label>
                </div>

                {/* Image Selection / Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Cover Photo / Thumbnail Image</label>
                    <div className="flex gap-2 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('url')}
                        className={`px-2 py-0.5 rounded-md ${imageUploadMode === 'url' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Image Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('file')}
                        className={`px-2 py-0.5 rounded-md ${imageUploadMode === 'file' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Upload Photo
                      </button>
                    </div>
                  </div>

                  {imageUploadMode === 'url' ? (
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or image link"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/40 py-3 rounded-2xl text-xs font-bold text-pink-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-pink-600" />
                        <span>Choose Photo File</span>
                      </button>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="mt-2.5 relative aspect-video rounded-2xl overflow-hidden border border-pink-200 bg-gray-900">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Caption / Description</label>
                  <textarea
                    rows={2}
                    placeholder="E.g., Coquette perfection with our Princess Rose Gold Earrings! 🎀✨"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>

                {/* Tagged Product */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tag a Product (Shoppable Link)</label>
                  <select
                    value={taggedProductId}
                    onChange={(e) => setTaggedProductId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white font-medium"
                  >
                    <option value="">-- None (No Tagged Product) --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Likes / Comments optional */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Likes Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 1420"
                      value={likesCount}
                      onChange={(e) => setLikesCount(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Comments Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 88"
                      value={commentsCount}
                      onChange={(e) => setCommentsCount(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish to Instagram Store Feed</span>
                </button>

              </form>
            )}
          </div>
        </div>
      )}

      {/* ── User Tag Information Modal ─────────────────────────────────────── */}
      {isUserTagModalOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsUserTagModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 relative space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsUserTagModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg">
              <Camera className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-serif font-bold text-gray-900">Get Featured on Our Store Feed</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Post your photo or reel on Instagram wearing your Cherry Lush products, and tag <strong className="text-pink-600">@cherrylush.storee</strong>!
              </p>
            </div>

            <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-100 text-left text-xs text-gray-700 space-y-2">
              <p className="font-bold text-pink-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-600" /> How to get featured:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 text-[11px] font-medium">
                <li>Post a photo or reel on Instagram wearing your purchase.</li>
                <li>Tag <strong>@cherrylush.storee</strong> in your caption or image tag.</li>
                <li>Store Admin reviews tagged posts & publishes them live to our website feed! 💖</li>
              </ol>
            </div>

            <a
              href="https://www.instagram.com/cherrylush.storee/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Instagram className="w-4 h-4" />
              <span>Open Instagram @cherrylush.storee</span>
            </a>
          </div>
        </div>
      )}

    </section>
  );
};
