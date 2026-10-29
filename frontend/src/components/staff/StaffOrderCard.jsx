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
  ArrowRight,
  Flame,
  User,
  Building,
} from 'lucide-react';

/**
 * StaffOrderCard
 * Restored original Kitchen Staff Order Card with warm culinary identity (#F28C45 / #DE752C / #197A50).
 * Displays order token, items, special notes, and operational actions (Accept, Prepare, Ready, Complete, Reject).
 */
export const StaffOrderCard = ({
  order,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Format creation time
  const formattedTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  // Calculate elapsed minutes
  const getElapsedMinutes = () => {
    if (!order.createdAt) return null;
    const diffMs = Date.now() - new Date(order.createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  const elapsedMins = getElapsedMinutes();

  const isDeskDelivery = order.deliveryType === 'DESK_DELIVERY';
  const isPlaced = order.status === 'PLACED';
  const isAccepted = order.status === 'ACCEPTED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';
  const isCompleted = order.status === 'COMPLETED';
  const isRejected = order.status === 'REJECTED';

  // Warm culinary status badges
  const getStatusBadge = () => {
    switch (order.status) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#DE752C] animate-pulse" />
            <span>New Order</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Accepted</span>
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC]">
            <ChefHat className="w-3.5 h-3.5 text-[#DE752C]" />
            <span>Cooking Now</span>
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EBF5F0] text-[#197A50] border border-[#C8E6D6] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#197A50]" />
            <span>Ready for Counter Pickup</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4EFE6] text-[#78716C] border border-[#E5DDCF]">
            <PackageCheck className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Fulfilled</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group bg-white rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
        isReady
          ? 'border-[#197A50]/40 ring-2 ring-[#197A50]/15 bg-gradient-to-b from-white to-[#EBF5F0]/30'
          : isPlaced
          ? 'border-[#FBD8BC] hover:border-[#DE752C]'
          : 'border-[#EDE8DC] hover:border-[#D6CEBF]'
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full ${
          isReady
            ? 'bg-[#197A50]'
            : isPreparing
            ? 'bg-[#DE752C]'
            : isAccepted
            ? 'bg-blue-600'
            : isPlaced
            ? 'bg-[#F28C45]'
            : 'bg-[#EDE8DC]'
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
                    ? 'bg-gradient-to-tr from-[#197A50] to-[#146340] text-white shadow-emerald-500/20'
                    : 'bg-[#292524] text-white'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-stone-300">
                  Token
                </span>
                <span className="text-sm tracking-tight font-black leading-tight mt-0.5">
                  {order.tokenNumber || `#${order.id}`}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#292524]">
                  {order.orderNumber || `OB-${order.id}`}
                </span>
                <p className="text-[11px] text-[#78716C] flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-[#DE752C]" />
                  <span>Placed {formattedTime}</span>
                  {elapsedMins !== null && (
                    <span className={`font-semibold ${elapsedMins > 20 ? 'text-red-600' : 'text-[#78716C]'}`}>
                      ({elapsedMins}m ago)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            {getStatusBadge()}
          </div>

          {/* Customer & Delivery Context */}
          <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EDE8DC] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FEF3EB] text-[#DE752C] flex items-center justify-center font-bold text-[11px]">
                {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="leading-tight">
                <span className="font-bold text-[#292524] block truncate max-w-[120px]">
                  {order.user?.name || 'Employee Order'}
                </span>
                <span className="text-[10px] text-[#78716C]">
                  {order.user?.employeeId ? `ID: ${order.user.employeeId}` : order.user?.email || 'Walk-in'}
                </span>
              </div>
            </div>

            <div className="text-right">
              {isDeskDelivery ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-100 text-orange-800 font-extrabold text-[10px]">
                  <Building className="w-3 h-3" />
                  <span>{order.deliveryLocation || 'Desk Drop'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-[#78716C] font-bold text-[10px]">
                  <MapPin className="w-3 h-3 text-[#78716C]" />
                  <span>Canteen Pickup</span>
                </span>
              )}
            </div>
          </div>

          {/* Ordered Food Items */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A8A29E] block">
              Items to Prepare ({order.items?.length || 0})
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FAF8F5] border border-[#EDE8DC]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-white border border-[#EDE8DC] font-black text-[#292524] flex items-center justify-center text-xs shadow-2xs">
                      {item.quantity}×
                    </span>
                    <span className="font-bold text-[#292524] leading-tight">
                      {item.menuItem?.name || item.name || 'Dish'}
                    </span>
                  </div>
                  <span className="font-bold text-[#78716C] text-xs">
                    ₹{(item.price || item.menuItem?.price || 0) * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Kitchen Instructions */}
          {order.specialInstructions && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>Note:</strong> {order.specialInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Footer: Price Total & Action Controls */}
        <div className="pt-4 border-t border-[#EDE8DC] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#78716C] font-medium">Grand Total</span>
            <span className="text-base font-black text-[#292524]">
              ₹{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
            </span>
          </div>

          {/* Status Action Workflow Buttons */}
          {showRejectConfirm ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-red-800">Reject this order?</p>
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
                  className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* PLACED: Accept & Cook */}
              {isPlaced && (
                <>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(order, 'ACCEPTED')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#F28C45] hover:bg-[#DE752C] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Accept Order</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setShowRejectConfirm(true)}
                    className="p-2.5 rounded-2xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
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
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#DE752C] hover:bg-[#C85D1B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ChefHat className="w-3.5 h-3.5" />
                    )}
                    <span>Start Cooking</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setShowRejectConfirm(true)}
                    className="p-2.5 rounded-2xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
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
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#197A50] hover:bg-[#146340] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
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
                    className="p-2.5 rounded-2xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
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
                  className="w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-[#197A50] to-[#146340] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PackageCheck className="w-4 h-4" />
                  )}
                  <span>Mark Handed Over / Completed</span>
                </button>
              )}

              {/* Terminal COMPLETED state */}
              {isCompleted && (
                <div className="w-full py-2 px-3 rounded-2xl bg-[#F4EFE6] text-center text-xs font-bold text-[#78716C] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#197A50]" />
                  <span>Order Dispatched & Fulfilled</span>
                </div>
              )}

              {/* Terminal REJECTED state */}
              {isRejected && (
                <div className="w-full py-2 px-3 rounded-2xl bg-red-50 text-center text-xs font-bold text-red-700 flex items-center justify-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
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
