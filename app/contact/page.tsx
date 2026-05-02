'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Send the actual data to Supabase (Database Backup)
      const { error } = await supabase.from('contact_messages').insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }
      ]);

      if (error) throw error;

      // 2. Ping the API route to trigger the Resend email notification
      await fetch('/api/contact-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // 3. Show success state and clear form
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '', consent: false });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);

    } catch (error: any) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later or email us directly.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[var(--color-foreground)] mb-4">
            Get In Touch
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Please fill out the form below or reach out to us directly using our contact details.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Contact Information */}
          <div className="w-full lg:w-1/3 space-y-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-foreground)] mb-1">Phone</h3>
                  <p className="text-gray-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                    +91 70057 52278
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-foreground)] mb-1">Email</h3>
                  <p className="text-gray-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                    lecdelights@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-foreground)] mb-1">Office</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Lec Delights,<br />
                    Mission Compound<br />
                    West Jaintia Hills, Jowai<br />
                    Meghalaya - 793150
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: The Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden">
              
              {isSuccess ? (
                <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-500">Thank you for reaching out. We will get back to you as soon as possible.</p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" 
                      placeholder="John" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all" 
                      placeholder="+91 00000 00000" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Inquiry <span className="text-red-500">*</span></label>
                  <textarea 
                    name="message" required rows={5} value={formData.message} onChange={handleChange}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-[var(--color-primary)] transition-all resize-none" 
                    placeholder="How can we help you today?" 
                  />
                  <div className="text-right mt-1 text-xs text-gray-400 font-medium">
                    {formData.message.length} characters
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" name="consent" id="consent" required checked={formData.consent} onChange={handleChange}
                    className="mt-1 w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded cursor-pointer" 
                  />
                  <label htmlFor="consent" className="text-sm text-gray-500 cursor-pointer">
                    I consent to Lec Delights storing my submitted information so they can respond to my inquiry. <span className="text-red-500">*</span>
                  </label>
                </div>

                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="w-full bg-[var(--color-primary)] text-white py-4 rounded-2xl font-bold hover:bg-[#7fae45] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[var(--color-primary)]/20 active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}