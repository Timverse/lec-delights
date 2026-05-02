import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative">
        {/* Glow effect matching brand colors */}
        <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full blur-2xl animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin relative z-10" />
      </div>
      <p className="mt-6 font-serif font-bold text-xl text-gray-900 animate-pulse">
        {message}
      </p>
    </div>
  );
}