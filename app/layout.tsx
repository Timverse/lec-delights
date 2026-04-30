import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Lec Delights',
  description: 'A one-stop for the delicacies of Meghalaya!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Added explicit background, text color, and antialiasing for a premium feel */}
      <body className={`${inter.variable} ${playfair.variable} font-sans flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased`}>
        
        {/* These elements will appear once on every single page automatically */}
        <CartDrawer />
        <Navbar />
        
        {/* This is  the individual page content goes */}
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}