'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Loader2, CreditCard, Truck, Smartphone, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script'; // Import Script for Razorpay

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Meghalaya',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
      if (data) {
        setStoreSettings(data);
      } else {
        setStoreSettings({ tax_rate: 5, shipping_local: 50, shipping_regional: 80, shipping_national: 120, free_shipping_threshold: 1500 });
      }
    };
    fetchSettings();
  }, []);

  // --- RAZORPAY LOGIC START ---
  const handlePayment = async () => {
    try {
      // 1. Create the order on your server
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const order = await res.json();

      if (!order.id) throw new Error("Failed to create Razorpay order");

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Lec Delights",
        description: "Payment for Lec Delights Snacks",
        order_id: order.id,
        handler: function (response: any) {
          // This code runs ONLY if payment succeeds
          console.log("Payment Success:", response.razorpay_payment_id);
          clearCart();
          router.push('/'); // Or a success page
          alert("Payment Successful! Order Confirmed.");
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#7fae45" }, // Matching your green brand color
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed. Please try again.");
    }
  };
  // --- RAZORPAY LOGIC END ---

  if (!mounted || !storeSettings) return (
    <div className="min-h-screen bg-[#fafaf9] pt-40 pb-24 flex justify-center">
      <Loader2 className="animate-spin text-[var(--color-primary)] w-10 h-10" />
    </div>
  );

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxRate = (storeSettings.tax_rate || 5) / 100;
  const taxAmount = Math.round(subtotal * taxRate);

  let shippingCost = 0;
  if (formData.state === 'Meghalaya') {
    shippingCost = storeSettings.shipping_local || 50;
  } else if (['Assam', 'Manipur', 'Nagaland', 'Tripura', 'Mizoram', 'Arunachal Pradesh'].includes(formData.state)) {
    shippingCost = storeSettings.shipping_regional || 80;
  } else {
    shippingCost = storeSettings.shipping_national || 120;
  }

  const freeShippingLimit = storeSettings.free_shipping_threshold || 1500;
  if (subtotal >= freeShippingLimit) {
    shippingCost = 0;
  }

  const total = subtotal + taxAmount + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderData = {
      customer_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      items: items,
      subtotal: subtotal,
      tax: taxAmount,
      shipping: shippingCost,
      total: total,
      payment_method: paymentMethod,
      status: 'New Order'
    };

    // 1. Save to Supabase
    const { data: savedOrder, error } = await supabase.from('orders').insert([orderData]).select().single();

    if (error) {
      setIsProcessing(false);
      alert("Something went wrong saving your order: " + error.message);
      return;
    }

    // 2. Send Email
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedOrder),
      });
    } catch (emailError) {
      console.error("Order saved, but email failed:", emailError);
    }

    setIsProcessing(false);
    
    // 3. Trigger Real Payment
    await handlePayment();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] pt-40 pb-24 px-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Truck className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products" className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-full font-bold hover:bg-[#7fae45] transition-all shadow-lg shadow-[var(--color-primary)]/20">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-32 pb-24">
      {/* ADD SCRIPT HERE */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-bold text-sm mb-8 transition-colors uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-3/5 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-3xl font-serif font-bold text-[var(--color-foreground)] mb-8">Shipping Details</h2>
              
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="House/Flat No., Street Name, Area" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <select required name="state" value={formData.state} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all">
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Assam">Assam</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Other">Rest of India</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code</label>
                    <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-6">Payment Method</h2>
              <div className="space-y-4">
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-[var(--color-primary)]" />
                  <div className="ml-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm"><Smartphone className="w-5 h-5 text-gray-600"/></div>
                    <div>
                      <span className="block font-bold text-gray-800">UPI / QR Code</span>
                      <span className="block text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/5">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-32">
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-2">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl relative overflow-hidden shrink-0 border border-gray-100">
                      <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-[var(--color-foreground)] line-clamp-1 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[var(--color-foreground)]">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({storeSettings.tax_rate || 5}% GST)</span>
                  <span className="font-bold text-gray-800">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                   <span className="flex flex-col">
                     <span>Shipping</span>
                     <span className="text-xs text-[var(--color-primary)] font-bold">{formData.state} Delivery</span>
                   </span>
                  <span className="font-bold text-gray-800">{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-6 mb-8">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-3xl font-serif font-bold text-[var(--color-primary)]">₹{total}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing} 
                className="w-full bg-[var(--color-primary)] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[var(--color-primary)]/20"
              >
                {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                {isProcessing ? 'Processing securely...' : `Pay ₹${total}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}