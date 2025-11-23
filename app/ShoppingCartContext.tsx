import React, { createContext, ReactNode, useContext, useRef, useState } from 'react';
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  release_date: string;
}

export interface BookingItem {
  id: string;
  movie: Movie;
  showtime: string;
  seats: string[];
  total: number;
  cinema: string;
}

interface ShoppingCartContextType {
  cart: BookingItem[];
  addToCart: (item: BookingItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const ShoppingCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<BookingItem[]>([]);
  const cartRef = useRef(cart);
  
  // Update ref when cart changes
  React.useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const addToCart = (item: BookingItem) => {
    console.log('BEFORE - Cart:', cart);
    console.log('BEFORE - CartRef:', cartRef.current);
    
    setCart(prev => {
      const newCart = [...prev, item];
      console.log('DURING - New cart:', newCart);
      return newCart;
    });
    
    // Check after state update
    setTimeout(() => {
      console.log('AFTER - Cart:', cart);
      console.log('AFTER - CartRef:', cartRef.current);
    }, 100);
  };


  const removeFromCart = (id: string) => {
    console.log('Removing from cart:', id);
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== id);
      console.log('New cart after removal:', newCart);
      return newCart;
    });
  };


  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.seats.length, 0);
  };

  return (
    <ShoppingCartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartItemCount
    }}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};