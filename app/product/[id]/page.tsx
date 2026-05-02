'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Minus, Plus, Loader2, AlertCircle } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductReviews from '@/components/ProductReviews'; // NEW: Imported the Reviews component

export default function ProductPage() {
  const params = useParams(); 
  const productId = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive States
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error("Error finding product:", error.message);
      }

      if (data) {
        setProduct(data);
        setActiveImage(data.image_urls?.[0] || '/placeholder.png');
        
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] pt-32 pb-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafaf9] pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">We couldn't find the product you're looking for.</p>
        <Link href="/products" className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold">Back to Shop</Link>
      </div>
    );
  }

  // --- ADVANCED PRICING LOGIC ---
  
  // 1. Calculate the global discount percentage from the main product
  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : 0;

  // 2. Apply that exact discount to whatever variant is selected
  let currentPrice = product.price;
  let currentOldPrice = product.old_price;

  if (selectedVariant) {
    currentOldPrice = selectedVariant.price;
    currentPrice = hasDiscount 
      ? Math.round(selectedVariant.price * (1 - (discountPercent / 100))) 
      : selectedVariant.price;
  }

  // Stock status
  const stock = product.stock !== undefined ? product.stock : 100;
  const isOutOfStock = stock === 0;

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Back Link */}
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-bold text-sm mb-8 transition-colors uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>

        {/* MAIN PRODUCT DETAILS BOX */}
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="relative aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100">
              {discountPercent > 0 && (
                <span className="absolute top-6 right-6 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider z-10 shadow-lg shadow-red-500/20">
                  Save {discountPercent}%
                </span>
              )}
              <Image src={activeImage} alt={product.name} fill unoptimized className="object-cover" />
            </div>
            
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.image_urls.map((url: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(url)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === url ? 'border-[var(--color-primary)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={url} alt="" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Controls */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            
            {/* Title & Category */}
            <div className="mb-6">
              {product.category && (
                <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2 block">
                  {product.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-foreground)] leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-4">
                <span className="text-3xl font-bold text-[var(--color-foreground)]">₹{currentPrice}</span>
                {currentOldPrice && hasDiscount && (
                  <span className="text-xl text-gray-400 line-through font-medium mb-1">₹{currentOldPrice}</span>
                )}
              </div>

              {/* Stock Warnings */}
              {stock < 5 && stock > 0 && (
                <p className="text-orange-500 font-bold text-sm mt-3 flex items-center gap-1.5 bg-orange-50 w-fit px-3 py-1 rounded-full border border-orange-100">
                  <AlertCircle className="w-4 h-4" /> Only {stock} left in stock - order soon!
                </p>
              )}
              {isOutOfStock && (
                <p className="text-red-500 font-bold text-sm mt-3 flex items-center gap-1.5 bg-red-50 w-fit px-3 py-1 rounded-full border border-red-100">
                  <AlertCircle className="w-4 h-4" /> Out of Stock
                </p>
              )}
            </div>

            <div className="w-full h-px bg-gray-100 my-8"></div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Select Size / Variant</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                        selectedVariant?.label === variant.label
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                          : 'border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart Row */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              
              {/* Quantity Counter (Disabled if out of stock) */}
              <div className={`flex items-center justify-between bg-gray-50 p-2 rounded-full border border-gray-100 w-full sm:w-40 shrink-0 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button Component */}
              <div className="flex-grow">
                {isOutOfStock ? (
                  <button disabled className="w-full bg-gray-200 text-gray-500 py-4 rounded-full font-bold uppercase tracking-wider cursor-not-allowed">
                    Out of Stock
                  </button>
                ) : (
                  <AddToCartButton 
                    product={product} 
                    selectedVariant={selectedVariant} 
                    quantity={quantity} 
                    finalPrice={currentPrice}
                  />
                )}
              </div>

            </div>
          </div>
        </div>
        {/* END MAIN PRODUCT DETAILS BOX */}

        {/* REVIEWS SECTION */}
        <ProductReviews productId={product.id} />

      </div>
    </div>
  );
}