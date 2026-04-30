export const metadata = {
  title: 'Shipping Policy | Lec Delights',
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-serif font-black text-[var(--color-foreground)] mb-6">Shipping Policy</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            We want you snacking on <strong className="text-[var(--color-foreground)]">Lec Delights</strong> as quickly as possible! Here is how we handle shipping and deliveries across India.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-foreground)] mt-8">Processing & Dispatch</h2>
          <p>
            All orders are freshly packed and handed over to our courier partners within 1 to 2 business days. We do not ship on Sundays or public holidays.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-foreground)] mt-8">Delivery Timelines</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Metro Cities:</strong> 3 to 5 business days.</li>
            <li><strong>Rest of India:</strong> 5 to 7 business days.</li>
            <li><strong>Remote Areas / North East:</strong> May take up to 10 business days depending on the courier network.</li>
          </ul>

          <h2 className="text-xl font-bold text-[var(--color-foreground)] mt-8">Tracking Your Order</h2>
          <p>
            The moment your order is dispatched, you will receive an automated email containing your tracking number and a link to follow your package's journey right to your doorstep.
          </p>
        </div>
      </div>
    </div>
  );
}