import Link from 'next/link';

export const metadata = {
  title: 'About Us | Lec Delights',
  description: 'Discover the story behind Lec Delights and our artisan-crafted, flavorful banana chips.',
};

export default function AboutPage() {
  return (
    // Added top padding (pt-32) so it doesn't hide behind your fixed gold navbar!
    <div className="min-h-screen bg-[var(--color-background)] pt-36 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[var(--color-foreground)] mb-6 leading-tight">
             Tradition Meets <span className="text-[var(--color-primary)]">Bold Flavor</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            At <strong className="text-[var(--color-foreground)]">Lec Delights</strong>, we believe snacking should be an adventure. We have taken the beloved, traditional crunch of homemade banana chips and elevated them with a delightful fusion of natural sweetness and bold, savory goodness. Artisan-crafted in small batches, our chips are the perfect crunchy escape for anyone craving a unique twist on a classic favorite.
          </p>
        </div>

        {/* Flavors Grid Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-serif font-bold text-center text-[var(--color-foreground)] mb-12">
            Our Signature Flavors
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Flavor 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-3xl mb-6">
                🧅
              </div>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3">Onion & Sour Cream</h3>
              <p className="text-gray-600 leading-relaxed">
                Savor the perfect harmony of zesty onions and rich, creamy goodness. We pair the subtle sweetness of raw green bananas with a tangy, savory finish that is incredibly indulgent and deeply satisfying.
              </p>
            </div>

            {/* Flavor 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-3xl mb-6">
                🧀
              </div>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3">Cheddar Cheese</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience a symphony of cheesy perfection. We have dusted our crispy, golden banana chips with the bold, rich taste of premium cheddar, creating a snack that is irresistibly crunchy and utterly addictive.
              </p>
            </div>

            {/* Flavor 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-3xl mb-6">
                🔥
              </div>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3">Smoky Barbeque</h3>
              <p className="text-gray-600 leading-relaxed">
                Craving a hint of smoke and spice? Our Barbeque chips deliver a flawless balance of smoky, savory seasoning that perfectly enhances the natural sweetness of the banana. It is a flavor-packed adventure!
              </p>
            </div>
          </div>
        </div>

        {/* Quality Promise Section */}
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-gray-100 mb-20 text-center">
          <div className="text-4xl mb-6">🌿</div>
          <h2 className="text-3xl font-serif font-bold text-[var(--color-foreground)] mb-6">
            Quality Ingredients, Homemade Goodness
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We take immense pride in what goes into our bags. Lec Delights uses only the finest, high-quality ingredients to create our signature chips. Made with care, passion, and an absolute attention to detail, our chips are handcrafted to perfection to ensure every bite is exactly as it should be—flawless.
          </p>
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">
            The Perfect Snack for Any Occasion
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Whether you are entertaining guests, grabbing a quick bite on the go, or simply treating yourself after a long day, Lec Delights delivers a burst of joy in every crunch.
          </p>
          <Link 
            href="/products" 
            className="inline-block bg-[var(--color-primary)] text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Shop the Flavors Now
          </Link>
        </div>

      </div>
    </div>
  );
}