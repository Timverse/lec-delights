'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Upload, Loader2, CheckCircle2, PackageSearch } from 'lucide-react';
import Image from 'next/image';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

interface AddFeatureCardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddFeatureCardForm({ onSuccess, onCancel }: AddFeatureCardFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [file, setFile] = useState<File | null>(null);
  
  // Product Linking State
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    // Fetch products to populate the dropdown
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('id, name').order('name', { ascending: true });
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('Please select an image.');
      return;
    }
    if (!selectedProductId) {
      setError('Please select a product for the button link.');
      return;
    }

    setIsAdding(true);

    try {
      // 1. Upload the picture for the Bento card
      const fileName = `feature-${Date.now()}-${file.name}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // 2. Insert the card data into the new table
      const { error: dbError } = await supabase.from('feature_cards').insert([
        {
          title,
          description,
          button_text: buttonText,
          // Table uses TEXT[], so we provide an array with our single URL
          image_urls: [publicUrl], 
          product_id: selectedProductId,
          display_order: parseInt(displayOrder) || 1,
        }
      ]);

      if (dbError) throw dbError;

      // 3. Success!
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2500);

    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 max-w-xl mx-auto relative overflow-hidden">
      
      {/* Success Overlay */}
      {success && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Card Added!</h3>
          <p className="text-gray-500">Your new bento grid card has been successfully added to the home page.</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h4 className="text-2xl font-serif font-bold text-gray-800">New Feature Card</h4>
        <button type="button" onClick={onCancel} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
          <X className="w-4 h-4"/>
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="e.g. Natural Lakadong Turmeric" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description / Preparation Details</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all resize-none" placeholder="Explain the preparation process here..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Button Text</label>
                <input required value={buttonText} onChange={(e) => setButtonText(e.target.value)} type="text" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="e.g. Shop Honey" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                <input required value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value.replace(/\D/g, ''))} type="text" inputMode="numeric" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="e.g. 1, 2, 3" />
              </div>
          </div>
          
          {/* Product Dropdown for Button Link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Button Links to Product</label>
            <div className="relative">
              <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select required value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all text-sm">
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Card Image (The small picture)</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 text-center cursor-pointer">
              <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-gray-500 font-medium">{file ? `1 file selected` : 'Click to upload photo'}</p>
              </div>
            </div>
          </div>
      </div>

      {error && <p className="text-center font-bold text-red-500 text-sm">{error}</p>}

      <button disabled={isAdding} type="submit" className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--color-primary)]/20">
        {isAdding ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {isAdding ? 'Adding Card...' : 'Add New Feature Card'}
      </button>
    </form>
  );
}