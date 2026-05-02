'use client';

import { useState, useEffect } from 'react';
import { Lock, LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if the user is already logged in when the page loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Attempt to log in with Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. The Login Screen (If NOT logged in)
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-center mb-8 text-foreground">Admin Access</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary outline-none" 
                placeholder="admin@lecdelights.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary outline-none" 
                placeholder="••••••••" 
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-[#7fae45] transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. The Secure Admin Dashboard (If logged in)
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold mb-2 text-foreground">Store Admin</h1>
            <p className="text-gray-500">Logged in securely as {session.user.email}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* The Full Master Dashboard Component replaces the simple form */}
        <AdminDashboard />
        
      </main>
    </div>
  );
}