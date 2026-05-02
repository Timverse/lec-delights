'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Loader2, Truck, Smartphone, CheckCircle2, Lock, CreditCard, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { toast } from 'sonner';
import LoadingOverlay from '@/components/LoadingOverlay'; 

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Securing your treats...");
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

  // NEW: Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('online');

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

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxRate = (storeSettings?.tax_rate || 5) / 100;
  const taxAmount = Math.round(subtotal * taxRate);

  let shippingCost = 0;
  if (formData.state === 'Meghalaya') {
    shippingCost = storeSettings?.shipping_local || 50;
  } else if (['Assam', 'Manipur', 'Nagaland', 'Tripura', 'Mizoram', 'Arunachal Pradesh'].includes(formData.state)) {
    shippingCost = storeSettings?.shipping_regional || 80;
  } else {
    shippingCost = storeSettings?.shipping_national || 120;
  }

  const freeShippingLimit = storeSettings?.free_shipping_threshold || 1500;
  if (subtotal >= freeShippingLimit) {
    shippingCost = 0;
  }

  const total = subtotal + taxAmount + shippingCost;

  // UPDATED: Now receives the full savedOrder object
  const handlePayment = async (savedOrder: any) => {
    setLoadingMessage("Opening secure payment gateway...");

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      
      const order = await res.json();

      if (!order.id) throw new Error(order.error || "Order creation failed");

      // Hide overlay so Razorpay modal can be interacted with
      setIsProcessing(false);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "Lec Delights",
        description: `Order ID: ${savedOrder.id}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 1. Success! Update DB to Paid
          await supabase.from('orders').update({ status: 'Paid' }).eq('id', savedOrder.id);
          
          // 2. NOW we send the confirmation email (since payment succeeded)
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...savedOrder, status: 'Paid' }), // Pass updated status
            });
          } catch (e) {
            console.error("Email failed to send", e);
          }

          toast.success("Payment Received!", {
            description: "Your Meghalaya treats are being packed!",
            duration: 5000,
          });

          clearCart();
          setTimeout(() => router.push('/'), 2000); 
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#7fae45" },
        modal: {
          ondismiss: function() {
            // If they close the window, the order stays "Awaiting Payment" in DB
            // and we DO NOT clear the cart or send an email.
            setIsProcessing(false);
            toast.info("Payment Cancelled", {
              description: "Your order is saved. Try again when you're ready."
            });
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      toast.error("Payment Error", { description: err.message });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setLoadingMessage(paymentMethod === 'cod' ? "Confirming your order..." : "Drafting your order...");

    const { data: { user } } = await supabase.auth.getUser();

    const orderData = {
      user_id: user?.id || null, 
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
      // If COD, it goes straight to Processing. If online, we wait for payment.
      status: paymentMethod === 'cod' ? 'Processing' : 'Awaiting Payment'
    };

    const { data: savedOrder, error } = await supabase.from('orders').insert([orderData]).select().single();

    if (error) {
      setIsProcessing(false);
      toast.error("Database Error", { description: error.message });
      return;
    }

    if (paymentMethod === 'cod') {
      // --- COD FLOW ---
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedOrder),
        });
      } catch (e) {
        console.error("Email failed");
      }
      
      toast.success("Order Confirmed!", { description: "We will collect payment on delivery." });
      clearCart();
      router.push('/');
    } else {
      // --- ONLINE FLOW ---
      // We pass the saved order to handlePayment, which will handle the email on success
      await handlePayment(savedOrder);
    }
  };

  if (!mounted || !storeSettings) return (
    <div className="min-h-screen bg-[#fafaf9] pt-40 pb-24 flex justify-center">
      <Loader2 className="animate-spin text-[var(--color-primary)] w-10 h-10" />
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] pt-40 pb-24 px-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Truck className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Your snack bag is empty</h1>
        <Link href="/products" className="bg-[var(--color-primary)] text-white px-10 py-4 rounded-full font-bold shadow-lg">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <>
      {isProcessing && <LoadingOverlay message={loadingMessage} />}

      <div className="bg-[#fafaf9] min-h-screen pt-32 pb-24 px-6">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        
        <div className="max-w-7xl mx-auto">
          <Link href="/products" className="flex items-center gap-2 text-gray-500 font-bold mb-10 uppercase text-xs tracking-widest hover:text-[var(--color-primary)]">
            <ChevronLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-3/5 space-y-8">
              
              {/* Checkout Form */}
              <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-[var(--color-primary)]" />
                   </div>
                   <h2 className="text-3xl font-serif font-bold">Delivery Details</h2>
                </div>

                <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" placeholder="Doe" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Address</label>
                    <input required name="address" value={formData.address} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" placeholder="House No, Street, Landmark" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">City</label>
                    <input required name="city" value={formData.city} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">State</label>
                    <select name="state" value={formData.state} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)] cursor-pointer">
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Assam">Assam</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Pincode</label>
                    <input required name="pincode" value={formData.pincode} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)]" placeholder="793XXX" />
                  </div>
                </form>

                {/* NEW: Payment Method Selector */}
                <div className="mt-10 pt-10 border-t border-gray-100">
                  <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <label className={`border rounded-2xl p-5 cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === 'online' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="hidden" />
                      <CreditCard className={paymentMethod === 'online' ? 'text-[var(--color-primary)]' : 'text-gray-400'} />
                      <span className="font-bold">Pay Online</span>
                    </label>

                    <label className={`border rounded-2xl p-5 cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === 'cod' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                      <Banknote className={paymentMethod === 'cod' ? 'text-[var(--color-primary)]' : 'text-gray-400'} />
                      <span className="font-bold">Cash on Delivery</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <CheckCircle2 className="text-[var(--color-primary)] w-6 h-6 shrink-0" />
                    <span className="text-sm font-bold text-gray-600">Homemade Quality</span>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <Lock className="text-[var(--color-primary)] w-6 h-6 shrink-0" />
                    <span className="text-sm font-bold text-gray-600">Secure Checkout</span>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <ShieldCheck className="text-[var(--color-primary)] w-6 h-6 shrink-0" />
                    <span className="text-sm font-bold text-gray-600">Safe Delivery</span>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-2/5">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-32">
                <h2 className="text-2xl font-serif font-bold mb-8">Order Summary</h2>
                <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{item.name}</span>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-dashed pt-6 space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax ({storeSettings?.tax_rate}% GST)</span>
                    <span className="text-gray-900 font-bold">₹{taxAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="text-[var(--color-primary)] font-bold">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-8 pt-8 flex justify-between items-center mb-10">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-4xl font-serif font-bold text-[var(--color-primary)]">₹{total}</span>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full bg-[var(--color-primary)] text-white py-6 rounded-2xl font-bold text-xl shadow-xl shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  {isProcessing ? 'Processing...' : (paymentMethod === 'cod' ? 'Complete Order' : `Secure Pay ₹${total}`)}
                </button>
                
                {paymentMethod === 'online' && (
                  <p className="text-center text-xs text-gray-400 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Smartphone className="w-3 h-3" /> UPI / Cards / NetBanking
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}