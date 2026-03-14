import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { connectSocket, disconnectSocket, emitPageChange } from '@/lib/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Customer login/register
      customerAuth: async (name, phone) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.customerAuth(name, phone);
          
          // Validate user data
          if (!data.user || !data.user.id) {
            throw new Error('Invalid user data from server');
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Connect socket with validated user data
          connectSocket(data.user.id, data.user.role || 'customer', window.location.pathname);

          return data;
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Authentication failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Staff login
      staffLogin: async (phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.staffLogin(phone, password);
          
          // Validate user data
          if (!data.user || !data.user.id) {
            throw new Error('Invalid user data from server');
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Connect socket with validated user data
          connectSocket(data.user.id, data.user.role, window.location.pathname);

          return data;
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        disconnectSocket();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Update user
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
        localStorage.setItem('user', JSON.stringify(get().user));
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Change page (for socket tracking)
      changePage: (page) => {
        const { user } = get();
        if (user) {
          emitPageChange(user.id, page);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Cart store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'takeaway',
      notes: '',
      voucherCode: null,
      loyaltyPointsUsed: 0,

      // Add item to cart
      addItem: (product, customization = {}) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product_id === product.id &&
              JSON.stringify(item.customizations) === JSON.stringify(customization)
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1,
                customizations: customization,
                notes: '',
              },
            ],
          };
        });
      },

      // Remove item from cart
      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      // Update item quantity
      updateQuantity: (index, quantity) => {
        if (quantity <= 0) {
          get().removeItem(index);
          return;
        }
        set((state) => {
          const newItems = [...state.items];
          newItems[index].quantity = quantity;
          return { items: newItems };
        });
      },

      // Clear cart
      clearCart: () => {
        set({
          items: [],
          notes: '',
          voucherCode: null,
          loyaltyPointsUsed: 0,
        });
      },

      // Set order type
      setOrderType: (type) => set({ orderType: type }),

      // Set notes
      setNotes: (notes) => set({ notes }),

      // Set voucher
      setVoucherCode: (code) => set({ voucherCode: code }),

      // Set loyalty points
      setLoyaltyPointsUsed: (points) => set({ loyaltyPointsUsed: points }),

      // Calculate subtotal
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      // Get total items count
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// App settings store
export const useAppStore = create((set) => ({
  darkMode: false,
  isOnline: navigator.onLine,
  pushEnabled: false,

  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.darkMode;
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: newDarkMode };
    });
  },

  setOnline: (isOnline) => set({ isOnline }),
  setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
}));
