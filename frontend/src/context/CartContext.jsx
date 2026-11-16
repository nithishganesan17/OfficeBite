import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCanonicalDish } from '../data/mockData';
import { useAuth } from './AuthContext';
import { getOrders, getInstantOrders, saveStoredPlacedOrder } from '../services/api';
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

  // Orders state initialized synchronously from instant storage (zero-latency load)
  const [orders, setOrders] = useState(() => {
    try {
      return getInstantOrders().map(normalizeOrder);
    } catch {
      return [];
    }
  });
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
    try {
      const data = await getOrders();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data.map(normalizeOrder));
      } else {
        setOrders(getInstantOrders().map(normalizeOrder));
      }
    } catch (err) {
      console.warn('Backend orders sync note (using instant local orders):', err.message || err);
      setOrders(getInstantOrders().map(normalizeOrder));
    } finally {
      setOrdersLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // Sync orders whenever authentication or user identity changes
  useEffect(() => {
    if (isAuthenticated) {
      setOrders(getInstantOrders().map(normalizeOrder));
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.email, refreshOrders]);

  // Real-time synchronization across browser tabs and components
  useEffect(() => {
    const handleOrderEvent = () => {
      setOrders(getInstantOrders().map(normalizeOrder));
      if (isAuthenticated) {
        refreshOrders();
      }
    };

    window.addEventListener('officebite:order-status-updated', handleOrderEvent);
    window.addEventListener('officebite:order-created', handleOrderEvent);
    window.addEventListener('storage', handleOrderEvent);
    window.addEventListener('focus', handleOrderEvent);

    let channel = null;
    try {
      channel = new BroadcastChannel('officebite_sync');
      channel.onmessage = () => handleOrderEvent();
    } catch {}

    return () => {
      window.removeEventListener('officebite:order-status-updated', handleOrderEvent);
      window.removeEventListener('officebite:order-created', handleOrderEvent);
      window.removeEventListener('storage', handleOrderEvent);
      window.removeEventListener('focus', handleOrderEvent);
      if (channel) channel.close();
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

  // Safe helper kept for orders placement & history
  const placeOrder = ({ deliveryType = 'CANTEEN_PICKUP', deliveryLocation = 'Floor 3 Canteen Live Counter', specialInstructions = '' } = {}) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tokenLetter = 'A';
    const tokenNum = Math.floor(10 + Math.random() * 89);
    const orderSubtotal = cartItems.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );

    const orderNum = `OB-${randomNum}`;
    const tokenStr = `${tokenLetter}-${tokenNum}`;

    const newOrder = normalizeOrder({
      id: orderNum,
      orderNumber: orderNum,
      tokenNumber: tokenStr,
      pickupToken: tokenStr,
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PLACED',
      statusLabel: 'Placed',
      deliveryType,
      deliveryLocation,
      estimatedMinutes: 15,
      items: cartItems.map((item) => ({
        id: item.id || item.menuItemId,
        menuItemId: item.id || item.menuItemId,
        name: item.name,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price,
        image: item.image,
        imageUrl: item.image,
      })),
      subtotal: orderSubtotal,
      totalAmount: orderSubtotal,
      specialInstructions: specialInstructions || 'Standard preparation',
      userId: currentUser?.id,
      customerEmail: currentUser?.email || 'srikanth@gmail.com',
      customerName: currentUser?.name || 'Srikanth',
      employeeId: currentUser?.employeeId || 'OB-1710',
      createdAt: new Date().toISOString(),
    });

    saveStoredPlacedOrder(newOrder);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('officebite:order-created', { detail: newOrder }));
      try {
        localStorage.setItem(
          'officebite_sync_event',
          JSON.stringify({ type: 'ORDER_CREATED', time: Date.now(), order: newOrder })
        );
        const bc = new BroadcastChannel('officebite_sync');
        bc.postMessage({ type: 'ORDER_CREATED', order: newOrder });
        bc.close();
      } catch {}
    }

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
