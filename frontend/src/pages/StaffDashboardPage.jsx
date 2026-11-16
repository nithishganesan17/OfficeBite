import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  RefreshCw,
  Sparkles,
  XCircle,
  LayoutGrid,
  List,
  AlertCircle,
  UtensilsCrossed,
  ArrowRight,
  Lock,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StaffOrderCard } from '../components/staff/StaffOrderCard';
import {
  getOrders,
  updateOrderStatus,
  getInstantOrders,
} from '../services/api';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

/**
 * StaffDashboardPage
 * Dark theme matching OfficeBite customer & admin portals (#121212, #1A1A1A, #F59E0B).
 * Streamlined layout with zero clutter: pure orders workflow, active queues, and real-time updates.
 */
export const StaffDashboardPage = () => {
  const {
    currentUser,
    isAuthenticated: authIsAuthenticated,
    logout: authLogout,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Local authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('officebite_staff_token') || localStorage.getItem('token');
    return Boolean(token) || Boolean(authIsAuthenticated);
  });

  // Verify access has not been revoked by Administrator
  useEffect(() => {
    const rawRevoked = localStorage.getItem('officebite_revoked_emails');
    const staffEmail = currentUser?.email || 'staff@officebite.com';
    if (rawRevoked && staffEmail) {
      try {
        const list = JSON.parse(rawRevoked);
        if (Array.isArray(list) && list.includes(staffEmail.toLowerCase())) {
          localStorage.removeItem('officebite_staff_token');
          localStorage.removeItem('officebite_staff_user');
          navigate('/staff/login', { replace: true, state: { revoked: true } });
        }
      } catch {}
    }
  }, [currentUser, navigate]);

  // Zero-latency instant hydration from storage so order details load in 0ms
  const [orders, setOrders] = useState(() => getInstantOrders());
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'LIST' | 'REJECTED'
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  // Clear stored auth tokens helper
  const clearStoredAuth = () => {
    localStorage.removeItem('officebite_staff_token');
    localStorage.removeItem('officebite_staff_user');
  };

  // Instant multi-tab synchronization (e.g. order placed in customer tab immediately shows in staff tab)
  useEffect(() => {
    const handleSync = () => {
      setOrders(getInstantOrders());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('officebite:order-created', handleSync);
    window.addEventListener('officebite:order-status-updated', handleSync);

    let channel = null;
    try {
      channel = new BroadcastChannel('officebite_sync');
      channel.onmessage = () => handleSync();
    } catch {}

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('officebite:order-created', handleSync);
      window.removeEventListener('officebite:order-status-updated', handleSync);
      if (channel) channel.close();
    };
  }, []);

  // Fetch orders from backend
  const fetchOrdersData = useCallback(async (isManualTrigger = false) => {
    if (isManualTrigger) {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const data = await getOrders();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(getInstantOrders());
      }
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn('Canteen orders background sync note:', err.message || err);
      // Fallback instantly without blocking UI
      setOrders(getInstantOrders());
    } finally {
      setLoading(false);
      if (isManualTrigger) {
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial background load
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersData(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchOrdersData]);

  // Silent automatic 15-second background refresh (without UI clutter)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchOrdersData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchOrdersData]);

  // Handle status update through existing API
  const handleUpdateOrderStatus = async (order, targetStatus) => {
    const orderIdentifier = order.orderNumber || order.id;
    if (updatingIds.has(orderIdentifier)) return;

    setUpdatingIds((prev) => new Set(prev).add(orderIdentifier));

    try {
      const updatedOrder = await updateOrderStatus(orderIdentifier, targetStatus);

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

      // Refresh data silently
      fetchOrdersData(false);
    } catch (err) {
      console.error(`Failed to update status for order #${orderIdentifier}:`, err);
      const apiErrorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Could not update order status.';
      setErrorMessage(`Order #${orderIdentifier}: ${apiErrorMsg}`);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderIdentifier);
        return next;
      });
    }
  };

  // Compute live metrics
  const metrics = useMemo(() => {
    const placed = orders.filter((o) => o.status === 'PLACED').length;
    const preparing = orders.filter(
      (o) =>
        o.status === 'ACCEPTED' ||
        o.status === 'PREPARING' ||
        o.status === 'IN_PREPARATION' ||
        o.status === 'COOKING'
    ).length;
    const ready = orders.filter((o) => o.status === 'READY').length;
    const completed = orders.filter(
      (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED'
    ).length;
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

  // Group orders for the 4 Kanban columns
  const kanbanColumns = useMemo(() => {
    return {
      newOrders: orders.filter((o) => o.status === 'PLACED'),
      inKitchen: orders.filter(
        (o) =>
          o.status === 'ACCEPTED' ||
          o.status === 'PREPARING' ||
          o.status === 'IN_PREPARATION' ||
          o.status === 'COOKING'
      ),
      ready: orders.filter((o) => o.status === 'READY'),
      completed: orders.filter(
        (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED'
      ),
      rejected: orders.filter((o) => o.status === 'REJECTED'),
    };
  }, [orders]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[1650px] mx-auto space-y-6 text-[#F3F4F6] bg-[#121212]">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Canteen Orders</span>
            {metrics.totalActive > 0 && (
              <span className="text-xs font-black bg-[#F59E0B] text-[#121212] px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                {metrics.totalActive} Active
              </span>
            )}
          </h1>
        </div>

        {/* Quick Top Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {isAuthenticated ? (
            <>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('KANBAN')}
                  className={`p-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'KANBAN'
                      ? 'bg-[#F59E0B] text-[#121212] shadow-xs'
                      : 'text-white/60 hover:text-white'
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
                      ? 'bg-[#F59E0B] text-[#121212] shadow-xs'
                      : 'text-white/60 hover:text-white'
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
                      : 'text-white/60 hover:text-red-400'
                  }`}
                  title="View rejected orders"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rejected ({metrics.rejected})</span>
                </button>
              </div>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={() => fetchOrdersData(true)}
                disabled={isRefreshing}
                className="px-4 py-2 rounded-xl bg-[#262626] border border-white/10 text-xs font-bold text-white hover:bg-white/10 shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Refresh orders"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#F59E0B] ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>Refresh</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Error Notice if API is down */}
      {errorMessage && isAuthenticated && (
        <div className="bg-red-950/40 border border-red-800 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isAuthenticated ? (
        <>
          {/* Four Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: New Orders */}
            <div className="bg-[#1A1A1A] rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  New Orders
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#262626] text-[#F59E0B] flex items-center justify-center">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {metrics.placed}
                </span>
                <span className="text-xs font-bold text-[#F59E0B]">Pending</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F59E0B]" />
            </div>

            {/* Card 2: In Kitchen */}
            <div className="bg-[#1A1A1A] rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  In Kitchen
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#262626] text-[#F59E0B] flex items-center justify-center">
                  <ChefHat className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {metrics.preparing}
                </span>
                <span className="text-xs font-bold text-[#F59E0B]">Cooking</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F59E0B]" />
            </div>

            {/* Card 3: Ready for Pickup */}
            <div className="bg-[#1A1A1A] rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Ready for Pickup
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#262626] text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {metrics.ready}
                </span>
                <span className="text-xs font-bold text-amber-300">At Counter</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
            </div>

            {/* Card 4: Completed Today */}
            <div className="bg-[#1A1A1A] rounded-3xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Completed Today
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#262626] text-white/60 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {metrics.completed}
                </span>
                <span className="text-xs font-bold text-white/60">Fulfilled</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
            </div>
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div className="bg-[#1A1A1A] rounded-3xl p-16 text-center border border-white/10 shadow-xl">
              <RefreshCw className="w-8 h-8 text-[#F59E0B] animate-spin mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">
                Loading Canteen Orders...
              </h3>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-3xl p-12 text-center border border-white/10 shadow-xl max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#262626] border border-white/10 text-white/60 flex items-center justify-center mx-auto mb-3">
                <UtensilsCrossed className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-bold text-white">No Orders in Queue</h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                The kitchen queue is currently clear.
              </p>
            </div>
          ) : viewMode === 'KANBAN' ? (
            /* Four-Column Kanban Board */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
              {/* Column 1: New Orders (PLACED) */}
              <div className="bg-[#161616] rounded-3xl border border-white/10 p-4 flex flex-col space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                    <h3 className="font-black text-sm text-white">New Orders</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#262626] text-[#F59E0B] border border-white/10">
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
                    <div className="py-8 text-center text-xs text-white/40 italic border-2 border-dashed border-white/10 rounded-2xl">
                      No new orders pending
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: In Kitchen (ACCEPTED & PREPARING) */}
              <div className="bg-[#161616] rounded-3xl border border-white/10 p-4 flex flex-col space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="font-black text-sm text-white">In Kitchen</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#262626] text-[#F59E0B] border border-white/10">
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
                    <div className="py-8 text-center text-xs text-white/40 italic border-2 border-dashed border-white/10 rounded-2xl">
                      Kitchen prep queue clear
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Ready for Pickup (READY) */}
              <div className="bg-[#161616] rounded-3xl border border-white/10 p-4 flex flex-col space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <h3 className="font-black text-sm text-white">Ready for Pickup</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#262626] text-amber-300 border border-white/10">
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
                    <div className="py-8 text-center text-xs text-white/40 italic border-2 border-dashed border-white/10 rounded-2xl">
                      No orders waiting at counter
                    </div>
                  )}
                </div>
              </div>

              {/* Column 4: Completed Today (1 Food Detail Visible + View History Button) */}
              <div className="bg-[#161616] rounded-3xl border border-white/10 p-4 flex flex-col space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-white/60" />
                    <h3 className="font-black text-sm text-white">Completed Today</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#262626] text-white/60 border border-white/10">
                    {kanbanColumns.completed.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {kanbanColumns.completed.length > 0 ? (
                    <>
                      {/* One food detail visible */}
                      <StaffOrderCard
                        key={kanbanColumns.completed[0].orderNumber || kanbanColumns.completed[0].id}
                        order={kanbanColumns.completed[0]}
                        onUpdateStatus={handleUpdateOrderStatus}
                        isUpdating={updatingIds.has(kanbanColumns.completed[0].orderNumber || kanbanColumns.completed[0].id)}
                        compactSingleItem={true}
                        hideLocationDetails={true}
                      />

                      {/* View History Button */}
                      <button
                        type="button"
                        onClick={() => setShowHistoryModal(true)}
                        className="w-full py-3 px-4 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#F59E0B]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Clock className="w-4 h-4 text-[#121212] stroke-[2.5]" />
                        <span>View History ({kanbanColumns.completed.length})</span>
                      </button>
                    </>
                  ) : (
                    <div className="py-8 text-center text-xs text-white/40 italic border-2 border-dashed border-white/10 rounded-2xl">
                      No completed orders today
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : viewMode === 'LIST' ? (
            /* Queue List View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {orders.map((order) => (
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
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <h3 className="font-black text-base text-white">
                    Rejected Orders ({kanbanColumns.rejected.length})
                  </h3>
                </div>
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
                <div className="bg-[#1A1A1A] rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white text-sm">No Rejected Orders</h4>
                  <p className="text-xs text-white/50 mt-1">
                    All customer orders have been accepted or fulfilled.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Rejected Orders Section when in Kanban mode */}
          {viewMode === 'KANBAN' && kanbanColumns.rejected.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-950/40 border border-red-800 px-3 py-1.5 rounded-full">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>Rejected Orders ({kanbanColumns.rejected.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('REJECTED')}
                  className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
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

          {/* Full History Modal */}
          {showHistoryModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
              <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                {/* Modal Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161616]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#262626] text-[#F59E0B] flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">
                        Completed Orders History
                      </h3>
                      <p className="text-xs text-white/50">
                        {kanbanColumns.completed.length} total fulfilled order{kanbanColumns.completed.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close History"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content - Scrollable List of All Completed Orders */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {kanbanColumns.completed.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {kanbanColumns.completed.map((order) => (
                        <StaffOrderCard
                          key={order.orderNumber || order.id}
                          order={order}
                          onUpdateStatus={handleUpdateOrderStatus}
                          isUpdating={updatingIds.has(order.orderNumber || order.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-white/40 text-sm">
                      No order history available yet.
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end bg-[#161616]">
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#262626] hover:bg-white/10 text-white font-bold text-xs border border-white/10 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
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
