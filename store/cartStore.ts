import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  removeItem: (id: string, variant?: string) => void; // Fixed to handle variants
  updateQuantity: (id: string, variant: string | undefined, quantity: number) => void;
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
          // Check for both ID and Variant match
          const existing = state.items.find(
            (i) => i.id === item.id && i.variant === item.variant
          );
          
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variant === item.variant 
                  ? { ...i, quantity: i.quantity + item.quantity } 
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
        
      removeItem: (id, variant) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.variant === variant)
          ),
        })),

      updateQuantity: (id, variant, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.variant === variant 
              ? { ...item, quantity: Math.max(1, quantity) } 
              : item
          ),
        })),
        
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'lec-delights-cart', // Unique key for LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);