'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trash2, Plus, Loader2, X, Edit, Upload, Calculator, ListPlus, Image as ImageIcon, Settings, PackageSearch, CheckCircle2, Truck, Percent, Package, ShoppingBag, MapPin, Mail, KeyRound, Sparkles } from 'lucide-react';
import AddProductForm from './AddProductForm';
import AddFeatureCardForm from './AddFeatureCardForm'; 
import Image from 'next/image';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // --- STORE SETTINGS STATE ---
  const [taxRate, setTaxRate] = useState('5');
  const [shippingLocal, setShippingLocal] = useState('50');
  const [shippingRegional, setShippingRegional] = useState('80');
  const [shippingNational, setShippingNational] = useState('120');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1500');
  
  // --- NEW: EMAIL AUTOMATION STATE ---
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromEmail, setResendFromEmail] = useState('');
  
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  
  // Feature Cards State
  const [featureCards, setFeatureCards] = useState<any[]>([]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  
  // --- NEW: ARRIVALS STATE ---
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [isUpdatingArrivals, setIsUpdatingArrivals] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Edit Modal States
  const [editModal, setEditModal] = useState<{ isOpen: boolean; product: any | null }>({ isOpen: false, product: null });
  const [editName, setEditName] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editDiscountPercent, setEditDiscountPercent] = useState('');
  const [editVariants, setEditVariants] = useState<any[]>([]);
  const [editStock, setEditStock] = useState('100');
  const [isUpdatingEdit, setIsUpdatingEdit] = useState(false);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);

  // Edit Card States
  const [editCardModal, setEditCardModal] = useState<{ isOpen: boolean; card: any | null }>({ isOpen: false, card: null });
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardButtonText, setEditCardButtonText] = useState('');
  const [editCardDisplayOrder, setEditCardDisplayOrder] = useState('');
  const [editCardProductId, setEditCardProductId] = useState('');
  const [editCardNewFile, setEditCardNewFile] = useState<File | null>(null);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    
    // Fetch Products
    const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);
    
    // Fetch New Arrivals slots
    const { data: arrivalsData } = await supabase
      .from('new_arrivals')
      .select('*, products(id, name)')
      .order('slot_number', { ascending: true });
    if (arrivalsData) setNewArrivals(arrivalsData);
    
    const { data: heroData } = await supabase.from('hero_images').select('*').order('created_at', { ascending: true });
    if (heroData) setHeroImages(heroData);
    
    const { data: cardData } = await supabase.from('feature_cards').select('*').order('display_order', { ascending: true });
    if (cardData) setFeatureCards(cardData);
    
    const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
    if (settings) {
      setLogoUrl(settings.logo_url);
      if (settings.tax_rate !== undefined) setTaxRate(settings.tax_rate.toString());
      if (settings.shipping_local !== undefined) setShippingLocal(settings.shipping_local.toString());
      if (settings.shipping_regional !== undefined) setShippingRegional(settings.shipping_regional.toString());
      if (settings.shipping_national !== undefined) setShippingNational(settings.shipping_national.toString());
      if (settings.free_shipping_threshold !== undefined) setFreeShippingThreshold(settings.free_shipping_threshold.toString());
      
      // LOAD NEW EMAIL SETTINGS
      if (settings.resend_api_key !== undefined) setResendApiKey(settings.resend_api_key || '');
      if (settings.resend_from_email !== undefined) setResendFromEmail(settings.resend_from_email || '');
    }

    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
    
    setIsLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- SAVE GLOBAL STORE SETTINGS ---
  const handleSaveStoreSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await supabase.from('site_settings').upsert({
        id: 'global_config',
        tax_rate: parseFloat(taxRate) || 0,
        shipping_local: parseInt(shippingLocal) || 0,
        shipping_regional: parseInt(shippingRegional) || 0,
        shipping_national: parseInt(shippingNational) || 0,
        free_shipping_threshold: parseInt(freeShippingThreshold) || 0,
        resend_api_key: resendApiKey,          // SAVE API KEY
        resend_from_email: resendFromEmail,    // SAVE FROM EMAIL
        updated_at: new Date()
      });
      alert("Store Settings Updated Successfully!");
    } catch (error: any) {
      alert("Error saving settings: " + error.message);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // --- UPDATE NEW ARRIVAL SLOT ---
  const handleUpdateNewArrival = async (slotNumber: number, productId: string) => {
    setIsUpdatingArrivals(true);
    try {
      const { error } = await supabase
        .from('new_arrivals')
        .upsert(
          { slot_number: slotNumber, product_id: productId || null },
          { onConflict: 'slot_number' }
        );

      if (error) throw error;
      alert(`Slot ${slotNumber} updated successfully!`);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingArrivals(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // 1. Update the database
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      
      // 2. Update the screen immediately
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // 3. Find the order details
      const orderToUpdate = orders.find(o => o.id === orderId);
      
      // 4. Ping the new email API (Now with Alerts!)
      if (orderToUpdate) {
         try {
           const res = await fetch('/api/send-status-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: orderToUpdate, newStatus })
           });
           
           const result = await res.json();
           
           if (!res.ok || result.error) {
              console.error("Status Email Error:", result);
              alert("Status changed, but email failed to send!\nError: " + JSON.stringify(result.error || result.note));
           } else if (result.note === 'No API key provided') {
              alert("Status changed. Email skipped (No API key found in settings).");
           } else {
              alert(`Success! Order marked as ${newStatus} and email sent to customer.`);
           }
         } catch (fetchErr) {
           console.error("Network error:", fetchErr);
           alert("Status changed, but network error occurred while sending email.");
         }
      }

    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await supabase.from('products').delete().eq('id', id);
    fetchAllData();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fileName = `logo-${Date.now()}-${file.name}`;
      await supabase.storage.from('products').upload(fileName, file);
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      await supabase.from('site_settings').upsert({ id: 'global_config', logo_url: data.publicUrl, updated_at: new Date() });
      setLogoUrl(data.publicUrl);
      alert("Logo updated successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingHero(true);
    for (let i = 0; i < files.length; i++) {
      const name = `hero-${Date.now()}-${files[i].name}`;
      await supabase.storage.from('products').upload(name, files[i]);
      await supabase.from('hero_images').insert([{ image_url: supabase.storage.from('products').getPublicUrl(name).data.publicUrl }]);
    }
    fetchAllData();
    setIsUploadingHero(false);
  };

  const handleAddFeatureCardSuccess = () => {
    setShowAddCardForm(false);
    fetchAllData();
  };

  const handleDeleteFeatureCard = async (id: string, title: string) => {
    if (!window.confirm(`Delete feature card '${title}'?`)) return;
    await supabase.from('feature_cards').delete().eq('id', id);
    fetchAllData();
  };

  const openEditCardModal = (card: any) => {
    setEditCardTitle(card.title || '');
    setEditCardDescription(card.description || '');
    setEditCardButtonText(card.button_text || '');
    setEditCardDisplayOrder(card.display_order?.toString() || '1');
    setEditCardProductId(card.product_id || '');
    setEditCardNewFile(null);
    setEditCardModal({ isOpen: true, card });
  };

  const handleEditCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCard(true);
    try {
      let finalImageUrl = editCardModal.card.image_urls?.[0];
      if (editCardNewFile) {
        const fileName = `feature-${Date.now()}-${editCardNewFile.name}`;
        await supabase.storage.from('products').upload(fileName, editCardNewFile);
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
      const updateData = { 
        title: editCardTitle, 
        description: editCardDescription, 
        button_text: editCardButtonText, 
        image_urls: [finalImageUrl], 
        product_id: editCardProductId, 
        display_order: parseInt(editCardDisplayOrder) || 1
      };
      await supabase.from('feature_cards').update(updateData).eq('id', editCardModal.card.id);
      setEditCardModal({ isOpen: false, card: null });
      fetchAllData();
    } catch (err: any) { alert(err.message); } finally { setIsUpdatingCard(false); }
  };

  const handlePercentChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    setEditDiscountPercent(cleaned);
    const base = parseFloat(editBasePrice);
    const percent = parseFloat(cleaned);
    if (!cleaned || isNaN(base) || isNaN(percent)) { setEditSalePrice(''); return; }
    setEditSalePrice((base * (1 - percent / 100)).toFixed(0));
  };

  const handleSalePriceChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    setEditSalePrice(cleaned);
    const base = parseFloat(editBasePrice);
    const sale = parseFloat(cleaned);
    if (!cleaned || isNaN(base) || isNaN(sale)) { setEditDiscountPercent(''); return; }
    const percent = ((base - sale) / base) * 100;
    setEditDiscountPercent(percent > 0 ? percent.toFixed(0) : '0');
  };

  const openEditModal = (product: any) => {
    setEditName(product.name || '');
    const basePrice = product.old_price ? product.old_price : product.price;
    const salePrice = product.old_price ? product.price : '';
    setEditBasePrice(basePrice?.toString() || '');
    setEditSalePrice(salePrice ? salePrice.toString() : '');
    if (salePrice) {
      setEditDiscountPercent((((basePrice - salePrice) / basePrice) * 100).toFixed(0));
    } else {
      setEditDiscountPercent('');
    }
    setEditCategory(product.category || '');
    setEditDescription(product.description || '');
    setEditStock(product.stock !== undefined ? product.stock.toString() : '100');
    setEditVariants(product.variants || []);
    setEditExistingImages(product.image_urls || []);
    setEditNewFiles([]);
    setEditModal({ isOpen: true, product });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingEdit(true);
    try {
      const newlyUploadedUrls: string[] = [];
      for (let i = 0; i < editNewFiles.length; i++) {
        const file = editNewFiles[i];
        const name = `${Date.now()}-${file.name}`;
        await supabase.storage.from('products').upload(name, file);
        const { data } = supabase.storage.from('products').getPublicUrl(name);
        newlyUploadedUrls.push(data.publicUrl);
      }
      const finalUrls = [...editExistingImages, ...newlyUploadedUrls];
      const base = parseFloat(editBasePrice);
      const sale = parseFloat(editSalePrice);
      const data: any = { 
        name: editName, category: editCategory, description: editDescription, stock: parseInt(editStock) || 0,
        image_urls: finalUrls, variants: editVariants.map(v => ({...v, price: parseFloat(v.price)})) 
      };
      if (sale > 0 && sale < base) { data.old_price = base; data.price = sale; } else { data.price = base; data.old_price = null; }
      await supabase.from('products').update(data).eq('id', editModal.product.id);
      setEditModal({ isOpen: false, product: null });
      fetchAllData();
    } catch (err: any) { alert(err.message); } finally { setIsUpdatingEdit(false); }
  };

  return (
    <div className="space-y-12 pb-24">
      
      {/* BRANDING SECTION */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="text-[var(--color-primary)]" />
          <h2 className="text-2xl font-serif font-bold">Site Branding</h2>
        </div>
        <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                {logoUrl ? <Image src={logoUrl} alt="Logo" fill unoptimized className="object-contain p-2" /> : <span className="text-[var(--color-primary)] font-bold text-2xl">GF</span>}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Upload New Logo</label>
                <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 cursor-pointer" />
                    {isUploadingLogo && <Loader2 className="animate-spin text-[var(--color-primary)] w-5 h-5" />}
                </div>
            </div>
        </div>
      </div>

      {/* GLOBAL STORE SETTINGS SECTION (TAX, SHIPPING, & EMAIL) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-[var(--color-primary)]" />
          <h2 className="text-2xl font-serif font-bold">Store Configurations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Tax */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Percent className="w-4 h-4 text-[var(--color-primary)]" /> Taxation Settings</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GST / Tax Rate (%)</label>
              <input value={taxRate} onChange={e => setTaxRate(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary)]" placeholder="e.g. 5" />
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Truck className="w-4 h-4 text-[var(--color-primary)]" /> Shipping Rates</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Local (Meghalaya) ₹</label>
                  <input value={shippingLocal} onChange={e => setShippingLocal(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary)]" placeholder="50" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Regional (NE India) ₹</label>
                  <input value={shippingRegional} onChange={e => setShippingRegional(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary)]" placeholder="80" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">National (Rest of India) ₹</label>
                  <input value={shippingNational} onChange={e => setShippingNational(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary)]" placeholder="120" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-green-600 uppercase mb-2">Free Shipping Over ₹</label>
                  <input value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-white rounded-xl border border-green-200 outline-none focus:border-green-500" placeholder="1500" />
               </div>
             </div>
          </div>
        </div>

        {/* --- NEW: EMAIL AUTOMATION SETTINGS --- */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4"><Mail className="w-5 h-5 text-blue-600" /> Email Automation (Resend)</h3>
            <p className="text-sm text-blue-700 mb-4">Leave API key blank to disable automated order confirmation emails. Enter credentials when ready to hand off to the owner.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><KeyRound className="w-3 h-3"/> Resend API Key</label>
                  <input 
                    type="password" 
                    value={resendApiKey} 
                    onChange={e => setResendApiKey(e.target.value)} 
                    className="w-full p-4 bg-white rounded-xl border border-blue-200 outline-none focus:border-blue-500" 
                    placeholder="re_..." 
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><Mail className="w-3 h-3"/> "From" Email Address</label>
                  <input 
                    type="email" 
                    value={resendFromEmail} 
                    onChange={e => setResendFromEmail(e.target.value)} 
                    className="w-full p-4 bg-white rounded-xl border border-blue-200 outline-none focus:border-blue-500" 
                    placeholder="Lec Delights <orders@lecdelights.com>" 
                  />
               </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSaveStoreSettings}
            disabled={isUpdatingSettings}
            className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#7fae45] transition-all disabled:opacity-70 shadow-lg shadow-[var(--color-primary)]/20"
          >
            {isUpdatingSettings ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* ORDERS MANAGEMENT SECTION */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <Package className="text-[var(--color-primary)] w-7 h-7" />
          <h2 className="text-2xl font-serif font-bold">Order Management</h2>
        </div>

        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 flex flex-col xl:flex-row gap-6 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                 order.status === 'Delivered' ? 'bg-green-500' : 
                 order.status === 'Shipped' ? 'bg-blue-500' : 
                 order.status === 'Cancelled' ? 'bg-red-500' : 
                 'bg-orange-500'
              }`}></div>

              <div className="flex-1 space-y-4 pl-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="font-bold text-2xl text-[var(--color-primary)]">₹{order.total}</span>
                    <p className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider bg-white border px-2 py-1 rounded-md inline-block sm:block">{order.payment_method}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="font-bold text-gray-700 flex items-center gap-2 mb-3 border-b pb-2"><ShoppingBag className="w-4 h-4"/> Items Bought</p>
                    <ul className="space-y-2 text-gray-600">
                      {order.items.map((item: any, i: number) => (
                        <li key={i} className="flex justify-between items-start border-b border-gray-50 pb-1 last:border-0">
                          <span><span className="font-bold">{item.quantity}x</span> {item.name} {item.variant ? <span className="text-xs text-gray-400 block">{item.variant}</span> : ''}</span>
                          <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 flex items-center gap-2 mb-3 border-b pb-2"><MapPin className="w-4 h-4"/> Customer Details</p>
                    <p className="font-bold text-gray-800 mb-1">{order.customer_name}</p>
                    <p className="text-gray-600 text-xs mb-3">{order.phone} • {order.email}</p>
                    <p className="text-gray-600 text-xs leading-relaxed bg-gray-50 p-2 rounded-lg border">
                      {order.address}<br />
                      {order.city}, {order.state} - {order.pincode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full xl:w-64 shrink-0 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-gray-200 pt-6 xl:pt-0 xl:pl-6 pl-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Order Status</label>
                <select 
                  value={order.status} 
                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  className={`w-full p-4 rounded-xl border-2 font-bold text-sm outline-none transition-all cursor-pointer shadow-sm ${
                    order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' : 
                    order.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                    order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 
                    'bg-orange-50 border-orange-200 text-orange-700'
                  }`}
                >
                  <option value="New Order">🟢 New Order</option>
                  <option value="Processing">🟡 Processing</option>
                  <option value="Shipped">🔵 Shipped</option>
                  <option value="Delivered">✅ Delivered</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-lg">No orders received yet.</p>
              <p className="text-sm text-gray-400 mt-1">Once a customer places an order, it will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* INVENTORY SECTION */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif font-bold">Product Inventory</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>
        {showAddForm && <AddProductForm />}
        <div className="grid gap-4 mt-8">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 relative bg-white rounded-lg border overflow-hidden">
                  <Image src={p.image_urls?.[0] || '/placeholder.png'} alt="" fill unoptimized className="object-cover" />
                </div>
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{p.price} • <span className={p.stock < 5 ? "text-red-500 font-bold" : ""}>Stock: {p.stock !== undefined ? p.stock : '100'}</span> • {p.variants?.length || 0} Variants
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(p)} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDelete(p.id, p.name)} className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BENTO GRID FEATURE CARDS SECTION */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif font-bold">Home Page Bento Grid Cards</h2>
          <button onClick={() => setShowAddCardForm(!showAddCardForm)} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            {showAddCardForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {showAddCardForm ? 'Cancel' : 'Add Feature Card'}
          </button>
        </div>
        
        {showAddCardForm && <AddFeatureCardForm onSuccess={handleAddFeatureCardSuccess} onCancel={() => setShowAddCardForm(false)} />}
        
        <div className="grid gap-4 mt-8">
          {featureCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 relative bg-white rounded-lg border overflow-hidden">
                    <Image src={card.image_urls?.[0] || '/placeholder.png'} alt="" fill unoptimized className="object-cover p-1" />
                </div>
                <div>
                    <p className="font-bold text-gray-800">{card.title}</p>
                    <p className="text-sm text-gray-500">Order: {card.display_order} • Product ID: {card.product_id?.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditCardModal(card)} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteFeatureCard(card.id, card.title)} className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
          {featureCards.length === 0 && <p className="text-gray-400 italic text-center py-6">No feature cards added yet.</p>}
        </div>
      </div>

      {/* --- NEW ARRIVALS SHOWCASE SECTION --- */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-orange-500 w-7 h-7" />
          <h2 className="text-2xl font-serif font-bold">New Arrivals Showcase</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8">Select the 3 products you want to feature in the "New Arrivals" section on the Home Page.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((slot) => {
            const currentItem = newArrivals.find(a => a.slot_number === slot);
            return (
              <div key={slot} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Slot 0{slot}</span>
                  {isUpdatingArrivals && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-700">Featured Product:</p>
                  <p className="text-lg font-serif font-bold text-[var(--color-primary)] truncate">
                    {currentItem?.products?.name || "Empty Slot"}
                  </p>
                </div>

                <select 
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  value={currentItem?.product_id || ""}
                  onChange={(e) => handleUpdateNewArrival(slot, e.target.value)}
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* HERO SLIDER SECTION */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6"><ImageIcon className="text-[var(--color-primary)]" /><h2 className="text-2xl font-serif font-bold">Home Slider</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
            <input type="file" multiple accept="image/*" onChange={handleUploadHeroImage} className="absolute inset-0 opacity-0 cursor-pointer" />
            {isUploadingHero ? <Loader2 className="animate-spin" /> : <Upload className="text-gray-400" />}
          </div>
          {heroImages.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border group">
                <Image src={img.image_url} alt="" fill unoptimized className="object-cover" />
                <button onClick={async () => { if(window.confirm('Remove slider image?')){ await supabase.from('hero_images').delete().eq('id', img.id); fetchAllData(); } }} className="absolute top-2 right-2 p-2 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================================== */}
      {/* --- ALL-IN-ONE EDIT MODAL (Products) - WITH FIXED SCROLL & STICKY FOOTER --- */}
      {/* ==================================================================================== */}
      {editModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setEditModal({ isOpen: false, product: null })}
        >
            <div 
              className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()} 
            >
                <form onSubmit={handleEditSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                      <h3 className="text-3xl font-serif font-bold">Edit Product</h3>
                      <button type="button" onClick={() => setEditModal({ isOpen: false, product: null })} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
                        <X className="w-5 h-5"/>
                      </button>
                    </div>

                    <div className="px-8 py-6 overflow-y-auto space-y-8 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                              <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 mt-1 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" placeholder="Name" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Base Price</label>
                              <input required value={editBasePrice} onChange={e => setEditBasePrice(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full p-4 mt-1 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" placeholder="Price" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                              <input required value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full p-4 mt-1 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" placeholder="Category" />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase">Current Stock (Global)</label>
                              <input required value={editStock} onChange={e => setEditStock(e.target.value.replace(/[^0-9]/g, ''))} className="w-full p-4 mt-1 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" placeholder="e.g. 100" />
                            </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} className="w-full p-4 mt-1 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" placeholder="Description" />
                        </div>
                        
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-2 mb-3"><Calculator className="w-4 h-4"/> Sale Discount</label>
                            <div className="flex gap-4">
                              <input placeholder="Disc %" value={editDiscountPercent} onChange={e => handlePercentChange(e.target.value)} className="w-1/2 p-4 rounded-xl border outline-none focus:border-orange-300" />
                              <input placeholder="Sale Price" value={editSalePrice} onChange={e => handleSalePriceChange(e.target.value)} className="w-1/2 p-4 rounded-xl border outline-none focus:border-orange-300" />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2"><ListPlus className="w-4 h-4"/> Variants & Sizes</label>
                            <button type="button" onClick={() => setEditVariants([...editVariants, {label: '', price: ''}])} className="text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm">+ Add Variant</button>
                          </div>
                          
                          <div className="space-y-3">
                            {editVariants.map((v, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={v.label || ''} onChange={e => { const vn = [...editVariants]; vn[i].label = e.target.value; setEditVariants(vn); }} placeholder="Size (e.g. 500gm)" className="flex-1 p-3 border rounded-xl outline-none focus:border-blue-300" />
                                    <input value={v.price || ''} onChange={e => { const vn = [...editVariants]; vn[i].price = e.target.value; setEditVariants(vn); }} placeholder="Price (₹)" className="w-28 p-3 border rounded-xl outline-none focus:border-blue-300" />
                                    <button type="button" onClick={() => setEditVariants(editVariants.filter((_, idx) => idx !== i))} className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            ))}
                            {editVariants.length === 0 && <p className="text-sm text-blue-400 italic">No variants. Using base price.</p>}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Product Images</label>
                            <div className="relative">
                              <button type="button" className="bg-white border text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-100 shadow-sm transition-all">
                                <Upload className="w-4 h-4"/> Add Photos
                              </button>
                              <input type="file" multiple accept="image/*" onChange={(e) => {
                                if (e.target.files) setEditNewFiles([...editNewFiles, ...Array.from(e.target.files)]);
                              }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                          </div>

                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {editExistingImages.map((url, i) => (
                              <div key={`existing-${i}`} className="relative w-24 h-24 shrink-0 border-2 border-white shadow-sm rounded-xl overflow-hidden group bg-white">
                                <Image src={url} alt="" fill unoptimized className="object-cover" />
                                <button type="button" onClick={() => setEditExistingImages(editExistingImages.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6"/></button>
                              </div>
                            ))}
                            
                            {editNewFiles.map((file, i) => (
                              <div key={`new-${i}`} className="relative w-24 h-24 shrink-0 border-2 border-green-500 shadow-sm rounded-xl overflow-hidden group bg-white">
                                <Image src={URL.createObjectURL(file)} alt="" fill unoptimized className="object-cover opacity-70" />
                                <span className="absolute bottom-0 inset-x-0 bg-green-500 text-white text-[10px] font-bold text-center py-0.5">NEW</span>
                                <button type="button" onClick={() => setEditNewFiles(editNewFiles.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6"/></button>
                              </div>
                            ))}
                          </div>
                        </div>

                    </div>

                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0 mt-auto">
                      <button 
                        type="button" 
                        onClick={() => setEditModal({ isOpen: false, product: null })} 
                        className="w-1/3 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isUpdatingEdit} 
                        className="w-2/3 bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#7fae45] transition-all shadow-lg shadow-[var(--color-primary)]/20"
                      >
                        {isUpdatingEdit ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update Product'}
                      </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* --- EDIT FEATURE CARD MODAL - WITH FIXED SCROLL & STICKY FOOTER --- */}
      {/* ==================================================================================== */}
      {editCardModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setEditCardModal({ isOpen: false, card: null })} 
        >
            <div 
              className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()} 
            >
                <form onSubmit={handleEditCardSubmit} className="flex flex-col h-full overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                      <h3 className="text-3xl font-serif font-bold">Edit Feature Card</h3>
                      <button type="button" onClick={() => setEditCardModal({ isOpen: false, card: null })} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
                        <X className="w-5 h-5"/>
                      </button>
                    </div>

                    <div className="px-8 py-6 overflow-y-auto space-y-6 flex-grow">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                            <input required value={editCardTitle} onChange={e => setEditCardTitle(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description / Prep Details</label>
                            <textarea required value={editCardDescription} onChange={e => setEditCardDescription(e.target.value)} rows={4} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Button Text</label>
                                <input required value={editCardButtonText} onChange={e => setEditCardButtonText(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Order</label>
                                <input required value={editCardDisplayOrder} onChange={e => setEditCardDisplayOrder(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-gray-50 rounded-xl border outline-none focus:border-[var(--color-primary)]" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Button Links to Product</label>
                            <div className="relative">
                                <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select required value={editCardProductId} onChange={e => setEditCardProductId(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all text-sm">
                                    <option value="">Select product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-4">Card Image</label>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center bg-gray-100 overflow-hidden relative shadow-sm">
                                    {editCardModal.card.image_urls?.[0] && (
                                      <Image src={editCardModal.card.image_urls[0]} alt="" fill unoptimized className="object-contain p-1" />
                                    )}
                                </div>
                                <div className="relative">
                                    <button type="button" className="bg-white border-2 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-100 shadow-sm transition-all">
                                        <Upload className="w-4 h-4"/> Replace Photo
                                    </button>
                                    <input type="file" accept="image/*" onChange={(e) => setEditCardNewFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {editCardNewFile && <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Selected</p>}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0 mt-auto">
                      <button 
                        type="button" 
                        onClick={() => setEditCardModal({ isOpen: false, card: null })} 
                        className="w-1/3 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isUpdatingCard} 
                        className="w-2/3 bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[var(--color-primary)]/20"
                      >
                        {isUpdatingCard ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Card Changes'}
                      </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}