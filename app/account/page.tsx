'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Package, User, LogOut, Loader2, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link'; // This was the missing line!
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const supabase = createClient('https://vyqwkijpuehlqwkspdwc.supabase.co', 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo');

export default function MyAccount() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

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
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async (userId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setAuthError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOrders([]);
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-40 pb-24 px-6 max-w-6xl mx-auto w-full">
        {!session ? (
          /* --- LOGIN / SIGNUP VIEW --- */
          <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <h1 className="text-3xl font-serif font-bold text-center mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-center mb-8">
              {isSignUp ? 'Create an account to track orders' : 'Sign in to manage your account'}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[var(--color-primary)] outline-none transition-all" 
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[var(--color-primary)] outline-none transition-all" 
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {authError && <p className="text-red-500 text-sm font-medium text-center">{authError}</p>}

              <button className="w-full bg-[var(--color-primary)] text-white py-4 rounded-2xl font-bold hover:bg-[#7fae45] transition-all shadow-lg shadow-[var(--color-primary)]/20">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-[var(--color-primary)] transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        ) : (
          /* --- LOGGED IN DASHBOARD --- */
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-[var(--color-foreground)] mb-2">My Account</h1>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <User className="w-4 h-4" />
                  {session.user.email}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Recent Orders List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-6 h-6 text-[var(--color-primary)]" />
                  <h2 className="text-2xl font-serif font-bold">Order History</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-gray-200">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium mb-6">You haven't placed any orders yet.</p>
                    <Link href="/products" className="text-[var(--color-primary)] font-bold hover:underline">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between hover:shadow-lg hover:shadow-gray-200/40 transition-all cursor-pointer group">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID: #{order.id.slice(0, 8)}</p>
                          <p className="font-bold text-lg">₹{order.total_amount}</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {order.status}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Settings / Sidebar */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 space-y-6">
                  <h3 className="font-serif font-bold text-xl">Account Details</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Email</p>
                      <p className="font-medium text-gray-700">{session.user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Joined</p>
                      <p className="font-medium text-gray-700">{new Date(session.user.created_at).toLocaleDateString()}</p>
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