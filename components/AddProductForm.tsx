'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload, Plus, Loader2, Trash2, ListPlus } from 'lucide-react';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AddProductForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  
  // Variants State
  const [variants, setVariants] = useState<{ label: string; price: string }[]>([]);

  const addVariant = () => {
    setVariants([...variants, { label: '', price: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: 'label' | 'price', value: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setMessage('Please select at least one image.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading images...');

    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }

      setMessage('Saving product...');

      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name,
            price: parseFloat(price),
            category,
            description,
            image_urls: imageUrls,
            variants: variants.map(v => ({ ...v, price: parseFloat(v.price) }))
          }
        ]);

      if (dbError) throw dbError;

      setMessage('Product successfully added!');
      setName(''); setPrice(''); setCategory(''); setDescription(''); setFiles(null); setVariants([]);
      setTimeout(() => setMessage(''), 3000);

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none" placeholder="e.g., Wild Forest Honey" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Default Price (₹)</label>
            <input required value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none" placeholder="400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <input required value={category} onChange={(e) => setCategory(e.target.value)} type="text" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none" placeholder="e.g., Honey" />
          </div>
        </div>

        {/* --- ADD VARIANTS SECTION --- */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-blue-900 flex items-center gap-2">
              <ListPlus className="w-5 h-5" /> Quantity Variants
            </h4>
            <button type="button" onClick={addVariant} className="text-xs font-bold text-blue-600 bg-white px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">
              + Add Size/Price
            </button>
          </div>
          
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input required placeholder="Size (e.g. 500g)" value={v.label} onChange={e => updateVariant(i, 'label', e.target.value)} className="flex-1 p-3 bg-white rounded-xl border border-blue-100 text-sm outline-none" />
              <input required placeholder="Price (₹)" type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-24 p-3 bg-white rounded-xl border border-blue-100 text-sm outline-none" />
              <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Images</label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 text-center cursor-pointer">
            <input required type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-gray-500 font-medium">{files && files.length > 0 ? `${files.length} selected` : 'Click to upload pictures'}</p>
            </div>
          </div>
        </div>
      </div>

      <button disabled={isUploading} type="submit" className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
        {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
        {isUploading ? 'Uploading...' : 'Add New Product'}
      </button>

      {message && <p className="text-center font-medium text-[var(--color-primary)]">{message}</p>}
    </form>
  );
}