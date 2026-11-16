import { getCanonicalDish } from '../data/mockData.js';

const STATUS_LABELS = {
  PLACED: 'Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Cooking',
  READY: 'Ready',
  COMPLETED: 'Completed',
  DELIVERED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  CANCELED: 'Cancelled',
};

/**
 * Normalizes an order from backend REST response or local session
 */
export const normalizeOrder = (ord) => {
  if (!ord) return null;
  const rawStatus = (ord.status || 'PLACED').toUpperCase();
  const orderNum = ord.orderNumber || ord.id;
  const isSrikanthBaseline = orderNum === 'OB-7540' || ord.tokenNumber === 'A-71' || ord.pickupToken === 'A-71';
  const isShanthoshBaseline = orderNum === 'OB-7978' || ord.tokenNumber === 'D-48' || ord.pickupToken === 'D-48';

  return {
    id: orderNum,
    orderNumber: orderNum,
    tokenNumber: ord.tokenNumber || ord.pickupToken || (isSrikanthBaseline ? 'A-71' : isShanthoshBaseline ? 'D-48' : 'A-12'),
    customerName: ord.customerName || ord.user?.name || (isSrikanthBaseline ? 'Srikanth' : isShanthoshBaseline ? 'Shanthosh' : 'Customer'),
    placedAt: ord.createdAt
      ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : ord.placedAt || 'Recently',
    status: rawStatus,
    statusLabel: STATUS_LABELS[rawStatus] || rawStatus,
    deliveryType: ord.deliveryType || (isShanthoshBaseline ? 'DESK_DELIVERY' : 'CANTEEN_PICKUP'),
    deliveryLocation:
      ord.deliveryLocation ||
      (isShanthoshBaseline
        ? 'Tower A • Floor 4 • Desk 412'
        : 'Live Kitchen Counter 2 • Floor 3'),
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
    subtotal: ord.subtotal || ord.totalAmount || ord.total || 0,
    total: ord.totalAmount || ord.total || ord.subtotal || 0,
    totalAmount: ord.totalAmount || ord.total || ord.subtotal || 0,
    specialInstructions: ord.specialInstructions,
    isRealBackend: Boolean(ord.orderNumber && ord.createdAt),
    userId: ord.userId,
    customerEmail: ord.customerEmail || (isSrikanthBaseline ? 'srikanth@gmail.com' : isShanthoshBaseline ? 'shanthosh@gmail.com' : undefined),
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
