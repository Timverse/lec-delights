'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroImage {
  id: string;
  image_url: string;
}

export default function HeroSlider({ images }: { images: HeroImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play the slider every 5 seconds
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [images]);

  // If there are no images uploaded yet, show a clean, pulsing placeholder circle
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 rounded-full animate-pulse border-8 border-gray-100/50 shadow-inner flex items-center justify-center">
        <span className="text-gray-300 font-medium">Add images in Admin Dashboard</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-[12px] border-white/50 bg-white">
      {images.map((img, index) => (
        <Image
          key={img.id}
          src={img.image_url}
          alt="Lec Delights Highlight"
          fill
          priority={index === 0} // Load the first image immediately
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}