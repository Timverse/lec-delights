export const metadata = {
  title: 'Return Policy | Lec Delights',
};

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-serif font-black text-[var(--color-foreground)] mb-6">Return & Refund Policy</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>
            At <strong className="text-[var(--color-foreground)]">Lec Delights</strong>, we take great pride in the quality and crispness of our packaged banana chips. Because we sell consumable food products, we must adhere to strict health, safety, and hygiene standards.
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
            <p className="text-red-700 font-bold">
              Strict No-Return Policy: We do not accept returns or exchanges for change of mind or personal taste preferences. Returns are ONLY accepted if the product arrives damaged or defective.
            </p>
          </div>

          <h2 className="text-xl font-bold text-[var(--color-foreground)] mt-8">Damaged or Defective Goods</h2>
          <p>
            We will gladly offer a free replacement or a full refund if:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The product packaging arrives torn, crushed, or unsealed.</li>
            <li>You receive the incorrect flavor or quantity.</li>
          </ul>

          <h2 className="text-xl font-bold text-[var(--color-foreground)] mt-8">How to Claim</h2>
          <p>
            If your order arrives damaged, please contact us within <strong>48 hours</strong> of delivery. Provide your Order ID and clear photographs of both the damaged product and the shipping box. Once verified, we will process your replacement or refund immediately.
          </p>
        </div>
      </div>
    </div>
  );
}