import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-0 relative bg-[var(--color-background)]">
      <CartDrawer />
      <Navbar />

      <main className="pt-32 px-6 max-w-4xl mx-auto mb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-[var(--color-foreground)]">Terms & Policies</h1>
          <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-500">Last updated: April 2026</p>
        </div>

        <div className="prose prose-lg text-gray-600 max-w-none space-y-12">
          
          {/* --- GENERAL TERMS --- */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Introduction:</h2>
              <p>Welcome to Lec Delights! These Terms and Conditions (“Terms”) govern your use of our website and the purchase of our artisan-crafted banana chips and snacks. By accessing and using our website, you agree to comply with these Terms and all applicable laws and regulations. Please read these Terms carefully before placing an order.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Product Information & Allergens:</h2>
              <p>We take pride in crafting our thin and crispy banana chips using chemical-free bananas, with absolutely no preservatives or artificial colors added. While we strive to provide accurate information about our double-sealed snacks, slight natural variations in chip size or color may occur. Please be aware that our products are processed in a facility that handles dairy (including our Cheddar Cheese and Sour Cream flavors), spices, and natural flavorings. Please review our ingredient lists carefully if you have severe food allergies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Orders and Payment:</h2>
              <p>To place an order, you must provide accurate and complete information during checkout. By submitting an order, you agree to pay the total amount specified, including any applicable taxes and shipping fees. Payments are securely processed through the provided payment methods on our website.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Order Acceptance and Refusal:</h2>
              <p>All orders placed are subject to acceptance by us. We reserve the right to refuse or cancel any order for any reason, including but not limited to:</p>
              <ul className="list-[lower-alpha] pl-6 space-y-2 mt-4 font-medium">
                <li>Suspected fraudulent activity or unauthorized reselling.</li>
                <li>Unavailability of the product or inventory constraints.</li>
                <li>Errors in product pricing or description.</li>
              </ul>
              <p className="mt-4">In the event we cancel your order, we will refund the full amount paid using the original payment method.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Intellectual Property:</h2>
              <p>All content on our website, including text, images, logos, and trademarks, is protected by intellectual property laws and is the property of Lec Delights. You may not use, reproduce, or distribute any content without our express written permission.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Limitation of Liability:</h2>
              <p>To the extent permitted by law, we shall not be liable for any indirect, consequential, or incidental damages arising from your use of our website or products. In no event shall our liability exceed the total amount paid for the specific product in question.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-foreground)] mb-3">Governing Law and Jurisdiction:</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Meghalaya, India.</p>
            </section>
          </div>

          <hr className="border-gray-200" />

          {/* --- SHIPPING POLICY --- */}
          <div id="shipping" className="space-y-8 scroll-mt-32">
            <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-6">Shipping Policy</h2>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Order Processing:</h3>
              <p>We want you snacking on Lec Delights as quickly as possible! All orders are freshly packed and processed within 1 to 2 business days (excluding weekends and public holidays). You will receive a notification with a tracking link once your order is dispatched.</p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Shipping Rates and Estimates:</h3>
              <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery times depend on your location within India, but typically range from 3 to 7 business days. Deliveries to remote areas may take slightly longer.</p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Local Delivery:</h3>
              <p>We offer specialized local delivery within select areas of Meghalaya. If your address falls within our local delivery zone, this expedited option will be automatically available to you at checkout.</p>
            </section>
          </div>

          <hr className="border-gray-200" />

          {/* --- RETURN & REFUND POLICY --- */}
          <div id="returns" className="space-y-8 scroll-mt-32">
            <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-6">Return and Refund Policy</h2>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700 font-bold">
                Strict No-Return Policy: Because our artisan-crafted banana chips are consumable food items, we strictly do not accept returns or exchanges for change of mind or personal taste preferences. 
              </p>
            </div>

            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Damaged or Defective Goods:</h3>
              <p>Your satisfaction is our priority. We will gladly offer a free replacement or a full refund ONLY if the product packaging arrives torn, crushed, unsealed, or if you receive the incorrect flavor or quantity.</p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">How to Claim a Refund:</h3>
              <p>If your order arrives damaged, please contact us within <strong>48 hours</strong> of delivery. Provide your Order ID and clear photographs of both the damaged product and the shipping box. Once verified, we will process your replacement or initiate a refund to your original payment method immediately.</p>
            </section>
          </div>

          <hr className="border-gray-200" />

          {/* --- PRIVACY POLICY --- */}
          <div id="privacy" className="space-y-8 scroll-mt-32">
            <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-6">Privacy Policy</h2>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Information We Collect:</h3>
              <p>We collect information from you when you register on our site, place an order, or subscribe to our newsletter. When ordering or registering on our site, you may be asked to enter your: name, e-mail address, mailing address, phone number, or payment information.</p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">How We Use Your Information:</h3>
              <p>Any of the information we collect from you may be used to personalize your experience, process transactions securely, ensure smooth deliveries, and send periodic emails regarding your order or new flavors.</p>
            </section>
            <section>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Information Protection:</h3>
              <p>We implement a variety of industry-standard security measures to maintain the safety of your personal information when you place an order or access your account.</p>
            </section>
          </div>

          {/* --- ACKNOWLEDGMENT --- */}
          <div className="pt-8 border-t border-gray-100 mt-12">
            <p className="font-medium text-gray-500 bg-white shadow-sm border border-gray-100 p-6 rounded-2xl">
              By using our website and placing an order, you acknowledge that you have read, understood, and agreed to these Terms and Policies. If you have any questions or concerns, please contact the Lec Delights customer support team for assistance.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}