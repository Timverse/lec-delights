import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'sonner'; // Added for Toast Notifications

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap', 
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lec Delights | Premium Meghalaya Delicacies',
  description: 'Authentic home-style snacks and delicacies from the heart of Meghalaya.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We attach the font variables to the HTML tag so everything inside can use them
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans flex flex-col min-h-screen bg-[#fafaf9] text-gray-900 antialiased">
        
        {/* Toast notifications will float at the top center of every page */}
        <Toaster position="top-center" richColors closeButton />

        <CartDrawer />
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}