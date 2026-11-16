import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ChefHat,
  Users,
  UserPlus,
  UserX,
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BadgeAlert,
  Lock,
  Eye,
  EyeOff,
  X,
  Database,
  Server,
  UtensilsCrossed,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Sparkles,
  Clock,
  Flame,
  LayoutGrid,
  ListFilter,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminUsers,
  getStoredAdminUsers,
  setUserAccessStatus,
  createAdminUser,
  getOrders,
  getInstantOrders,
  getMenuCatalog,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from '../services/api';
import { resolveDishImage, MENU_ITEMS } from '../data/mockData';

export const AdminDashboardPage = ({ defaultTab = 'menu' }) => {
  const { currentUser, token, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab state: 'menu' | 'users' | 'orders'
  const [activeTab, setActiveTab] = useState(defaultTab || 'menu');

  // Synchronize activeTab when defaultTab prop changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab === 'overview' ? 'menu' : defaultTab);
    }
  }, [defaultTab]);

  // Users Directory state - preloaded so directory is immediately available
  const [users, setUsers] = useState(() => getStoredAdminUsers());
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'CUSTOMER' | 'STAFF' | 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('');

  // Orders Monitoring state - preloaded with active canteen orders
  const [ordersList, setOrdersList] = useState(() => getInstantOrders());
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Menu Management state - preloaded with authentic local food menu
  const [menuItems, setMenuItems] = useState(() => {
    return MENU_ITEMS.map((dish) => {
      const freshImg = resolveDishImage(dish);
      return {
        ...dish,
        imageUrl: freshImg,
        image: freshImg,
        available: dish.isAvailable !== false,
        vegetarian: dish.isVeg !== false,
      };
    });
  });
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('ALL');
  const [menuDietFilter, setMenuDietFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [menuStockFilter, setMenuStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'
  const [menuViewMode, setMenuViewMode] = useState('grid'); // 'grid' | 'table'
  const [togglingItemId, setTogglingItemId] = useState(null);

  // Add/Edit Dish Modal state
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null); // null when adding new
  const [dishFormData, setDishFormData] = useState({
    name: '',
    category: 'indian-meals',
    categoryName: 'Indian Meals',
    price: '',
    description: '',
    imageUrl: '',
    vegetarian: true,
    available: true,
    prepTime: '15 mins',
    calories: '450 kcal',
    badge: '',
    isPopular: false,
  });
  const [dishSubmitting, setDishSubmitting] = useState(false);
  const [dishFormError, setDishFormError] = useState(null);
  const [dishFormSuccess, setDishFormSuccess] = useState(null);

  // Delete Dish Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleteInUse, setIsDeleteInUse] = useState(false);

  // Provisioning Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    role: 'STAFF',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);



  // Fetch users from GET /api/admin/users
  const fetchUsers = async () => {
    if (!token || !isAdmin) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await getAdminUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Toggle user access (remove or restore staff and user privileges)
  const handleToggleUserAccess = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.role === 'ADMIN') {
      alert('Administrator master accounts cannot be disabled.');
      return;
    }
    const isCurrentlyRevoked = target.status === 'REVOKED' || target.accessRevoked === true;
    const updated = setUserAccessStatus(userId, !isCurrentlyRevoked);
    setUsers(updated);
  };

  // Fetch canteen orders from GET /api/orders
  const fetchOrders = async () => {
    if (!token || !isAdmin) return;
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      setOrdersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders for admin:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch canteen menu items from GET /api/menu
  const fetchMenu = async () => {
    if (!token || !isAdmin) return;
    setMenuLoading(true);
    setMenuError(null);
    try {
      const data = await getMenuCatalog();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      const msg = err.response?.data?.message || 'Failed to load canteen menu catalog. Please try again.';
      setMenuError(msg);
    } finally {
      setMenuLoading(false);
    }
  };

  // Initial data load when authorized
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
      fetchOrders();
      fetchMenu();
    }
  }, [isAuthenticated, isAdmin]);

  // Toggle Dish Availability
  const handleToggleAvailability = async (dish) => {
    const originalAvailable = dish.available;
    const newAvailable = !originalAvailable;
    setTogglingItemId(dish.id);

    // Optimistic UI update
    setMenuItems((prev) =>
      prev.map((item) => (item.id === dish.id ? { ...item, available: newAvailable } : item))
    );

    try {
      await toggleMenuItemAvailability(dish.id, newAvailable);
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      // Revert optimistic update
      setMenuItems((prev) =>
        prev.map((item) => (item.id === dish.id ? { ...item, available: originalAvailable } : item))
      );
      alert(err.response?.data?.message || 'Failed to update dish availability. Please try again.');
    } finally {
      setTogglingItemId(null);
    }
  };

  // Open Add Dish Modal
  const handleOpenAddDish = () => {
    setEditingDish(null);
    setDishFormData({
      name: '',
      category: 'indian-meals',
      categoryName: 'Indian Meals',
      price: '',
      description: '',
      imageUrl: '/assets/images/deluxe_north_indian_thali.png',
      vegetarian: true,
      available: true,
      prepTime: '15 mins',
      calories: '450 kcal',
      badge: '',
      isPopular: false,
    });
    setDishFormError(null);
    setDishFormSuccess(null);
    setDishModalOpen(true);
  };

  // Open Edit Dish Modal
  const handleOpenEditDish = (dish) => {
    setEditingDish(dish);
    setDishFormData({
      name: dish.name || '',
      category: dish.category || 'indian-meals',
      categoryName: dish.categoryName || '',
      price: dish.price !== undefined ? String(dish.price) : '',
      description: dish.description || '',
      imageUrl: resolveDishImage(dish),
      vegetarian: dish.vegetarian !== undefined ? dish.vegetarian : true,
      available: dish.available !== undefined ? dish.available : true,
      prepTime: dish.prepTime || '15 mins',
      calories: dish.calories || '450 kcal',
      badge: dish.badge || '',
      isPopular: Boolean(dish.isPopular),
    });
    setDishFormError(null);
    setDishFormSuccess(null);
    setDishModalOpen(true);
  };

  // Submit Add or Edit Dish Form
  const handleDishFormSubmit = async (e) => {
    e.preventDefault();
    setDishFormError(null);
    setDishFormSuccess(null);

    if (!dishFormData.name.trim()) {
      setDishFormError('Dish name is required.');
      return;
    }
    const numPrice = parseFloat(dishFormData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setDishFormError('Please enter a valid price greater than zero (e.g. 120).');
      return;
    }
    if (!dishFormData.category.trim()) {
      setDishFormError('Category is required.');
      return;
    }

    setDishSubmitting(true);
    try {
      const categorySlug = dishFormData.category.trim().toLowerCase().replace(/\s+/g, '-');
      const payload = {
        name: dishFormData.name.trim(),
        category: categorySlug,
        categoryName: dishFormData.categoryName.trim() || undefined,
        price: numPrice,
        description: dishFormData.description.trim(),
        imageUrl: dishFormData.imageUrl.trim() || undefined,
        vegetarian: Boolean(dishFormData.vegetarian),
        available: Boolean(dishFormData.available),
        prepTime: dishFormData.prepTime.trim() || '15 mins',
        calories: dishFormData.calories.trim() || '400 kcal',
        badge: dishFormData.badge.trim() || null,
        isPopular: Boolean(dishFormData.isPopular),
      };

      if (editingDish) {
        await updateMenuItem(editingDish.id, payload);
        setDishFormSuccess(`Dish '${dishFormData.name}' updated successfully!`);
      } else {
        await createMenuItem(payload);
        setDishFormSuccess(`New dish '${dishFormData.name}' added to menu catalog!`);
      }

      await fetchMenu();
      setTimeout(() => {
        setDishModalOpen(false);
        setDishFormSuccess(null);
      }, 1200);
    } catch (err) {
      console.error('Dish submission failed:', err);
      const resData = err.response?.data;
      if (resData?.fieldErrors && Object.keys(resData.fieldErrors).length > 0) {
        const errorList = Object.entries(resData.fieldErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(' | ');
        setDishFormError(`Validation error: ${errorList}`);
      } else if (resData?.message) {
        setDishFormError(resData.message);
      } else if (err.message && !err.response) {
        setDishFormError('Network error: Unable to connect to backend server at port 8081. Please ensure the backend is running.');
      } else {
        setDishFormError('Failed to save menu item. Please check all fields and try again.');
      }
    } finally {
      setDishSubmitting(false);
    }
  };

  // Open Safe Delete Modal
  const handleOpenDeleteDish = (dish) => {
    setDishToDelete(dish);
    setDeleteError(null);
    setIsDeleteInUse(false);
    setDeleteModalOpen(true);
  };

  // Confirm Dish Deletion
  const handleConfirmDelete = async () => {
    if (!dishToDelete) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    setIsDeleteInUse(false);

    try {
      await deleteMenuItem(dishToDelete.id);
      await fetchMenu();
      setDeleteModalOpen(false);
      setDishToDelete(null);
    } catch (err) {
      console.error('Delete dish failed:', err);
      if (err.response?.status === 409 || err.response?.data?.error === 'MENU_ITEM_IN_USE') {
        setIsDeleteInUse(true);
        setDeleteError(
          err.response?.data?.message ||
            `Cannot delete '${dishToDelete.name}' because it is referenced in past customer orders. You can safely mark it as Out of Stock instead.`
        );
      } else {
        setDeleteError(err.response?.data?.message || 'Failed to delete dish. Please try again.');
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Action to disable in stock instead of deleting
  const handleMarkOutOfStockInstead = async () => {
    if (!dishToDelete) return;
    setDeleteSubmitting(true);
    try {
      await toggleMenuItemAvailability(dishToDelete.id, false);
      await fetchMenu();
      setDeleteModalOpen(false);
      setDishToDelete(null);
    } catch (err) {
      console.error('Failed to mark out of stock:', err);
      setDeleteError(err.response?.data?.message || 'Failed to update stock status.');
    } finally {
      setDeleteSubmitting(false);
    }
  };



  // Handle privileged account creation (POST /api/admin/users)
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    // Client-side validations matching DTO constraints
    if (!createFormData.name.trim()) {
      setCreateError('Full name is required.');
      return;
    }
    if (!createFormData.email.trim() || !createFormData.email.includes('@')) {
      setCreateError('A valid corporate email address is required.');
      return;
    }
    if (!createFormData.password || createFormData.password.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload = {
        name: createFormData.name.trim(),
        email: createFormData.email.trim().toLowerCase(),
        password: createFormData.password,
        employeeId: createFormData.employeeId.trim() || null,
        role: createFormData.role,
      };

      const created = await createAdminUser(payload);
      setCreateSuccess(`Successfully created ${created.role} account for ${created.name} (${created.email}).`);
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        employeeId: '',
        role: 'STAFF',
      });
      // Refresh directory
      await fetchUsers();
      setTimeout(() => {
        setModalOpen(false);
        setCreateSuccess(null);
      }, 1800);
    } catch (err) {
      console.error('Failed to create privileged user:', err);
      if (err.response?.status === 409) {
        setCreateError(`An account with email '${createFormData.email}' already exists.`);
      } else if (err.response?.data?.message) {
        setCreateError(err.response.data.message);
      } else {
        setCreateError('Failed to provision account. Please check field requirements and try again.');
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Metrics computation from real live data
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const staffCount = users.filter((u) => u.role === 'STAFF').length;
    const adminCount = users.filter((u) => u.role === 'ADMIN').length;
    const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;

    const totalOrders = ordersList.length;
    const activeOrders = ordersList.filter(
      (o) => o.status === 'PLACED' || o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY'
    ).length;

    return { totalUsers, staffCount, adminCount, customerCount, totalOrders, activeOrders };
  }, [users, ordersList]);

  // Filtered users list based on role pills & search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.employeeId?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  // Filtered orders list based on status
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'ALL') return ordersList;
    return ordersList.filter((o) => o.status === orderStatusFilter);
  }, [ordersList, orderStatusFilter]);

  // Filtered menu items based on search, category, diet, and stock
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const q = menuSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q);

      const matchesCategory =
        menuCategoryFilter === 'ALL' || item.category?.toLowerCase() === menuCategoryFilter.toLowerCase();

      const matchesDiet =
        menuDietFilter === 'ALL' ||
        (menuDietFilter === 'VEG' && item.vegetarian) ||
        (menuDietFilter === 'NON_VEG' && !item.vegetarian);

      const matchesStock =
        menuStockFilter === 'ALL' ||
        (menuStockFilter === 'IN_STOCK' && item.available) ||
        (menuStockFilter === 'OUT_OF_STOCK' && !item.available);

      return matchesSearch && matchesCategory && matchesDiet && matchesStock;
    });
  }, [menuItems, menuSearchQuery, menuCategoryFilter, menuDietFilter, menuStockFilter]);

  // Menu metrics
  const menuMetrics = useMemo(() => {
    const total = menuItems.length;
    const inStock = menuItems.filter((i) => i.available).length;
    const outOfStock = total - inStock;
    const vegCount = menuItems.filter((i) => i.vegetarian).length;
    const nonVegCount = total - vegCount;
    return { total, inStock, outOfStock, vegCount, nonVegCount };
  }, [menuItems]);

  // -------------------------------------------------------------
  // GUARD 1: User is unauthenticated -> Redirect to /admin/login
  // -------------------------------------------------------------
  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // -------------------------------------------------------------
  // GUARD 2: User is authenticated but NOT an ADMIN -> Access Denied
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] bg-[#121212] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1A1A1A] rounded-3xl shadow-2xl border border-red-500/30 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
            <BadgeAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-xs text-white/60 mt-2 mb-4 leading-relaxed">
            Your current account <strong className="text-white">({currentUser?.email})</strong> is authorized with role{' '}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-[#F59E0B]">
              {currentUser?.role}
            </span>
            . Only accounts with the <strong className="text-[#F59E0B]">ADMIN</strong> role may access the Administrative Operations Portal.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={currentUser?.role === 'STAFF' ? '/staff' : '/menu'}
              className="py-2.5 px-4 rounded-xl bg-[#F59E0B] text-black text-xs font-black shadow-md hover:bg-[#D97706] transition-all"
            >
              Go to Authorized {currentUser?.role === 'STAFF' ? 'Staff Portal' : 'Food Menu'}
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true });
              }}
              className="py-2 px-4 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-bold transition-all hover:bg-white/5 cursor-pointer"
            >
              Sign Out & Switch to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN ADMIN DASHBOARD (Authenticated as ADMIN)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#121212] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#F3F4F6]">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Control Portal
          </h1>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleOpenAddDish}
            className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dish</span>
          </button>

          <button
            onClick={() => {
              setCreateError(null);
              setCreateSuccess(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-white/10 text-white font-bold text-xs border border-white/20 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1A1A1A] border border-white/10 mb-6 shadow-md overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('menu');
            navigate('/admin/menu');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'menu'
              ? 'bg-[#F59E0B] text-black font-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Menu Catalog</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'menu' ? 'bg-black/20 text-black' : 'bg-[#121212] text-white/60'
            }`}
          >
            {menuItems.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            navigate('/admin/users');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#F59E0B] text-black font-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Staff</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'users' ? 'bg-black/20 text-black' : 'bg-[#121212] text-white/60'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            navigate('/admin/orders');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#F59E0B] text-black font-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Canteen Orders</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'orders' ? 'bg-black/20 text-black' : 'bg-[#121212] text-white/60'
            }`}
          >
            {ordersList.length}
          </span>
        </button>
      </div>



      {/* ========================================================= */}
      {/* TAB 2: USERS & STAFF DIRECTORY                             */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Role Filters */}
          <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or employee ID..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-white/50 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'ALL'
                    ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                    : 'bg-[#121212] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                All Accounts ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('CUSTOMER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'CUSTOMER'
                    ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                    : 'bg-[#121212] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Customers ({metrics.customerCount})
              </button>
              <button
                onClick={() => setRoleFilter('STAFF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'STAFF'
                    ? 'bg-orange-500 text-white font-bold shadow-xs'
                    : 'bg-[#121212] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Kitchen Staff ({metrics.staffCount})
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'ADMIN'
                    ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                    : 'bg-[#121212] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Admins ({metrics.adminCount})
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {usersError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{usersError}</span>
              </div>
              <button
                onClick={fetchUsers}
                className="underline font-bold hover:text-red-200 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xs overflow-hidden">
            {usersLoading ? (
              <div className="p-12 text-center text-xs text-white/60">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#F59E0B] mb-3" />
                <p className="font-bold text-white">Loading...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-white/60">
                <Users className="w-8 h-8 mx-auto text-white/40 mb-2" />
                <p className="font-bold text-white">No accounts match the current filter</p>
                <p className="text-[11px] text-white/40 mt-1">Try clearing your search query or selecting "All Accounts".</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#121212] border-b border-white/10 text-white/60 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-5">User Details</th>
                      <th className="py-3.5 px-4">Role Clearance</th>
                      <th className="py-3.5 px-4">Employee ID</th>
                      <th className="py-3.5 px-4">Registered On</th>
                      <th className="py-3.5 px-4 text-center">Account Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((u) => {
                      const isAdminRole = u.role === 'ADMIN';
                      const isStaffRole = u.role === 'STAFF';
                      const formattedDate = u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—';

                      return (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isAdminRole
                                    ? 'bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B]'
                                    : isStaffRole
                                    ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                                    : 'bg-white/10 border border-white/10 text-white/70'
                                }`}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-[11px] text-white/60">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isAdminRole
                                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                                  : isStaffRole
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                  : 'bg-white/10 text-white/70 border border-white/10'
                              }`}
                            >
                              {isAdminRole && <ShieldCheck className="w-3 h-3" />}
                              {isStaffRole && <ChefHat className="w-3 h-3" />}
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-white/60 font-mono text-[11px]">
                            {u.employeeId || <span className="text-white/40">None</span>}
                          </td>
                          <td className="py-3.5 px-4 text-white/60 text-[11px]">{formattedDate}</td>
                          <td className="py-3.5 px-4 text-center">
                            {u.status === 'REVOKED' || u.accessRevoked ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Access Revoked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isAdminRole ? (
                              <span className="text-[11px] text-white/40 italic">Master Admin</span>
                            ) : (
                              <button
                                onClick={() => handleToggleUserAccess(u.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs active:scale-95 ${
                                  u.status === 'REVOKED' || u.accessRevoked
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                                }`}
                                title={
                                  u.status === 'REVOKED' || u.accessRevoked
                                    ? `Restore access for ${u.name}`
                                    : `Remove access for ${u.name}`
                                }
                              >
                                {u.status === 'REVOKED' || u.accessRevoked ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Restore Access</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Remove Access</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CANTEEN ORDERS HUB                                  */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Status Filter Bar */}
          <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-white/10 shadow-xs flex items-center gap-2 overflow-x-auto">
            {['ALL', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  orderStatusFilter === st
                    ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                    : 'bg-[#121212] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xs overflow-hidden">
            {ordersLoading ? (
              <div className="p-12 text-center text-xs text-white/60">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#F59E0B] mb-3" />
                <p className="font-bold text-white">Loading...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-white/60">
                <ShoppingBag className="w-8 h-8 mx-auto text-white/40 mb-2" />
                <p className="font-bold text-white">No canteen orders found for status: {orderStatusFilter}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#121212] border-b border-white/10 text-white/60 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-5">Order # / Token</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Items Summary</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Order Placed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredOrders.map((ord) => {
                      const dateStr = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—';

                      return (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-extrabold text-white">{ord.orderNumber}</span>
                            <span className="block text-[11px] font-bold text-[#F59E0B]">Token: {ord.tokenNumber}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white">{ord.customerName}</p>
                            <p className="text-[11px] text-white/60">{ord.customerEmail || '—'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-white/60">
                            {ord.items?.length || 0} items
                            {ord.deliveryLocation ? ` • ${ord.deliveryLocation}` : ''}
                          </td>
                          <td className="py-3.5 px-4 font-black text-white">
                            ₹{ord.totalAmount?.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                ord.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : ord.status === 'PREPARING'
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : ord.status === 'REJECTED'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-[11px] text-white/60">{dateStr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MENU MANAGEMENT                                   */}
      {/* ========================================================= */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Menu Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#1A1A1A] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Total Catalog</span>
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{menuMetrics.total}</p>
              <p className="text-[11px] text-white/50 mt-1">Dishes in database</p>
            </div>

            <div className="bg-[#1A1A1A] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">In Stock</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">{menuMetrics.inStock}</p>
              <p className="text-[11px] text-white/50 mt-1">Active for ordering</p>
            </div>

            <div className="bg-[#1A1A1A] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Sold Out</span>
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-orange-400">{menuMetrics.outOfStock}</p>
              <p className="text-[11px] text-white/50 mt-1">Temporarily disabled</p>
            </div>

            <div className="bg-[#1A1A1A] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Dietary Split</span>
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-white mt-1">
                <span className="text-emerald-400">{menuMetrics.vegCount} Veg</span>
                <span className="text-white/40 font-normal mx-1">•</span>
                <span className="text-red-400">{menuMetrics.nonVegCount} Non-Veg</span>
              </p>
              <p className="text-[11px] text-white/50 mt-1">Kitchen classification</p>
            </div>
          </div>

          {/* Menu Search, Filters & Action Controls */}
          <div className="bg-[#1A1A1A] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="Search dishes by name, description, badge (e.g. thali, paneer, bestseller)..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                {menuSearchQuery && (
                  <button
                    onClick={() => setMenuSearchQuery('')}
                    className="absolute right-3 top-2.5 text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Switcher & Primary Add Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#121212] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setMenuViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      menuViewMode === 'grid'
                        ? 'bg-[#F59E0B] text-black shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMenuViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      menuViewMode === 'table'
                        ? 'bg-[#F59E0B] text-black shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title="Table view"
                  >
                    <ListFilter className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleOpenAddDish}
                  className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#d98b06] text-black font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
              {/* Category Dropdown/Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#F59E0B]" /> Category:
                </span>
                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#121212] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="ALL">All Categories ({menuItems.length})</option>
                  <option value="indian-meals">Indian Meals</option>
                  <option value="dosa">Dosa & Crepes</option>
                  <option value="idli">Idli Specials</option>
                  <option value="biryani">Dum Biryani</option>
                  <option value="rice-bowls">Rice Bowls</option>
                  <option value="sandwiches">Sandwiches</option>
                  <option value="snacks">Crispy Snacks</option>
                  <option value="coffee">Filter Coffee & Tea</option>
                  <option value="juice">Fresh Juices</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              {/* Diet & Stock Pills */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Diet Pills */}
                <div className="flex items-center bg-[#121212] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setMenuDietFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuDietFilter === 'ALL'
                        ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    All Diet
                  </button>
                  <button
                    onClick={() => setMenuDietFilter('VEG')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      menuDietFilter === 'VEG'
                        ? 'bg-emerald-500/30 text-emerald-400 font-bold shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Veg Only
                  </button>
                  <button
                    onClick={() => setMenuDietFilter('NON_VEG')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      menuDietFilter === 'NON_VEG'
                        ? 'bg-red-500/30 text-red-400 font-bold shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Non-Veg
                  </button>
                </div>

                {/* Stock Pills */}
                <div className="flex items-center bg-[#121212] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setMenuStockFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuStockFilter === 'ALL'
                        ? 'bg-[#F59E0B] text-black font-black shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    All Stock
                  </button>
                  <button
                    onClick={() => setMenuStockFilter('IN_STOCK')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuStockFilter === 'IN_STOCK'
                        ? 'bg-emerald-500/30 text-emerald-400 font-bold shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setMenuStockFilter('OUT_OF_STOCK')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuStockFilter === 'OUT_OF_STOCK'
                        ? 'bg-orange-500/30 text-orange-400 font-bold shadow-xs'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error State Banner */}
          {menuError && (
            <div className="p-4 rounded-3xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{menuError}</span>
              </div>
              <button
                onClick={fetchMenu}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton State */}
          {menuLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-3xl border border-white/10 p-4 space-y-3 animate-pulse">
                  <div className="h-40 bg-[#121212] rounded-2xl w-full" />
                  <div className="h-4 bg-[#121212] rounded-md w-3/4" />
                  <div className="h-3 bg-[#121212] rounded-md w-full" />
                  <div className="h-6 bg-[#121212] rounded-md w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!menuLoading && filteredMenuItems.length === 0 && (
            <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] text-white/40 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-white">No dishes match your filter criteria</h3>
              <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                Try searching for a different term or reset your category, dietary, and stock filters.
              </p>
              <button
                onClick={() => {
                  setMenuSearchQuery('');
                  setMenuCategoryFilter('ALL');
                  setMenuDietFilter('ALL');
                  setMenuStockFilter('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#121212] hover:bg-white/5 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Grid View of Menu Items */}
          {!menuLoading && menuViewMode === 'grid' && filteredMenuItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredMenuItems.map((dish) => (
                <div
                  key={dish.id}
                  className={`bg-[#1A1A1A] rounded-3xl border transition-all overflow-hidden flex flex-col shadow-xs hover:border-white/20 ${
                    dish.available ? 'border-white/10' : 'border-amber-500/30 bg-amber-950/10'
                  }`}
                >
                  {/* Dish Image & Badges */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#121212] group">
                    <img
                      src={resolveDishImage(dish)}
                      alt={dish.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/showcase_thali_royal.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Left Badges: Veg indicator & promo badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center bg-[#121212] shadow-xs ${
                          dish.vegetarian ? 'border-emerald-500' : 'border-red-500'
                        }`}
                        title={dish.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            dish.vegetarian ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                      </div>

                      {dish.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F59E0B] text-black shadow-xs">
                          {dish.badge}
                        </span>
                      )}
                    </div>

                    {/* Top Right: In-Stock / Out-of-Stock Status Pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs shadow-xs ${
                          dish.available
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-stone-900/90 text-amber-300 border border-amber-300/30'
                        }`}
                      >
                        {dish.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Bottom ID Chip */}
                    <div className="absolute bottom-2 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 text-white/80 border border-white/10 backdrop-blur-xs">
                        {dish.id}
                      </span>
                    </div>
                  </div>

                  {/* Dish Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F59E0B]">
                          {dish.categoryName || dish.category}
                        </span>
                        <span className="text-base font-black text-white">₹{dish.price?.toFixed(2)}</span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white line-clamp-1" title={dish.name}>
                        {dish.name}
                      </h4>

                      <p className="text-[11px] text-white/60 line-clamp-2 mt-1 leading-relaxed">
                        {dish.description || 'Delicious freshly prepared canteen dish.'}
                      </p>

                      {/* Metadata Chips: Prep Time, Calories */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 text-[11px] text-white/50">
                        {dish.prepTime && (
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-white/40" />
                            {dish.prepTime}
                          </span>
                        )}
                        {dish.calories && (
                          <span className="flex items-center gap-1 font-medium">
                            <Flame className="w-3 h-3 text-white/40" />
                            {dish.calories}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions: Live Availability Switch & Edit/Delete */}
                    <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/10">
                      {/* Availability Quick Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(dish)}
                          disabled={togglingItemId === dish.id}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            dish.available ? 'bg-emerald-500' : 'bg-white/20'
                          } ${togglingItemId === dish.id ? 'opacity-50 cursor-wait' : ''}`}
                          title={`Click to mark ${dish.available ? 'Out of Stock' : 'In Stock'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              dish.available ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[11px] font-bold text-white/60">
                          {togglingItemId === dish.id ? 'Saving...' : dish.available ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditDish(dish)}
                          className="p-1.5 rounded-lg text-white/60 hover:text-[#F59E0B] hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDish(dish)}
                          className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View of Menu Items */}
          {!menuLoading && menuViewMode === 'table' && filteredMenuItems.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#121212] text-white/60 font-extrabold uppercase tracking-wider text-[10px] border-b border-white/10">
                      <th className="py-3.5 px-5">Dish</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Diet</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Prep / Calories</th>
                      <th className="py-3.5 px-4">Availability</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredMenuItems.map((dish) => (
                      <tr key={dish.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-5 flex items-center gap-3">
                          <img
                            src={resolveDishImage(dish)}
                            alt={dish.name}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/images/showcase_thali_royal.png';
                            }}
                          />
                          <div>
                            <p className="font-extrabold text-white">{dish.name}</p>
                            <span className="text-[10px] font-mono text-white/50">{dish.id}</span>
                            {dish.badge && (
                              <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-black bg-[#F59E0B] text-black">
                                {dish.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-white/70">
                          {dish.categoryName || dish.category}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              dish.vegetarian
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {dish.vegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-white text-sm">
                          ₹{dish.price?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-white/60 text-[11px]">
                          {dish.prepTime || '15 mins'} {dish.calories ? `• ${dish.calories}` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(dish)}
                              disabled={togglingItemId === dish.id}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                dish.available ? 'bg-emerald-500' : 'bg-white/20'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  dish.available ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="text-[11px] font-bold text-white/60">
                              {dish.available ? 'In Stock' : 'Sold Out'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditDish(dish)}
                              className="p-1.5 rounded-lg text-white/60 hover:text-[#F59E0B] hover:bg-white/5 transition-colors cursor-pointer"
                              title="Edit Dish"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteDish(dish)}
                              className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PROVISION PRIVILEGED ACCOUNT (POST /api/admin/users) */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1A1A1A] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Provision Privileged User</h3>
                  <p className="text-[11px] text-white/60">Restricted to root administrators</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {createError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            {/* Provision Form */}
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateFormData({ ...createFormData, role: 'STAFF' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      createFormData.role === 'STAFF'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-xs'
                        : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Kitchen Staff (STAFF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateFormData({ ...createFormData, role: 'ADMIN' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      createFormData.role === 'ADMIN'
                        ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] shadow-xs'
                        : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator (ADMIN)</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  placeholder="e.g. ramesh@officebite.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              {/* Initial Password */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Initial Password * <span className="text-[11px] font-normal text-white/50">(min 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Employee ID <span className="text-[11px] font-normal text-white/50">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={createFormData.employeeId}
                  onChange={(e) => setCreateFormData({ ...createFormData, employeeId: e.target.value })}
                  placeholder={createFormData.role === 'ADMIN' ? 'e.g. ADMIN-02' : 'e.g. STAFF-02'}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white font-bold text-xs hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#d98b06] text-black font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {createSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Provision {createFormData.role} Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MENU ITEM                                */}
      {/* ========================================================= */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#1A1A1A] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingDish ? `Edit Dish: ${editingDish.name}` : 'Add New Canteen Dish'}
                  </h3>
                  <p className="text-[11px] text-white/60">
                    {editingDish
                      ? `Updating item ID: ${editingDish.id}`
                      : 'Create a new dish in the OfficeBite menu catalog'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDishModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {dishFormError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{dishFormError}</span>
              </div>
            )}
            {dishFormSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dishFormSuccess}</span>
              </div>
            )}

            {/* Dish Form */}
            <form onSubmit={handleDishFormSubmit} className="space-y-4">
              {/* Row 1: Dish Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Dish Name * <span className="text-[11px] font-normal text-white/50">(max 150 chars)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={dishFormData.name}
                    onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                    placeholder="e.g. Paneer Butter Masala"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="1"
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    placeholder="e.g. 140"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Row 2: Category & Category Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Category *</label>
                  <select
                    value={dishFormData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const catNames = {
                        'indian-meals': 'Indian Meals',
                        dosa: 'Dosa & Crepes',
                        idli: 'Idli Specials',
                        biryani: 'Dum Biryani',
                        'rice-bowls': 'Rice Bowls',
                        sandwiches: 'Sandwiches',
                        snacks: 'Crispy Snacks',
                        coffee: 'Filter Coffee & Tea',
                        juice: 'Fresh Juices',
                        desserts: 'Desserts',
                      };
                      setDishFormData({
                        ...dishFormData,
                        category: cat,
                        categoryName: catNames[cat] || dishFormData.categoryName,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  >
                    <option value="indian-meals">Indian Meals</option>
                    <option value="dosa">Dosa & Crepes</option>
                    <option value="idli">Idli Specials</option>
                    <option value="biryani">Dum Biryani</option>
                    <option value="rice-bowls">Rice Bowls</option>
                    <option value="sandwiches">Sandwiches</option>
                    <option value="snacks">Crispy Snacks</option>
                    <option value="coffee">Filter Coffee & Tea</option>
                    <option value="juice">Fresh Juices</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Category Display Name <span className="text-[11px] font-normal text-white/50">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={dishFormData.categoryName}
                    onChange={(e) => setDishFormData({ ...dishFormData, categoryName: e.target.value })}
                    placeholder="e.g. Indian Meals"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Description <span className="text-[11px] font-normal text-white/50">(max 1000 chars)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={dishFormData.description}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  placeholder="Ingredients, preparation details, flavor notes..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              {/* Image URL with Preview */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Dish Image URL</label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={dishFormData.imageUrl}
                    onChange={(e) => setDishFormData({ ...dishFormData, imageUrl: e.target.value })}
                    placeholder="/assets/images/showcase_thali_royal.png"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                  {dishFormData.imageUrl && (
                    <img
                      src={dishFormData.imageUrl}
                      alt="Preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Prep Time, Calories, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Prep Time</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={dishFormData.prepTime}
                    onChange={(e) => setDishFormData({ ...dishFormData, prepTime: e.target.value })}
                    placeholder="e.g. 15 mins"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Calories</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={dishFormData.calories}
                    onChange={(e) => setDishFormData({ ...dishFormData, calories: e.target.value })}
                    placeholder="e.g. 450 kcal"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Badge <span className="text-[11px] font-normal text-white/50">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={dishFormData.badge}
                    onChange={(e) => setDishFormData({ ...dishFormData, badge: e.target.value })}
                    placeholder="e.g. Bestseller, New"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#121212] border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Row 4: Vegetarian & Available Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                {/* Diet Classification */}
                <div className="bg-[#121212] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white">Diet Classification</span>
                    <span className="text-[10px] text-white/60">
                      {dishFormData.vegetarian ? 'Pure Vegetarian (Green)' : 'Non-Vegetarian (Red)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDishFormData({ ...dishFormData, vegetarian: !dishFormData.vegetarian })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      dishFormData.vegetarian ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                        dishFormData.vegetarian ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Stock Status */}
                <div className="bg-[#121212] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white">Stock Status</span>
                    <span className="text-[10px] text-white/60">
                      {dishFormData.available ? 'In Stock (Orderable)' : 'Out of Stock'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDishFormData({ ...dishFormData, available: !dishFormData.available })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      dishFormData.available ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                        dishFormData.available ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Popular Feature */}
                <div className="bg-[#121212] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white">Popular Tag</span>
                    <span className="text-[10px] text-white/60">Show in Quick Picks</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDishFormData({ ...dishFormData, isPopular: !dishFormData.isPopular })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      dishFormData.isPopular ? 'bg-[#F59E0B]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                        dishFormData.isPopular ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white font-bold text-xs hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dishSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#d98b06] text-black font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {dishSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Dish...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingDish ? 'Save Changes' : 'Create Menu Item'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SAFE DELETE CONFIRMATION                            */}
      {/* ========================================================= */}
      {deleteModalOpen && dishToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1A1A1A] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-7 relative text-white">
            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Menu Item</h3>
                <p className="text-[11px] text-white/60">Permanent removal check</p>
              </div>
            </div>

            {/* Dish Card Summary */}
            <div className="p-3.5 bg-[#121212] rounded-2xl border border-white/10 flex items-center gap-3 mb-4">
              <img
                src={resolveDishImage(dishToDelete)}
                alt={dishToDelete.name}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/showcase_thali_royal.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-xs text-white truncate">{dishToDelete.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/60">
                  <span className="font-mono text-white/50">{dishToDelete.id}</span>
                  <span>•</span>
                  <span className="font-bold text-[#F59E0B]">₹{dishToDelete.price?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* In-Use Conflict Notice (HTTP 409 Safe Handling) */}
            {isDeleteInUse ? (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs mb-5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <BadgeAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Referenced in Customer Order History</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  This dish is referenced in existing customer orders. Deleting it would corrupt past order receipts.
                  To prevent customers from ordering it, safely mark it as <strong>Out of Stock</strong> instead.
                </p>
                <button
                  type="button"
                  onClick={handleMarkOutOfStockInstead}
                  disabled={deleteSubmitting}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#d98b06] text-black font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Out of Stock Instead</span>
                </button>
              </div>
            ) : deleteError ? (
              <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            ) : (
              <p className="text-xs text-white/70 mb-5 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">'{dishToDelete.name}'</strong>? If this dish has never been ordered, it will be removed permanently.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDishToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white font-bold text-xs hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {!isDeleteInUse && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {deleteSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Dish</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
