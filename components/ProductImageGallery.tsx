'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react'; // Magnifying glass icon

// Define the shape of the props for this component
interface ProductImageGalleryProps {
  image_urls: string[]; // This is a list of image URLs
  name: string;         // Name of the product for alt text
  has_old_price: boolean; // For the Sale! badge
}

export default function ProductImageGallery({
  image_urls,
  name,
  has_old_price,
}: ProductImageGalleryProps) {
  
  // Set the first image from the array as the initial selected image
  // Fallback to a placeholder if the array is empty.
  const [selectedImage, setSelectedImage] = useState<string>(
    (image_urls && image_urls.length > 0) ? image_urls[0] : '/placeholder.png'
  );

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Main Large Image Section */}
      <div className="relative w-full aspect-square bg-[var(--color-background)] rounded-[3rem] flex items-center justify-center p-12 border border-gray-100 overflow-hidden">
        
        {/* Sale! Badge from reference image */}
        {has_old_price && (
          <span className="absolute top-8 left-8 bg-[#8dc04c] text-white text-base font-medium px-6 py-4 rounded-full shadow-md z-10 font-sans">
            Sale!
          </span>
        )}

        {/* Magnifying Glass Zoom Icon from reference image */}
        <button className="absolute top-8 right-8 bg-white/80 hover:bg-white text-gray-800 p-4 rounded-full shadow-lg z-10 transition-colors">
          <Search className="w-6 h-6" />
        </button>

        {/* The current main image */}
        <div className="relative w-full h-full">
          <Image
            src={selectedImage}
            alt={`${name} main image`}
            fill
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
            priority // Load this image as soon as possible
          />
        </div>
      </div>

      {/* 2. Horizontal Thumbnail Row from reference image */}
      {image_urls && image_urls.length > 1 && (
        <div className="grid grid-cols-4 gap-6 px-1">
          {image_urls.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(imageUrl)} // Set this as main image when clicked
              className={`relative aspect-square bg-[var(--color-background)] rounded-3xl overflow-hidden border-4 transition-all duration-300 ${
                selectedImage === imageUrl
                  ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10 shadow-xl' // Selected state
                  : 'border-white hover:border-gray-100' // Non-selected state
              }`}
            >
              <Image
                src={imageUrl}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className="object-contain p-2" // Smaller pading for thumbnails
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}