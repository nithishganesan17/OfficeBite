import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChefHat,
  PackageCheck,
  XCircle,
  Loader2,
  Sparkles,
  Building,
} from 'lucide-react';
import { getCanonicalDish, resolveDishImage } from '../../data/mockData';

/**
 * StaffOrderCard
 * Dark theme matching OfficeBite customer & admin portals (#1A1A1A, #262626, #F59E0B).
 * Displays order token, items with verified food thumbnails and accurate prices, special notes, and operational actions.
 */
export const StaffOrderCard = ({
  order,
  onUpdateStatus,
  isUpdating = false,
  compactSingleItem = false,
  hideLocationDetails = false,
}) => {
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Format creation time correctly
  const formatPlacedTime = () => {
    if (!order.createdAt) return order.placedAt || 'Recently';
    try {
      const iso =
        typeof order.createdAt === 'string' &&
        !order.createdAt.endsWith('Z') &&
        !order.createdAt.includes('+')
          ? order.createdAt + 'Z'
          : order.createdAt;
      const date = new Date(iso);
      if (isNaN(date.getTime())) return order.placedAt || 'Recently';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return order.placedAt || 'Recently';
    }
  };

  const formattedTime = formatPlacedTime();

  const isDeskDelivery = order.deliveryType === 'DESK_DELIVERY';
  const isPlaced = order.status === 'PLACED';
  const isAccepted = order.status === 'ACCEPTED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';
  const isCompleted = order.status === 'COMPLETED';
  const isRejected = order.status === 'REJECTED';

  // Status badge
  const getStatusBadge = () => {
    switch (order.status) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>New Order</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Accepted</span>
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
            <ChefHat className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Cooking</span>
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/25 text-amber-300 border border-amber-400/50 shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready for Pickup</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/60 border border-white/10">
            <PackageCheck className="w-3.5 h-3.5 text-white/60" />
            <span>Fulfilled</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/40 text-red-400 border border-red-800/60">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group bg-[#1A1A1A] rounded-3xl border transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden flex flex-col justify-between ${
        isReady
          ? 'border-amber-400/50 ring-2 ring-amber-400/20 bg-gradient-to-b from-[#1A1A1A] to-amber-950/20'
          : isPlaced
          ? 'border-[#F59E0B]/50 hover:border-[#F59E0B]'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full ${
          isReady
            ? 'bg-amber-400'
            : isPreparing
            ? 'bg-[#F59E0B]'
            : isAccepted
            ? 'bg-amber-500'
            : isPlaced
            ? 'bg-[#F59E0B]'
            : 'bg-white/10'
        }`}
      />

      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Header: Token, Order # and Status */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Token Badge */}
              <div
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shadow-xs transition-transform group-hover:scale-105 ${
                  isReady
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-[#121212]'
                    : 'bg-[#262626] text-white border border-white/10'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-white/50">
                  Token
                </span>
                <span className="text-sm tracking-tight font-black leading-tight mt-0.5 text-[#F59E0B]">
                  {order.tokenNumber || `#${order.id}`}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-white">
                  {order.orderNumber || `OB-${order.id}`}
                </span>
                <p className="text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-[#F59E0B]" />
                  <span>Placed {formattedTime}</span>
                </p>
              </div>
            </div>

            {/* Status Badge */}
            {getStatusBadge()}
          </div>

          {/* Customer & Delivery Context */}
          <div className="p-3 bg-[#262626] rounded-2xl border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#1A1A1A] text-[#F59E0B] border border-white/10 flex items-center justify-center font-bold text-[11px]">
                {order.customerName ? order.customerName.charAt(0).toUpperCase() : order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="leading-tight">
                <span className="font-bold text-white block truncate max-w-[120px]">
                  {order.customerName || order.user?.name || 'Customer'}
                </span>
                <span className="text-[10px] text-white/50">
                  {order.employeeId || order.user?.employeeId ? `ID: ${order.employeeId || order.user?.employeeId}` : order.customerEmail || order.user?.email || 'Walk-in'}
                </span>
              </div>
            </div>

            {!hideLocationDetails && (
              <div className="text-right">
                {isDeskDelivery ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                    <Building className="w-3 h-3" />
                    <span>{order.deliveryLocation || 'Desk Drop'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 text-white/70 font-bold text-[10px] border border-white/10">
                    <MapPin className="w-3 h-3 text-[#F59E0B]" />
                    <span>Canteen Pickup</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Ordered Food Items with Verified Images */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
              Items to Prepare ({order.items?.length || 0})
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(compactSingleItem ? (order.items || []).slice(0, 1) : (order.items || [])).map((item, idx) => {
                const canonical =
                  getCanonicalDish(item) ||
                  getCanonicalDish({ id: item.menuItemId, name: item.itemName || item.name });
                const dishName =
                  item.itemName || item.name || item.menuItem?.name || canonical?.name || 'Dish';
                const dishPrice =
                  item.unitPrice ?? item.price ?? item.menuItem?.price ?? canonical?.price ?? 0;
                const dishImg =
                  resolveDishImage(canonical || item) ||
                  canonical?.image ||
                  '/assets/images/showcase_thali_royal.png';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-[#262626] border border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={dishImg}
                        alt={dishName}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain bg-[#121212] p-1 border border-white/10 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-[#1A1A1A] border border-white/10 font-black text-[#F59E0B] flex items-center justify-center text-[11px] shrink-0">
                            {item.quantity}×
                          </span>
                          <span className="font-bold text-white leading-tight truncate">
                            {dishName}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/50 block mt-0.5">
                          ₹{Number(dishPrice).toFixed(2)} each
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-[#F59E0B] text-xs shrink-0 ml-2">
                      ₹{(dishPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {compactSingleItem && (order.items?.length || 0) > 1 && (
                <div className="text-[10px] text-white/40 italic px-1 pt-0.5">
                  + {order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''} in this order
                </div>
              )}
            </div>
          </div>

          {/* Special Kitchen Instructions */}
          {order.specialInstructions && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Note:</strong> {order.specialInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Footer: Price Total & Action Controls */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">Grand Total</span>
            <span className="text-base font-black text-[#F59E0B]">
              ₹{order.totalAmount ? Number(order.totalAmount).toFixed(2) : Number(order.total || 0).toFixed(2)}
            </span>
          </div>

          {/* Status Action Workflow Buttons */}
          {showRejectConfirm ? (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-red-400">Reject this order?</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setShowRejectConfirm(false);
                    onUpdateStatus(order, 'REJECTED');
                  }}
                  className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Yes, Reject
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectConfirm(false)}
                  className="px-3 py-1.5 bg-[#262626] border border-white/10 text-white/80 rounded-xl font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* PLACED: Accept Order */}
              {isPlaced && (
                <>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(order, 'ACCEPTED')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                    <span>Accept Order</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setShowRejectConfirm(true)}
                    className="p-2.5 rounded-2xl bg-[#262626] border border-red-800/60 text-red-400 hover:bg-red-950/40 text-xs font-bold transition-colors cursor-pointer"
                    title="Reject order"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* ACCEPTED: Start Cooking */}
              {isAccepted && (
                <>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(order, 'PREPARING')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ChefHat className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                    <span>Start Cooking</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setShowRejectConfirm(true)}
                    className="p-2.5 rounded-2xl bg-[#262626] border border-red-800/60 text-red-400 hover:bg-red-950/40 text-xs font-bold transition-colors cursor-pointer"
                    title="Reject order"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* PREPARING: Mark Ready */}
              {isPreparing && (
                <>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(order, 'READY')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-[#121212] text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Mark Ready for Pickup</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setShowRejectConfirm(true)}
                    className="p-2.5 rounded-2xl bg-[#262626] border border-red-800/60 text-red-400 hover:bg-red-950/40 text-xs font-bold transition-colors cursor-pointer"
                    title="Reject order"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* READY: Mark Picked Up */}
              {isReady && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order, 'COMPLETED')}
                  className="w-full py-3 px-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-[#121212] text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PackageCheck className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>Mark Handed Over / Completed</span>
                </button>
              )}

              {/* Terminal COMPLETED state */}
              {isCompleted && (
                <div className="w-full py-2 px-3 rounded-2xl bg-[#262626] text-center text-xs font-bold text-white/60 flex items-center justify-center gap-1.5 border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Order Dispatched & Fulfilled</span>
                </div>
              )}

              {/* Terminal REJECTED state */}
              {isRejected && (
                <div className="w-full py-2 px-3 rounded-2xl bg-red-950/40 text-center text-xs font-bold text-red-400 flex items-center justify-center gap-1.5 border border-red-800/60">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>Order Canceled</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffOrderCard;
