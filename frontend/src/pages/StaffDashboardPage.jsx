import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  ChefHat,
  Clock,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  PackageCheck,
  AlertCircle,
  XCircle,
  ArrowRight,
  Flame,
  LayoutGrid,
  List,
  UtensilsCrossed,
  MapPin,
  Lock,
} from 'lucide-react';
import {
  getOrders,
  updateOrderStatus,
  getStoredToken,
  getStoredUser,
  clearStoredAuth,
} from '../services/api';
import { StaffOrderCard } from '../components/staff/StaffOrderCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const StaffDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: authLogout } = useAuth();
  const { showToast } = useCart();

  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    return Boolean(token && user && (user.role === 'STAFF' || user.role === 'ADMIN'));
  });

  // Primary order data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // Set of order IDs currently undergoing an API update
  const [updatingIds, setUpdatingIds] = useState(new Set());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('ALL'); // 'ALL' | 'CANTEEN_PICKUP' | 'DESK_DELIVERY'
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'LIST' | 'REJECTED'
  const [autoPollEnabled, setAutoPollEnabled] = useState(true);

  // Ref to prevent overlapping fetch requests
  const isFetchingRef = useRef(false);

  // Fetch orders directly from backend API
  const fetchOrdersData = async (isManual = false) => {
    const token = getStoredToken();
    const user = getStoredUser();

    // Guard: require valid token and privileged role
    if (!token || !user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManual) {
      setIsRefreshing(true);
    }

    try {
      setErrorMessage(null);
      const data = await getOrders();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to fetch orders for staff dashboard:', err);
      if (err.response?.status === 401) {
        clearStoredAuth();
        setIsAuthenticated(false);
        setCurrentUser(null);
        setOrders([]);
      } else {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Unable to connect to order API. Please verify backend is running.';
        setErrorMessage(msg);
        if (isManual && showToast) {
          showToast(`Failed to refresh orders: ${msg}`, 'error');
        }
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 15-second automatic polling with proper cleanup on unmount
  useEffect(() => {
    if (!autoPollEnabled || !isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchOrdersData(false);
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoPollEnabled, isAuthenticated]);

  // Handle staff logout action
  const handleStaffLogout = () => {
    clearStoredAuth();
    authLogout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setOrders([]);
    setErrorMessage(null);
    setLastRefreshedAt(null);
    if (showToast) {
      showToast('Signed out of Kitchen Terminal.', 'info');
    }
    navigate('/staff/login', { replace: true });
  };

  // Handle status update through existing API
  const handleUpdateOrderStatus = async (order, targetStatus) => {
    const orderIdentifier = order.orderNumber || order.id;

    // Prevent duplicate submission for this order
    if (updatingIds.has(orderIdentifier)) return;

    // Add to updating set
    setUpdatingIds((prev) => new Set(prev).add(orderIdentifier));

    try {
      // Call existing API: PATCH /api/orders/{id}/status
      const updatedOrder = await updateOrderStatus(orderIdentifier, targetStatus);

      // Reconcile list using actual response from backend
      setOrders((prev) =>
        prev.map((ord) => {
          const ordId = ord.orderNumber || ord.id;
          if (ordId === orderIdentifier) {
            return {
              ...ord,
              ...updatedOrder,
              status: updatedOrder.status,
              statusLabel: updatedOrder.statusLabel,
              updatedAt: updatedOrder.updatedAt,
            };
          }
          return ord;
        })
      );

      const statusLabels = {
        ACCEPTED: 'Accepted by Kitchen',
        PREPARING: 'Moved to Cooking Queue',
        READY: 'Marked Ready for Pickup',
        COMPLETED: 'Fulfilled & Completed',
        REJECTED: 'Rejected',
      };

      const friendlyMsg = `Order #${orderIdentifier} is now ${statusLabels[targetStatus] || targetStatus}!`;
      if (showToast) {
        showToast(friendlyMsg, targetStatus === 'REJECTED' ? 'info' : 'success');
      }

      // Refresh data silently to ensure full consistency
      fetchOrdersData(false);
    } catch (err) {
      console.error(`Failed to update status for order #${orderIdentifier}:`, err);
      const apiErrorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Could not update order status.';
      setErrorMessage(`Order #${orderIdentifier}: ${apiErrorMsg}`);
      if (showToast) {
        showToast(`Error updating Order #${orderIdentifier}: ${apiErrorMsg}`, 'error');
      }
    } finally {
      // Remove from updating set
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderIdentifier);
        return next;
      });
    }
  };

  // Compute live metrics strictly from real API data
  const metrics = useMemo(() => {
    const placed = orders.filter((o) => o.status === 'PLACED').length;
    const preparing = orders.filter(
      (o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'
    ).length;
    const ready = orders.filter((o) => o.status === 'READY').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const rejected = orders.filter((o) => o.status === 'REJECTED').length;
    const totalActive = placed + preparing + ready;

    return {
      placed,
      preparing,
      ready,
      completed,
      rejected,
      totalActive,
    };
  }, [orders]);

  // Filtered orders based on search & delivery type
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Delivery type filter
      if (deliveryFilter !== 'ALL' && order.deliveryType !== deliveryFilter) {
        return false;
      }

      // 2. Search query (token, order number, customer name, employee ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tokenMatch = (order.tokenNumber || '').toLowerCase().includes(q);
        const orderNumMatch = (order.orderNumber || '').toLowerCase().includes(q);
        const idMatch = String(order.id || '').toLowerCase().includes(q);
        const customerMatch = (order.customerName || '').toLowerCase().includes(q);
        const empIdMatch = (order.employeeId || '').toLowerCase().includes(q);

        if (!tokenMatch && !orderNumMatch && !idMatch && !customerMatch && !empIdMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, deliveryFilter, searchQuery]);

  // Group orders for the 4 Kanban columns
  const kanbanColumns = useMemo(() => {
    return {
      newOrders: filteredOrders.filter((o) => o.status === 'PLACED'),
      inKitchen: filteredOrders.filter(
        (o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'
      ),
      ready: filteredOrders.filter((o) => o.status === 'READY'),
      completed: filteredOrders.filter((o) => o.status === 'COMPLETED'),
      rejected: filteredOrders.filter((o) => o.status === 'REJECTED'),
    };
  }, [filteredOrders]);

  // Format last refreshed time
  const lastRefreshedText = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Connecting...';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[1650px] mx-auto space-y-6 text-[#292524]">
      {/* Top Banner & Operational Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EDE8DC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC] shadow-2xs">
              <ChefHat className="w-3.5 h-3.5 text-[#DE752C]" />
              <span>Live Kitchen Operations</span>
            </span>
            <span className="text-xs text-[#78716C] font-mono bg-white px-2 py-0.5 rounded-md border border-[#EDE8DC]">
              Station 1 • Canteen Queue
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#292524] tracking-tight mt-2 flex items-center gap-3">
            <span>Canteen Staff Dashboard</span>
            {metrics.totalActive > 0 && (
              <span className="text-xs font-black bg-[#F28C45] text-white px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                {metrics.totalActive} Active Queue
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Accept incoming orders, coordinate live prep, and dispatch counter tokens in real-time.
          </p>
        </div>

        {/* Quick Top Controls: Auto-poll & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isAuthenticated ? (
            <>
              {/* Auto-poll status toggle */}
              <button
                type="button"
                onClick={() => setAutoPollEnabled(!autoPollEnabled)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  autoPollEnabled
                    ? 'bg-[#FEF3EB] border-[#FBD8BC] text-[#DE752C]'
                    : 'bg-white border-[#EDE8DC] text-[#78716C]'
                }`}
                title="Toggle 15-second automatic polling"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    autoPollEnabled ? 'bg-[#DE752C] animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{autoPollEnabled ? 'Auto-Sync: 15s' : 'Auto-Sync: Paused'}</span>
              </button>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={() => fetchOrdersData(true)}
                disabled={isRefreshing}
                className="px-4 py-2 rounded-xl bg-white border border-[#EDE8DC] text-xs font-bold text-[#292524] hover:bg-[#FAF8F5] shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Fetch latest orders from MySQL"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#DE752C] ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>Refresh</span>
              </button>

              <span className="text-[11px] text-[#78716C] font-mono hidden sm:inline pl-1">
                Synced: {lastRefreshedText}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Error Notice if API is down */}
      {errorMessage && isAuthenticated && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-red-700 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isAuthenticated ? (
        <>
          {/* 1. Four Metric Summary Cards in Amber / Orange / Emerald */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: New Orders Awaiting Action */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE8DC] shadow-xs relative overflow-hidden group hover:border-[#DE752C]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#78716C] uppercase tracking-wider">
                  New Orders
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FEF3EB] text-[#DE752C] flex items-center justify-center shadow-2xs">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#292524] tracking-tight">
                  {metrics.placed}
                </span>
                <span className="text-xs font-bold text-[#DE752C]">Awaiting Action</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">Pending kitchen acceptance</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F28C45]" />
            </div>

            {/* Card 2: In Kitchen (Accepted + Preparing) */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE8DC] shadow-xs relative overflow-hidden group hover:border-[#DE752C]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#78716C] uppercase tracking-wider">
                  In Kitchen
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FEF3EB] text-[#DE752C] flex items-center justify-center shadow-2xs">
                  <ChefHat className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#292524] tracking-tight">
                  {metrics.preparing}
                </span>
                <span className="text-xs font-bold text-[#DE752C]">Cooking Now</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">Accepted & currently on stove</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#DE752C]" />
            </div>

            {/* Card 3: Ready for Pickup */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE8DC] shadow-xs relative overflow-hidden group hover:border-[#197A50]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#78716C] uppercase tracking-wider">
                  Ready for Pickup
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#EBF5F0] text-[#197A50] flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#292524] tracking-tight">
                  {metrics.ready}
                </span>
                <span className="text-xs font-bold text-[#197A50]">At Counter</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">Dispatched tokens waiting for client</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#197A50]" />
            </div>

            {/* Card 4: Completed Today */}
            <div className="bg-white rounded-3xl p-5 border border-[#EDE8DC] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#78716C] uppercase tracking-wider">
                  Completed Today
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#F4EFE6] text-[#78716C] flex items-center justify-center shadow-2xs">
                  <PackageCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#292524] tracking-tight">
                  {metrics.completed}
                </span>
                <span className="text-xs font-semibold text-[#78716C]">Fulfilled</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">
                Successfully delivered / picked up
                {metrics.rejected > 0 && (
                  <span className="text-red-600 font-bold ml-1">
                    ({metrics.rejected} rejected)
                  </span>
                )}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EDE8DC]" />
            </div>
          </div>

          {/* 2. Controls & Search/Filter Toolbar */}
          <div className="bg-white rounded-3xl border border-[#EDE8DC] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by token (#A-35), order ID (OB-8545), customer..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DC] text-xs font-medium text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#DE752C] focus:ring-1 focus:ring-[#DE752C] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#292524] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Controls: Delivery Type & View Modes */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Delivery Type Dropdown / Pills */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#EDE8DC]">
                <button
                  type="button"
                  onClick={() => setDeliveryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deliveryFilter === 'ALL'
                      ? 'bg-[#292524] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                >
                  All Types
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryFilter('CANTEEN_PICKUP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deliveryFilter === 'CANTEEN_PICKUP'
                      ? 'bg-[#292524] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                >
                  Counter Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryFilter('DESK_DELIVERY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deliveryFilter === 'DESK_DELIVERY'
                      ? 'bg-[#292524] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                >
                  Desk Delivery
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#EDE8DC]">
                <button
                  type="button"
                  onClick={() => setViewMode('KANBAN')}
                  className={`p-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'KANBAN'
                      ? 'bg-[#292524] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                  title="Kanban Board view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Board</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'LIST'
                      ? 'bg-[#292524] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                  title="Queue List view"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('REJECTED')}
                  className={`p-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'REJECTED'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-[#78716C] hover:text-red-700'
                  }`}
                  title="View rejected orders"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rejected ({metrics.rejected})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-[#EDE8DC] shadow-xs">
              <RefreshCw className="w-8 h-8 text-[#DE752C] animate-spin mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#292524]">
                Loading Canteen Orders from MySQL...
              </h3>
              <p className="text-xs text-[#78716C] mt-1">Connecting to backend port 8081</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EDE8DC] shadow-xs max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#EDE8DC] text-[#78716C] flex items-center justify-center mx-auto mb-3">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#292524]">No Orders Match Filters</h3>
              <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                {searchQuery
                  ? `No orders found matching "${searchQuery}". Clear your search query.`
                  : 'The kitchen queue is currently clear.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#292524] text-white text-xs font-bold hover:bg-black cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : viewMode === 'KANBAN' ? (
            /* 3. Four-Column Kanban Board */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
              {/* Column 1: New Orders (PLACED) */}
              <div className="bg-white rounded-3xl border border-[#EDE8DC] p-4 flex flex-col space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F28C45] animate-pulse" />
                    <h3 className="font-black text-sm text-[#292524]">New Orders</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC]">
                    {kanbanColumns.newOrders.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {kanbanColumns.newOrders.length > 0 ? (
                    kanbanColumns.newOrders.map((order) => (
                      <StaffOrderCard
                        key={order.orderNumber || order.id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                        isUpdating={updatingIds.has(order.orderNumber || order.id)}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-[#A8A29E] italic border-2 border-dashed border-[#EDE8DC] rounded-2xl">
                      No new orders pending
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: In Kitchen (ACCEPTED & PREPARING) */}
              <div className="bg-white rounded-3xl border border-[#EDE8DC] p-4 flex flex-col space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#DE752C]" />
                    <h3 className="font-black text-sm text-[#292524]">In Kitchen</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC]">
                    {kanbanColumns.inKitchen.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {kanbanColumns.inKitchen.length > 0 ? (
                    kanbanColumns.inKitchen.map((order) => (
                      <StaffOrderCard
                        key={order.orderNumber || order.id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                        isUpdating={updatingIds.has(order.orderNumber || order.id)}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-[#A8A29E] italic border-2 border-dashed border-[#EDE8DC] rounded-2xl">
                      Kitchen prep queue clear
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Ready for Pickup (READY) */}
              <div className="bg-white rounded-3xl border border-[#EDE8DC] p-4 flex flex-col space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#197A50]" />
                    <h3 className="font-black text-sm text-[#292524]">Ready for Pickup</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#EBF5F0] text-[#197A50] border border-[#C8E6D6]">
                    {kanbanColumns.ready.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {kanbanColumns.ready.length > 0 ? (
                    kanbanColumns.ready.map((order) => (
                      <StaffOrderCard
                        key={order.orderNumber || order.id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                        isUpdating={updatingIds.has(order.orderNumber || order.id)}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-[#A8A29E] italic border-2 border-dashed border-[#EDE8DC] rounded-2xl">
                      No orders waiting at counter
                    </div>
                  )}
                </div>
              </div>

              {/* Column 4: Completed (COMPLETED) */}
              <div className="bg-white rounded-3xl border border-[#EDE8DC] p-4 flex flex-col space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#78716C]" />
                    <h3 className="font-black text-sm text-[#292524]">Completed</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#78716C] border border-[#E5DDCF]">
                    {kanbanColumns.completed.length}
                  </span>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
                  {kanbanColumns.completed.length > 0 ? (
                    kanbanColumns.completed.map((order) => (
                      <StaffOrderCard
                        key={order.orderNumber || order.id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                        isUpdating={updatingIds.has(order.orderNumber || order.id)}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-[#A8A29E] italic border-2 border-dashed border-[#EDE8DC] rounded-2xl">
                      Completed orders appear here
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : viewMode === 'LIST' ? (
            /* Sequential Queue List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                <span className="text-xs font-bold text-[#78716C]">
                  Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} in queue list view
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map((order) => (
                  <StaffOrderCard
                    key={order.orderNumber || order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                    isUpdating={updatingIds.has(order.orderNumber || order.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Rejected Orders Dedicated View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <h3 className="font-black text-base text-[#292524]">
                    Rejected / Canceled Orders ({kanbanColumns.rejected.length})
                  </h3>
                </div>
                <p className="text-xs text-[#78716C]">
                  Orders rejected by kitchen staff or out-of-stock items
                </p>
              </div>

              {kanbanColumns.rejected.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {kanbanColumns.rejected.map((order) => (
                    <StaffOrderCard
                      key={order.orderNumber || order.id}
                      order={order}
                      onUpdateStatus={handleUpdateOrderStatus}
                      isUpdating={updatingIds.has(order.orderNumber || order.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EDE8DC] max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-[#197A50] mx-auto mb-2" />
                  <h4 className="font-bold text-[#292524] text-sm">No Rejected Orders</h4>
                  <p className="text-xs text-[#78716C] mt-1">
                    All customer orders have been accepted or fulfilled smoothly.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Rejected Orders Section when in Kanban mode */}
          {viewMode === 'KANBAN' && kanbanColumns.rejected.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#EDE8DC]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Rejected Orders ({kanbanColumns.rejected.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('REJECTED')}
                  className="text-xs font-bold text-[#DE752C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in dedicated view</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kanbanColumns.rejected.map((order) => (
                  <StaffOrderCard
                    key={order.orderNumber || order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                    isUpdating={updatingIds.has(order.orderNumber || order.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Navigate to="/staff/login" state={{ from: location.pathname }} replace />
      )}
    </div>
  );
};

export default StaffDashboardPage;
