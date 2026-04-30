import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean; // This controls the drawer!
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      
      // Drawer Controls
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),

      // Cart Logic
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id && i.variant === item.variant);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variant === item.variant ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
        
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
        
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'garden-fresko-cart',
    }
  )
);