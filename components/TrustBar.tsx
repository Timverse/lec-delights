'use client';

import { ShieldCheck, Truck, Utensils, Award } from 'lucide-react';

const trustItems = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Secure Checkout",
    description: "Razorpay Protected UPI & Card Payments"
  },
  {
    icon: <Truck className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Pan-India Shipping",
    description: "Freshly packed and delivered to your doorstep"
  },
  {
    icon: <Utensils className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "100% Homemade",
    description: "Traditional recipes from Jowai, Meghalaya"
  },
  {
    icon: <Award className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Zero Preservatives",
    description: "Natural ingredients, no hidden chemicals"
  }
];

export default function TrustBar() {
  return (
    <section className="bg-white py-16 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center space-y-4 group"
            >
              <div className="w-16 h-16 bg-[#fafaf9] rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--color-primary)]/10">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}