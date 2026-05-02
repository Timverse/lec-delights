'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOG IN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        toast.success("Welcome back!");
        router.push('/account'); // Redirect to account page
        
      } else {
        // --- SIGN UP ---
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name }
          }
        });
        if (error) throw error;
        
        toast.success("Account created!", {
          description: "If required, please check your email to verify your account."
        });
        router.push('/account');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error("Authentication Failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pt-40 pb-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Enter your details to access your account.' : 'Join us to track your homemade treats.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required={!isLogin} type="text"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border outline-none focus:border-primary transition-all" 
                  placeholder="John Doe" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                required type="email"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border outline-none focus:border-primary transition-all" 
                placeholder="john@example.com" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                required type="password" minLength={6}
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border outline-none focus:border-primary transition-all" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            disabled={isLoading} type="submit" 
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-[#7fae45] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="font-bold text-primary hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

      </div>
    </div>
  );
}