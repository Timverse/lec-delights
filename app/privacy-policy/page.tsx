import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-0 relative bg-white">
      <CartDrawer />
      <Navbar />

      <main className="pt-32 px-6 max-w-4xl mx-auto mb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-[var(--color-foreground)]">Privacy Policy</h1>
          <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
        </div>

        <div className="prose prose-lg text-gray-600 max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Information We Collect:</h2>
            <p>We collect information from you when you register on our site, place an order, or subscribe to our newsletter. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, phone number, or credit card information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">How We Use Your Information:</h2>
            <p>Any of the information we collect from you may be used to personalize your experience, improve our website, process transactions, and send periodic emails regarding your order or other products and services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Information Protection:</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or access your personal information.</p>
          </section>
        </div>
      </main>
    </div>
  );
}