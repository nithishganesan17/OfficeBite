import { getCanonicalDish } from '../data/mockData.js';

/**
 * Normalizes an order from backend REST response or local session
 */
export const normalizeOrder = (ord) => {
  if (!ord) return null;
  return {
    id: ord.orderNumber || ord.id,
    orderNumber: ord.orderNumber || ord.id,
    tokenNumber: ord.tokenNumber || 'A-01',
    placedAt: ord.createdAt
      ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : ord.placedAt || 'Recently',
    status: ord.status || 'PLACED',
    statusLabel: ord.statusLabel || ord.status,
    deliveryType: ord.deliveryType || 'CANTEEN_PICKUP',
    deliveryLocation: ord.deliveryLocation || 'Floor 3 Canteen Live Counter',
    items: ord.items?.map((i) => {
      const canonical = getCanonicalDish ? getCanonicalDish(i) : null;
      return {
        id: canonical?.id || i.menuItemId || i.id,
        menuItemId: canonical?.id || i.menuItemId || i.id,
        name: canonical?.name || i.itemName || i.name,
        quantity: i.quantity,
        price: i.unitPrice !== undefined ? i.unitPrice : (canonical?.price ?? i.price),
        image: canonical?.image || i.imageUrl || i.image,
      };
    }) || [],
    subtotal: ord.subtotal || ord.totalAmount || 0,
    total: ord.totalAmount || ord.total || ord.subtotal || 0,
    specialInstructions: ord.specialInstructions,
    isRealBackend: Boolean(ord.orderNumber && ord.createdAt),
    userId: ord.userId,
    customerEmail: ord.customerEmail,
    createdAt: ord.createdAt,
  };
};

/**
 * Determines whether an order is in an active customer state.
 * Active: PLACED, ACCEPTED, PREPARING, READY
 * Inactive: COMPLETED, DELIVERED, REJECTED, CANCELLED, CANCELED
 */
export const isOrderActive = (order) => {
  if (!order || !order.status) return false;
  const status = String(order.status).toUpperCase().trim();
  const inactiveStatuses = ['COMPLETED', 'DELIVERED', 'REJECTED', 'CANCELLED', 'CANCELED'];
  if (inactiveStatuses.includes(status)) {
    return false;
  }
  const activeStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'];
  return activeStatuses.includes(status);
};

/**
 * Filters orders to return only active orders scoped to a given customer.
 */
export const filterCustomerActiveOrders = (orders = [], currentUser = null) => {
  if (!Array.isArray(orders)) return [];
  return orders.filter((o) => {
    if (!isOrderActive(o)) return false;
    if (currentUser?.id && o.userId != null) {
      return Number(o.userId) === Number(currentUser.id);
    }
    if (currentUser?.email && o.customerEmail) {
      return o.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
    }
    return true;
  });
};
