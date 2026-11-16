import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  User,
  AlertCircle,
  Loader2,
  Utensils,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { useCart, normalizeOrder } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { getCanonicalDish, SHOWCASE_CANONICAL_MAP, resolveDishImage } from '../data/mockData';

export const CheckoutPage = () => {
  const { cartItems, clearCart, setOrders, refreshOrders, showToast } = useCart();
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  // Form input state initialized with current user if logged in
  const [formData, setFormData] = useState({
    customerName: currentUser?.name || '',
    employeeId: currentUser?.employeeId || '',
    customerEmail: currentUser?.email || '',
    deliveryType: 'CANTEEN_PICKUP',
    deliveryLocation: 'Express Counter 2 • Floor 3',
    specialInstructions: '',
  });

  // Sync state when auth state changes (strictly ensures customer identity)
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'STAFF') {
      setFormData((prev) => ({
        ...prev,
        customerName: currentUser.name || prev.customerName,
        customerEmail: currentUser.email || prev.customerEmail,
        employeeId: currentUser.employeeId || prev.employeeId,
      }));
    }
  }, [currentUser]);

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const fallbackImg = '/assets/images/showcase_thali_royal.png';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific validation error on user keystroke
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const DEFAULT_COUNTER_LOCATION = 'Express Counter 2 • Floor 3';

  const handleDeliveryTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      deliveryType: type,
      deliveryLocation:
        type === 'DESK_DELIVERY'
          ? (prev.deliveryLocation === DEFAULT_COUNTER_LOCATION ? '' : prev.deliveryLocation)
          : DEFAULT_COUNTER_LOCATION,
    }));

    if (type === 'CANTEEN_PICKUP' && fieldErrors.deliveryLocation) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.deliveryLocation;
        return updated;
      });
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side quick validation
    const errors = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer name is required';
    }

    if (formData.deliveryType === 'DESK_DELIVERY' && (!formData.deliveryLocation || !formData.deliveryLocation.trim())) {
      errors.deliveryLocation = 'Desk details are required for desk delivery';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.customerName) {
        setErrorMessage('Please enter your full name before submitting.');
      } else if (errors.deliveryLocation) {
        setErrorMessage('Please enter your desk details for desk delivery.');
      }
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your food tray is empty. Add items from the menu first.');
      return;
    }

    if (!isAuthenticated) {
      setErrorMessage('Please sign in or create an employee account to place your canteen order.');
      openAuthModal('login');
      return;
    }

    setIsSubmitting(true);

    try {
      const resolvedName =
        formData.customerName && formData.customerName !== 'Kitchen Staff'
          ? formData.customerName.trim()
          : (currentUser?.name || 'Customer');
      const resolvedEmail =
        formData.customerEmail && !formData.customerEmail.includes('staff@')
          ? formData.customerEmail.trim()
          : (currentUser?.email || 'customer@officebite.com');
      const resolvedEmpId =
        formData.employeeId && formData.employeeId !== 'STAFF-01'
          ? formData.employeeId.trim()
          : (currentUser?.employeeId || 'OB-' + Math.floor(1000 + Math.random() * 9000));

      // Build order payload strictly matching CreateOrderRequest DTO
      // Note: We deliberately do NOT send price or total — backend calculates final bill.
      const payload = {
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        employeeId: resolvedEmpId,
        deliveryType: formData.deliveryType,
        deliveryLocation:
          formData.deliveryType === 'CANTEEN_PICKUP'
            ? DEFAULT_COUNTER_LOCATION
            : (formData.deliveryLocation?.trim() || null),
        items: cartItems.map((item) => {
          const canonical = getCanonicalDish(item);
          let targetId = canonical ? canonical.id : (item.id || item.menuItemId);
          if (targetId && SHOWCASE_CANONICAL_MAP && SHOWCASE_CANONICAL_MAP[targetId]) {
            targetId = SHOWCASE_CANONICAL_MAP[targetId];
          }
          return {
            id: targetId,
            menuItemId: targetId,
            name: canonical?.name || item.name,
            itemName: canonical?.name || item.name,
            quantity: item.quantity,
            price: Number(canonical?.price ?? item.price ?? 0),
            unitPrice: Number(canonical?.price ?? item.price ?? 0),
            image: canonical?.image || item.image || item.imageUrl,
            imageUrl: canonical?.image || item.image || item.imageUrl,
          };
        }),
        totalAmount: cartItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.quantity || 1), 0),
        subtotal: cartItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.quantity || 1), 0),
      };

      // Real REST API call: POST http://localhost:8081/api/orders
      const realOrder = await createOrder(payload);

      // Order successfully confirmed and saved in MySQL!
      // 1. Clear cart only after backend confirms order creation
      clearCart();

      // 2. Add real order to global context state for tracking
      if (setOrders) {
        setOrders((prev) => [normalizeOrder(realOrder), ...prev]);
      }
      if (refreshOrders) {
        refreshOrders();
      }

      // 3. Switch to confirmation screen
      setConfirmedOrder(realOrder);
      if (showToast) {
        showToast(`Order #${realOrder.orderNumber} confirmed! Token: ${realOrder.tokenNumber}`, 'success');
      }
    } catch (err) {
      console.error('Checkout API failed:', err);

      if (err.response) {
        const errorData = err.response.data;
        if (errorData?.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
          const firstErr = Object.values(errorData.fieldErrors)[0];
          setErrorMessage(firstErr || 'Please correct the highlighted fields.');
        } else if (errorData?.message) {
          setErrorMessage(errorData.message);
        } else {
          setErrorMessage(`Server responded with error ${err.response.status}. Please check backend logs.`);
        }
      } else if (err.request) {
        setErrorMessage(
          'Unable to reach OfficeBite backend API on port 8081. Ensure Spring Boot server is running.'
        );
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // VIEW 1: ORDER CONFIRMATION SCREEN (REAL BACKEND DATA)
  // ----------------------------------------------------
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3F4F6] py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="w-18 h-18 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-4 shadow-sm animate-scale-up">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider bg-[#F59E0B]/15 px-3.5 py-1 rounded-full border border-[#F59E0B]/30">
            Order Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2.5">
            Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-md mx-auto">
            Your order has been placed and is being freshly prepared.
          </p>
        </div>

        {/* Real Order Token Card */}
        <div className="bg-gradient-to-br from-[#292929] to-[#171717] border border-white/10 text-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#F59E0B] block">
                Pickup Token Number
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {confirmedOrder.tokenNumber}
                </span>
                <span className="text-xs text-amber-300 bg-white/10 px-2.5 py-1 rounded-full font-semibold border border-white/10">
                  {confirmedOrder.statusLabel || confirmedOrder.status}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-2 max-w-sm">
                Display this token number at{' '}
                <strong className="text-white">{confirmedOrder.deliveryLocation}</strong> when your order is called.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 text-center min-w-[180px] border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-white/60 block font-semibold">
                Official Order ID
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#F59E0B] block mt-0.5">
                #{confirmedOrder.orderNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details & Receipt Breakdown */}
        <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xl p-6 sm:p-8 space-y-6 mb-8 text-white">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#F59E0B]" />
              <span>Canteen Order Summary</span>
            </h3>
            <span className="text-xs text-white/50">
              Placed at: {new Date(confirmedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Customer & Location Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#262626] border border-white/10">
              <span className="text-white/60 block font-medium">Customer</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {confirmedOrder.customerName}
              </span>
              {confirmedOrder.employeeId && (
                <span className="text-white/50">Emp ID: {confirmedOrder.employeeId}</span>
              )}
            </div>
            <div className="p-3.5 rounded-2xl bg-[#262626] border border-white/10">
              <span className="text-white/60 block font-medium">Station</span>
              <span className="font-bold text-white text-sm mt-0.5 block truncate">
                {confirmedOrder.deliveryLocation}
              </span>
              <span className="text-white/50">{confirmedOrder.deliveryType}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#262626] border border-white/10">
              <span className="text-white/60 block font-medium">Estimated Prep</span>
              <span className="font-bold text-[#F59E0B] text-sm mt-0.5 block">10-15 Minutes</span>
              <span className="text-white/50">Freshly prepared</span>
            </div>
          </div>

          {confirmedOrder.specialInstructions && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300">
              <strong>Special Instructions:</strong> {confirmedOrder.specialInstructions}
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
              Dishes Ordered ({confirmedOrder.items?.length || 0})
            </h4>
            <div className="divide-y divide-white/10">
              {confirmedOrder.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resolveDishImage(item) || fallbackImg}
                      alt={item.itemName}
                      className="w-12 h-12 rounded-xl object-contain bg-[#262626] p-1 shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-white truncate">{item.itemName}</p>
                      <p className="text-xs text-white/50">
                        {item.quantity} × ₹{item.unitPrice}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#F59E0B] shrink-0 text-base">
                    ₹{(Number(item.subtotal ?? ((item.unitPrice || item.price || 0) * (item.quantity || 1)) ?? 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Bill */}
          <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
            <div>
              <span className="text-base font-extrabold text-white block">
                Total Amount Paid / Charged
              </span>
              <span className="text-xs text-white/50">All taxes and charges included</span>
            </div>
            <span className="text-2xl font-black text-[#F59E0B]">
              ₹{(Number(confirmedOrder.totalAmount || confirmedOrder.total || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Track in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/menu"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#262626] hover:bg-white/10 text-white border border-white/10 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-[#F59E0B]" />
            <span>Order More Dishes</span>
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: EMPTY TRAY SCREEN
  // ----------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3F4F6] py-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-[#1A1A1A] rounded-3xl p-10 border border-white/10 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#262626] text-[#F59E0B] flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <ShoppingBag className="w-9 h-9 stroke-[1.6]" />
          </div>
          <h2 className="text-2xl font-bold text-white">No items in your tray</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-sm mx-auto leading-relaxed">
            Please add dishes from our fresh canteen menu before proceeding with checkout.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Canteen Menu</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#262626] hover:bg-white/10 text-white border border-white/10 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: ACTIVE CHECKOUT FORM CONNECTED TO REAL API
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F4F6] py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link to="/" className="hover:text-[#F59E0B] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        <Link to="/cart" className="hover:text-[#F59E0B] transition-colors">
          Cart
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        <span className="font-semibold text-white">Checkout</span>
      </nav>

      {/* Header */}
      <div className="pb-6 border-b border-white/10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Checkout
        </h1>
      </div>

      {/* Main Grid: Form on Left, Review on Right */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Form Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-red-400">Checkout Error</p>
                <p className="text-red-300 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <User className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-bold text-base text-white">
                Customer Details
              </h3>
            </div>

            <div className="space-y-4 pt-1">
              {/* Customer Name (Required by backend) */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter employee full name"
                  className={`w-full text-xs sm:text-sm bg-[#121212] border rounded-2xl px-4 py-3 text-white focus:outline-none transition-colors placeholder:text-white/30 ${
                    fieldErrors.customerName
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-white/10 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]'
                  }`}
                  disabled={isSubmitting}
                />
                {fieldErrors.customerName && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">
                    {fieldErrors.customerName}
                  </p>
                )}
              </div>

              {/* Employee ID & Email (2-Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Corporate Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="e.g. OB-7821"
                    className="w-full text-xs sm:text-sm bg-[#121212] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] placeholder:text-white/30"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="w-full text-xs sm:text-sm bg-[#121212] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] placeholder:text-white/30"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Delivery Option */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <label className="block text-xs font-semibold text-white/80">
                  Delivery Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDeliveryTypeChange('CANTEEN_PICKUP')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.deliveryType === 'CANTEEN_PICKUP'
                        ? 'border-[#F59E0B] bg-[#F59E0B]/15 ring-1 ring-[#F59E0B]'
                        : 'border-white/10 bg-[#121212] hover:bg-white/5'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-white">
                        Counter Pickup
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-1">
                      Express Canteen Counter
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeliveryTypeChange('DESK_DELIVERY')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.deliveryType === 'DESK_DELIVERY'
                        ? 'border-[#F59E0B] bg-[#F59E0B]/15 ring-1 ring-[#F59E0B]'
                        : 'border-white/10 bg-[#121212] hover:bg-white/5'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-white">
                        Desk Delivery
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          formData.deliveryType === 'DESK_DELIVERY'
                            ? 'bg-[#F59E0B]'
                            : 'border border-white/40'
                        }`}
                      ></span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-1">
                      Delivered straight to your office desk
                    </p>
                  </button>
                </div>

                {/* Default Counter Detail (Fixed default, no user input required) */}
                {formData.deliveryType === 'CANTEEN_PICKUP' && (
                  <div className="bg-[#121212] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-white/50 block text-[11px]">Pickup Counter</span>
                      <span className="font-semibold text-white mt-0.5 block">Express Counter 2 • Floor 3</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded-full border border-[#F59E0B]/30">
                      Default Counter
                    </span>
                  </div>
                )}

                {/* Desk Details Input (Required for Desk Delivery) */}
                {formData.deliveryType === 'DESK_DELIVERY' && (
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Desk Details <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="deliveryLocation"
                      value={formData.deliveryLocation}
                      onChange={handleInputChange}
                      placeholder="e.g. Tower A • Floor 4 • Desk 412"
                      className={`w-full text-xs sm:text-sm bg-[#121212] border rounded-2xl px-4 py-3 text-white focus:outline-none transition-colors placeholder:text-white/30 ${
                        fieldErrors.deliveryLocation
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/10 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]'
                      }`}
                      disabled={isSubmitting}
                      autoFocus
                    />
                    {fieldErrors.deliveryLocation && (
                      <p className="text-[11px] text-red-400 font-medium mt-1">
                        {fieldErrors.deliveryLocation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Food Details & Order CTA */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white">Food Details</h3>
              <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                {cartItems.length} {cartItems.length === 1 ? 'Dish' : 'Dishes'}
              </span>
            </div>

            {/* Item Line Review */}
            <div className="divide-y divide-white/10 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={resolveDishImage(item) || fallbackImg}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-contain bg-[#262626] p-1 border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-white/50">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#F59E0B] shrink-0 text-sm">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Bill */}
            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
              <div>
                <span className="font-extrabold text-sm sm:text-base text-white block">
                  Total Bill
                </span>
                <span className="text-[11px] text-white/50">No hidden charges or extra fees</span>
              </div>
              <span className="text-2xl font-black text-[#F59E0B]">
                ₹{cartItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.quantity || 1), 0).toFixed(2)}
              </span>
            </div>

            {/* Primary Order Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-5 rounded-2xl font-black text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-[#F59E0B]/70 text-[#121212] cursor-not-allowed'
                  : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] hover:shadow-lg cursor-pointer active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : !isAuthenticated ? (
                <>
                  <span>Sign In to Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Return Link */}
            <Link
              to="/cart"
              className="w-full py-2.5 rounded-xl text-center text-xs text-white/60 hover:text-white block font-semibold transition-colors"
            >
              Back to Shopping Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
