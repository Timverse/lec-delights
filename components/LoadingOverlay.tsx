import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl font-bold font-serif text-gray-900">{message}</p>
    </div>
  );
}