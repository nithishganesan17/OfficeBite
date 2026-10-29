import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CheckoutModal = ({ isOpen, onClose, initialNote = '' }) => {
  const { cartItems, subtotal, tax, placeOrder } = useCart();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('CANTEEN_PICKUP');
  const [tower, setTower] = useState('Tower A');
  const [floor, setFloor] = useState('Floor 4');
  const [deskNumber, setDeskNumber] = useState('Desk 412');
  const [specialInstructions, setSpecialInstructions] = useState(initialNote);
  const [paymentMethod, setPaymentMethod] = useState('PAYROLL_BADGE');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isOpen) return null;

  const deliveryFee = deliveryType === 'DESK_DELIVERY' ? 15 : 0;
  const grandTotal = subtotal + tax + deliveryFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    const locationString =
      deliveryType === 'DESK_DELIVERY'
        ? `${tower} • ${floor} • ${deskNumber}`
        : 'Express Counter 2 • Floor 3 Canteen';

    const order = placeOrder({
      deliveryType,
      deliveryLocation: locationString,
      specialInstructions,
    });

    setConfirmedOrder(order);
  };

  const handleCloseAll = () => {
    setConfirmedOrder(null);
    onClose();
  };

  const handleViewOrders = () => {
    handleCloseAll();
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={confirmedOrder ? undefined : onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative bg-[#FAF8F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#EDE8DC] overflow-hidden z-10 animate-scale-up">
        {/* Header */}
        <div className="bg-white p-5 border-b border-[#EDE8DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292524]">
                {confirmedOrder ? 'Order Confirmed' : 'Checkout & Pickup Details'}
              </h2>
              <p className="text-xs text-[#78716C]">Floor 3 Executive Canteen</p>
            </div>
          </div>
          {!confirmedOrder && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716C] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Confirmed Order State */}
        {confirmedOrder ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EBF5F0] text-[#197A50] flex items-center justify-center mx-auto ring-8 ring-[#EBF5F0]/60">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#197A50] uppercase tracking-wider bg-[#EBF5F0] px-3 py-1 rounded-full">
                Simulated Demo Order
              </span>
              <h3 className="text-xl font-extrabold text-[#292524] mt-2">
                Order Received by Canteen!
              </h3>
              <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">
                Your meal is being freshly prepared in the live kitchen. Show your token number at the pickup counter.
              </p>
            </div>

            {/* Token Badge */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE8DC] shadow-sm max-w-xs mx-auto">
              <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
                Pickup Token Number
              </span>
              <div className="text-4xl font-extrabold text-[#197A50] my-1 font-mono tracking-wider">
                {confirmedOrder.tokenNumber}
              </div>
              <p className="text-xs text-[#78716C]">
                Estimated Ready: <strong>{confirmedOrder.estimatedMinutes} mins</strong>
              </p>
              <div className="mt-3 pt-3 border-t border-[#F4EFE6] text-xs font-medium text-[#292524] flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F28C45]" />
                <span>{confirmedOrder.deliveryLocation}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleViewOrders}
                className="w-full py-3 px-4 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Track in "My Orders"</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleCloseAll}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#78716C] hover:text-[#292524] transition-colors cursor-pointer"
              >
                Continue Browsing Menu
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Demo Notice Banner */}
            <div className="bg-[#FEF3EB] border border-[#FCDDC7] rounded-2xl p-3 flex items-start gap-2.5 text-xs text-[#DE752C]">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#F28C45]" />
              <div>
                <strong>Milestone 1 Demo:</strong> This order is simulated in your browser with realistic token numbers and live status tracking in "My Orders". No backend database call is made.
              </div>
            </div>

            {/* Delivery / Pickup Choice */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-2 uppercase tracking-wide">
                Fulfillment Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('CANTEEN_PICKUP')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryType === 'CANTEEN_PICKUP'
                      ? 'border-[#197A50] bg-white ring-2 ring-[#197A50]/20 shadow-xs'
                      : 'border-[#EDE8DC] bg-white/60 hover:bg-white text-[#78716C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#292524]">Canteen Pickup</span>
                    <span className="text-[10px] font-bold text-[#197A50] bg-[#EBF5F0] px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">
                    Express Counter 2 • Floor 3
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('DESK_DELIVERY')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryType === 'DESK_DELIVERY'
                      ? 'border-[#197A50] bg-white ring-2 ring-[#197A50]/20 shadow-xs'
                      : 'border-[#EDE8DC] bg-white/60 hover:bg-white text-[#78716C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#292524]">Desk Delivery</span>
                    <span className="text-[10px] font-bold text-[#DE752C] bg-[#FEF3EB] px-1.5 py-0.5 rounded">
                      +₹15
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">
                    Delivered directly to workstation
                  </p>
                </button>
              </div>
            </div>

            {/* Desk Location Input if Delivery */}
            {deliveryType === 'DESK_DELIVERY' && (
              <div className="bg-white rounded-2xl p-4 border border-[#EDE8DC] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#292524]">
                  <Building2 className="w-3.5 h-3.5 text-[#197A50]" />
                  <span>Workstation Location</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#78716C] block mb-1">Building Tower</label>
                    <select
                      value={tower}
                      onChange={(e) => setTower(e.target.value)}
                      className="w-full text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl px-2.5 py-2 text-[#292524] focus:outline-none focus:border-[#197A50]"
                    >
                      <option value="Tower A">Tower A (Tech Hub)</option>
                      <option value="Tower B">Tower B (Finance & HR)</option>
                      <option value="Tower C">Tower C (Leadership)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#78716C] block mb-1">Floor</label>
                    <select
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl px-2.5 py-2 text-[#292524] focus:outline-none focus:border-[#197A50]"
                    >
                      <option value="Floor 2">Floor 2</option>
                      <option value="Floor 3">Floor 3</option>
                      <option value="Floor 4">Floor 4</option>
                      <option value="Floor 5">Floor 5</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#78716C] block mb-1">Desk Number / Bay</label>
                  <input
                    type="text"
                    required
                    value={deskNumber}
                    onChange={(e) => setDeskNumber(e.target.value)}
                    placeholder="E.g., Desk 412, Bay C"
                    className="w-full text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl px-3 py-2 text-[#292524] focus:outline-none focus:border-[#197A50]"
                  />
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5 uppercase tracking-wide">
                Kitchen Notes & Preferences
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., Extra hot sambar, less spicy, pack chutney separately..."
                className="w-full text-xs bg-white border border-[#EDE8DC] rounded-xl p-3 text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#197A50]"
              />
            </div>

            {/* Corporate Payment Method */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-2 uppercase tracking-wide">
                Payment Option
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'PAYROLL_BADGE'
                      ? 'border-[#197A50] bg-white ring-1 ring-[#197A50]/20'
                      : 'border-[#EDE8DC] bg-white/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="PAYROLL_BADGE"
                    checked={paymentMethod === 'PAYROLL_BADGE'}
                    onChange={() => setPaymentMethod('PAYROLL_BADGE')}
                    className="accent-[#197A50]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#292524]">
                        Employee Badge / Monthly Payroll Meal Allowance
                      </span>
                      <span className="text-[10px] text-[#197A50] font-semibold bg-[#EBF5F0] px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78716C]">
                      Deducted from monthly food subsidy balance (Rahul Sharma • EMP#8841)
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#197A50] bg-white ring-1 ring-[#197A50]/20'
                      : 'border-[#EDE8DC] bg-white/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-[#197A50]"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-[#292524]">UPI / QR Code</span>
                    <p className="text-[11px] text-[#78716C]">Google Pay, PhonePe, Paytm</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl p-4 border border-[#EDE8DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#78716C]">
                <span>Items ({cartItems.length} dishes)</span>
                <span className="font-medium text-[#292524]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#78716C]">
                <span>GST (5%)</span>
                <span className="font-medium text-[#292524]">₹{tax.toFixed(2)}</span>
              </div>
              {deliveryType === 'DESK_DELIVERY' && (
                <div className="flex justify-between text-[#78716C]">
                  <span>Desk Delivery Service</span>
                  <span className="font-medium text-[#DE752C]">₹15.00</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#EDE8DC] flex justify-between font-extrabold text-sm text-[#292524]">
                <span>Total Amount to Pay</span>
                <span className="text-base text-[#197A50]">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Confirm & Place Demo Order (₹{grandTotal.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
