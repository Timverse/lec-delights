'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || rating < 1) return;
    
    setIsSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert([
      { product_id: productId, customer_name: name, rating, comment }
    ]);

    setIsSubmitting(false);
    
    if (!error) {
      setSuccess(true);
      setName('');
      setRating(5);
      setComment('');
      fetchReviews(); // Reload the list
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
      }, 3000);
    } else {
      alert("Error submitting review. Please try again.");
    }
  };

  // Calculate Average Rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-20 border-t border-gray-100 pt-16">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex text-[var(--color-primary)]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${parseFloat(averageRating as string) >= star ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="font-bold text-gray-700">{averageRating} out of 5</span>
            <span className="text-gray-400 text-sm">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-full font-bold hover:bg-[var(--color-primary)] hover:text-white transition-all shrink-0"
        >
          {showForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-12 relative overflow-hidden">
          
          {success && (
            <div className="absolute inset-0 bg-green-50 z-10 flex flex-col items-center justify-center text-center p-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-serif font-bold text-gray-800">Thank You!</h3>
              <p className="text-gray-600">Your review has been successfully submitted.</p>
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-800 mb-6">Share your experience</h3>
          
          <div className="space-y-6 max-w-2xl">
            {/* Interactive Star Rating */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Overall Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        (hoveredRating || rating) >= star 
                          ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' 
                          : 'text-gray-300'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary)]" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
              <textarea required value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary)] resize-none" placeholder="What did you like about this product?" />
            </div>

            <button type="submit" disabled={isSubmitting} className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#7fae45] transition-all disabled:opacity-70">
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No reviews yet</h3>
            <p className="text-gray-500">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-800">{review.customer_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex text-[var(--color-primary)] mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}