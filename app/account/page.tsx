'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Package, User, LogOut, Loader2, ChevronRight, ShoppingBag, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Use environment variables for security, with your keys as fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MyAccount() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Auth Form State
  const [name, setName] = useState(''); // NEW: Added Name field for Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchOrders(session.user.id);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchOrders(session.user.id);
      else setOrders([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: name } } // Save their name during signup!
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Authentication Failed", { description: error.message });
    } else {
      toast.success(isSignUp ? "Account created!" : "Welcome back!");
      // Clear form on success
      if (isSignUp) {
         setName('');
         setEmail('');
         setPassword('');
      }
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
    } else {
      toast.info("Signed out successfully");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-6xl mx-auto w-full">
        {!session ? (
          /* --- LOGIN / SIGNUP VIEW --- */
          <div className="max-w-md mx-auto bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
                {isSignUp ? 'Join the Delights' : 'Welcome Back'}
              </h1>
              <p className="text-gray-400 font-sans">
                {isSignUp ? 'Start your artisan snack journey today.' : 'Sign in to track your Meghalaya treats.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              
              {/* Show Name field only if signing up */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)] transition-all" 
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)] transition-all" 
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none text-base outline-none focus:ring-2 ring-[var(--color-primary)] transition-all" 
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              
              <button 
                disabled={isAuthLoading}
                className="w-full bg-[var(--color-primary)] text-white py-5 rounded-2xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-[var(--color-primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isAuthLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-8 text-sm font-bold text-gray-400 hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest"
            >
              {isSignUp ? 'Already have an account? Sign In' : "New here? Create an account"}
            </button>
          </div>
        ) : (
          /* --- LOGGED IN DASHBOARD --- */
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-[2rem] flex items-center justify-center shrink-0">
                  <User className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
                <div>
                  {/* Greeting the user by their name if they set it during signup */}
                  <h1 className="text-3xl font-serif font-bold text-gray-900 truncate">
                    Welcome, {session.user.user_metadata?.full_name?.split(' ')[0] || 'Guest'}!
                  </h1>
                  <p className="text-gray-400 font-medium">{session.user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-8 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <h2 className="text-2xl font-serif font-bold flex items-center gap-3 px-2">
                  <Package className="w-6 h-6 text-[var(--color-primary)]" />
                  Your Order History
                </h2>

                {orders.length === 0 ? (
                  <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <ShoppingBag className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-serif text-xl italic mb-8">No snacks on your list yet...</p>
                    <Link href="/products" className="inline-block bg-[var(--color-primary)] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 transition-all">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Link 
                        key={order.id} 
                        href={`/order-status/${order.id}`}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between hover:shadow-2xl hover:shadow-gray-200/50 transition-all group"
                      >
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">#{order.id.slice(0, 8)}</p>
                          <p className="font-bold text-2xl text-gray-900">₹{order.total}</p>
                          <p className="text-sm text-gray-400 font-medium">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {order.status}
                          </span>
                          <div className="hidden sm:flex w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm space-y-8">
                  <h3 className="font-serif font-bold text-xl">Account Info</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Member Since</p>
                      <p className="font-bold text-gray-700">{new Date(session.user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Support</p>
                      <Link href="/contact" className="text-[var(--color-primary)] font-bold hover:underline">Help with an order</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}