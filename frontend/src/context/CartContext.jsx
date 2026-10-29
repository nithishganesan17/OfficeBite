import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCanonicalDish } from '../data/mockData';
import { useAuth } from './AuthContext';
import { getOrders } from '../services/api';
import { normalizeOrder, isOrderActive, filterCustomerActiveOrders } from '../utils/orderUtils';

export { normalizeOrder, isOrderActive, filterCustomerActiveOrders };

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('officebite_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => {
        const canonical = getCanonicalDish(item);
        if (canonical) {
          return {
            ...item,
            id: canonical.id,
            name: canonical.name,
            price: Number(canonical.price) || Number(item.price) || 0,
            image: canonical.image || item.image || item.imageUrl,
            category: canonical.categoryName || canonical.category || item.category,
            description: canonical.description || item.description || '',
          };
        }
        return item;
      });
    } catch {
      return [];
    }
  });

  // Orders state: default to empty array (never misleading mock count)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const isFetchingRef = useRef(false);

  // Clean up any stale legacy mock orders key from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('officebite_orders');
    } catch {
      // storage fallback
    }
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('officebite_cart', JSON.stringify(cartItems));
    } catch {
      // storage quota or private browsing fallback
    }
  }, [cartItems]);

  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      if (Array.isArray(data)) {
        setOrders(data.map(normalizeOrder));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Could not fetch customer orders from backend:', err);
      // On error, do not set misleading hardcoded data
      setOrders([]);
    } finally {
      setOrdersLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // Sync orders whenever authentication or user identity changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.email, refreshOrders]);

  // Listen to cross-component events (order created, status changed, tab focus)
  useEffect(() => {
    const handleOrderEvent = () => {
      if (isAuthenticated) {
        refreshOrders();
      }
    };

    window.addEventListener('officebite:order-status-updated', handleOrderEvent);
    window.addEventListener('officebite:order-created', handleOrderEvent);
    window.addEventListener('focus', handleOrderEvent);

    return () => {
      window.removeEventListener('officebite:order-status-updated', handleOrderEvent);
      window.removeEventListener('officebite:order-created', handleOrderEvent);
      window.removeEventListener('focus', handleOrderEvent);
    };
  }, [isAuthenticated, refreshOrders]);

  // Periodic 15-second background refresh for active order status progression
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      refreshOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshOrders]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (item) => {
    const canonical = getCanonicalDish(item);
    const resolvedId = canonical ? canonical.id : (item.id || item.menuItemId);
    const resolvedName = canonical ? canonical.name : item.name;
    const resolvedPrice = canonical ? Number(canonical.price) : (Number(item.price) || 0);
    const resolvedImage = canonical ? canonical.image : (item.image || item.imageUrl);
    const resolvedCategory = canonical ? (canonical.categoryName || canonical.category) : (item.category || 'General');
    const resolvedDescription = canonical?.description || item.description || '';
    const addQty = item.quantity && item.quantity > 0 ? item.quantity : 1;

    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === resolvedId);
      if (existing) {
        showToast(`Updated quantity of ${resolvedName} in your cart`);
        return prevItems.map((i) =>
          i.id === resolvedId ? { ...i, quantity: i.quantity + addQty } : i
        );
      }
      showToast(`Added ${resolvedName} to your cart`);
      return [
        ...prevItems,
        {
          id: resolvedId,
          name: resolvedName,
          price: resolvedPrice,
          image: resolvedImage,
          category: resolvedCategory,
          description: resolvedDescription,
          quantity: addQty,
        },
      ];
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    // Prevent quantities from falling below one.
    if (newQuantity < 1) {
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, Math.floor(newQuantity)) }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    // If the user removes the last item, allow the cart to become empty.
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.id === itemId);
      if (item) {
        showToast(`Removed ${item.name} from your cart`, 'info');
      }
      return prevItems.filter((i) => i.id !== itemId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    showToast('Cleared all items from your cart', 'info');
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  // Safe helper kept for orders history
  const placeOrder = ({ deliveryType = 'COUNTER_PICKUP', deliveryLocation = 'Floor 3 Canteen', specialInstructions = '' } = {}) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tokenLetter = 'A';
    const tokenNum = Math.floor(10 + Math.random() * 89);
    const orderSubtotal = cartItems.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );

    const newOrder = normalizeOrder({
      id: `OB-${randomNum}`,
      orderNumber: `OB-${randomNum}`,
      tokenNumber: `${tokenLetter}-${tokenNum}`,
      placedAt: 'Just now',
      status: 'PREPARING',
      statusLabel: 'Kitchen is Preparing',
      statusColor: 'emerald',
      deliveryType,
      deliveryLocation,
      estimatedMinutes: 15,
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      subtotal: orderSubtotal,
      totalAmount: orderSubtotal,
      specialInstructions: specialInstructions || 'Standard preparation',
      userId: currentUser?.id,
      customerEmail: currentUser?.email,
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    return newOrder;
  };

  // Count total units, not just distinct products.
  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  // Calculate subtotal and grand total correctly without invented fees/taxes.
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );
  const total = subtotal;
  const tax = 0;

  // Active orders strictly scoped to current authenticated customer
  const activeOrdersCount = useMemo(() => {
    return filterCustomerActiveOrders(orders, currentUser).length;
  }, [orders, currentUser]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        setOrders,
        refreshOrders,
        ordersLoading,
        activeOrdersCount,
        isOrderActive,
        normalizeOrder,
        filterCustomerActiveOrders,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        placeOrder,
        totalItemCount,
        subtotal,
        total,
        tax,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
