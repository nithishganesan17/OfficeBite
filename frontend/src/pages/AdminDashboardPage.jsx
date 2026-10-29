import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UserPlus,
  ChefHat,
  ShoppingBag,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BadgeAlert,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  X,
  Coffee,
  Database,
  Server,
  ChevronRight,
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
  createAdminUser,
  getOrders,
  getMenuCatalog,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from '../services/api';

export const AdminDashboardPage = ({ defaultTab = 'overview' }) => {
  const { currentUser, token, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab state: 'overview' | 'users' | 'orders' | 'menu'
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Synchronize activeTab when defaultTab prop changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Users Directory state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'CUSTOMER' | 'STAFF' | 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('');

  // Orders Monitoring state
  const [ordersList, setOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Menu Management state
  const [menuItems, setMenuItems] = useState([]);
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
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      const msg = err.response?.data?.message || 'Failed to load user directory. Ensure you have administrator access.';
      setUsersError(msg);
    } finally {
      setUsersLoading(false);
    }
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
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
      imageUrl: dish.imageUrl || '',
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
      <div className="min-h-[85vh] bg-[#FAF8F2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-red-200 p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
            <BadgeAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#292524]">Access Denied</h2>
          <p className="text-xs text-[#78716C] mt-2 mb-4 leading-relaxed">
            Your current account <strong className="text-[#292524]">({currentUser?.email})</strong> is authorized with role{' '}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F2] border border-[#EDE8DC] text-[#197A50]">
              {currentUser?.role}
            </span>
            . Only accounts with the <strong className="text-red-600">ADMIN</strong> role may access the Administrative Operations Portal.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={currentUser?.role === 'STAFF' ? '/staff' : '/menu'}
              className="py-2.5 px-4 rounded-xl bg-[#197A50] text-white text-xs font-bold shadow-xs hover:bg-[#125B3C] transition-all"
            >
              Go to Authorized {currentUser?.role === 'STAFF' ? 'Kitchen Terminal' : 'Food Menu'}
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true });
              }}
              className="py-2 px-4 rounded-xl border border-[#EDE8DC] text-[#78716C] hover:text-[#292524] text-xs font-bold transition-all hover:bg-[#FAF8F2]"
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
    <div className="min-h-screen bg-[#FAF8F2] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Executive Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EDE8DC] mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#78716C] mb-1">
            <Link to="/" className="hover:text-[#197A50] transition-colors">
              OfficeBite
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#197A50]">Executive Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#292524] tracking-tight flex items-center gap-2.5">
            <span>Admin Control Portal</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#197A50] text-white shadow-xs">
              Live
            </span>
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Manage corporate accounts, provision staff credentials, and monitor real-time canteen operations.
          </p>
        </div>

        {/* Identity Pill & Primary Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-[#EDE8DC] shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#EBF5F0] border border-[#D5E6DC] flex items-center justify-center text-[#197A50] font-bold text-[10px]">
              AD
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-[#292524] block leading-tight">{currentUser?.name}</span>
              <span className="text-[10px] text-[#78716C] block leading-none">{currentUser?.employeeId || 'ADMIN-01'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              fetchUsers();
              fetchOrders();
              fetchMenu();
            }}
            disabled={usersLoading || ordersLoading || menuLoading}
            className="p-2.5 rounded-xl bg-white border border-[#EDE8DC] text-[#78716C] hover:text-[#292524] hover:border-[#D5E6DC] transition-colors shadow-xs cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${usersLoading || ordersLoading || menuLoading ? 'animate-spin text-[#197A50]' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddDish}
            className="px-3.5 py-2.5 rounded-xl bg-[#F28C45] hover:bg-[#DE7B35] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
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
            className="px-4 py-2.5 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#EDE8DC] mb-6 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#197A50] text-white shadow-xs'
              : 'text-[#78716C] hover:text-[#292524] hover:bg-[#FAF8F2]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'menu'
              ? 'bg-[#197A50] text-white shadow-xs'
              : 'text-[#78716C] hover:text-[#292524] hover:bg-[#FAF8F2]'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Menu Catalog</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'menu' ? 'bg-white/20 text-white' : 'bg-[#FAF8F2] text-[#78716C]'
            }`}
          >
            {menuItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#197A50] text-white shadow-xs'
              : 'text-[#78716C] hover:text-[#292524] hover:bg-[#FAF8F2]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Staff</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-[#FAF8F2] text-[#78716C]'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#197A50] text-white shadow-xs'
              : 'text-[#78716C] hover:text-[#292524] hover:bg-[#FAF8F2]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Canteen Orders</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#FAF8F2] text-[#78716C]'
            }`}
          >
            {ordersList.length}
          </span>
        </button>

        <Link
          to="/staff"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#F28C45] hover:bg-[#FFF4EC] transition-all ml-auto whitespace-nowrap"
        >
          <ChefHat className="w-4 h-4" />
          <span>Kitchen Terminal</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW                                  */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Users */}
            <div className="bg-white p-5 rounded-3xl border border-[#EDE8DC] shadow-xs hover:border-[#197A50]/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Registered Accounts</span>
                <div className="w-8 h-8 rounded-xl bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#292524] tracking-tight">{metrics.totalUsers}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#78716C]">
                <span className="text-[#197A50] font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> MySQL Live
                </span>
                <span>• {metrics.customerCount} customers, {metrics.staffCount} staff</span>
              </div>
            </div>

            {/* Metric 2: Kitchen Staff */}
            <div className="bg-white p-5 rounded-3xl border border-[#EDE8DC] shadow-xs hover:border-[#F28C45]/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Kitchen Staff</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EC] text-[#F28C45] flex items-center justify-center">
                  <ChefHat className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#292524] tracking-tight">{metrics.staffCount}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#78716C]">
                <span className="text-[#F28C45] font-bold">Authorized</span>
                <span>• Order fulfillment terminals</span>
              </div>
            </div>

            {/* Metric 3: Canteen Orders */}
            <div className="bg-white p-5 rounded-3xl border border-[#EDE8DC] shadow-xs hover:border-[#197A50]/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Canteen Orders</span>
                <div className="w-8 h-8 rounded-xl bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#292524] tracking-tight">{metrics.totalOrders}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#78716C]">
                <span className="text-[#197A50] font-bold">{metrics.activeOrders} active</span>
                <span>in kitchen queue</span>
              </div>
            </div>

            {/* Metric 4: System Admins */}
            <div className="bg-white p-5 rounded-3xl border border-[#EDE8DC] shadow-xs hover:border-[#197A50]/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Administrators</span>
                <div className="w-8 h-8 rounded-xl bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#292524] tracking-tight">{metrics.adminCount}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#78716C]">
                <span className="text-[#197A50] font-bold">Role.ADMIN</span>
                <span>• Root security access</span>
              </div>
            </div>
          </div>

          {/* Planned Features Notice & Cards (Requirement 9 Compliance: No Fake Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-dashed border-[#EDE8DC] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#A8A29E]" />
                  <h3 className="font-extrabold text-[#292524] text-sm">Revenue & Sales Financials</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FAF8F2] text-[#78716C] border border-[#EDE8DC]">
                  Planned in v2.0
                </span>
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Aggregated daily revenue, average ticket size, and payment reconciliations are scheduled for implementation with the Cafeteria POS integration. No synthetic financial metrics are displayed.
              </p>
              <div className="mt-4 pt-4 border-t border-[#F4EFE6] flex items-center justify-between text-xs text-[#A8A29E]">
                <span>Status: Backend Aggregation Pending</span>
                <span className="font-bold text-[#197A50]">POS Engine Roadmap</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-dashed border-[#EDE8DC] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-[#A8A29E]" />
                  <h3 className="font-extrabold text-[#292524] text-sm">Dining Velocity & Item Analytics</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FAF8F2] text-[#78716C] border border-[#EDE8DC]">
                  Planned in v2.0
                </span>
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Peak cafeteria hours, top-ordered thalis, and prep-time averages will automatically compute once item-level analytics tables are introduced in subsequent database releases.
              </p>
              <div className="mt-4 pt-4 border-t border-[#F4EFE6] flex items-center justify-between text-xs text-[#A8A29E]">
                <span>Status: Telemetry Schema Planned</span>
                <span className="font-bold text-[#197A50]">Analytics Roadmap</span>
              </div>
            </div>
          </div>

          {/* Architecture Status & Quick Actions Bar */}
          <div className="bg-white rounded-3xl border border-[#EDE8DC] p-6 shadow-xs">
            <h3 className="font-extrabold text-[#292524] text-sm mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#197A50]" />
              <span>OfficeBite Platform Health & Runtime Architecture</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#292524] mb-1">
                  <Database className="w-3.5 h-3.5 text-[#197A50]" />
                  <span>MySQL Database</span>
                </div>
                <p className="text-[11px] text-[#78716C]">Schema: <code className="text-[#197A50] font-mono">officebite</code></p>
                <p className="text-[10px] text-[#A8A29E] mt-1">Users & orders tables active</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#292524] mb-1">
                  <Server className="w-3.5 h-3.5 text-[#197A50]" />
                  <span>Spring Boot REST API</span>
                </div>
                <p className="text-[11px] text-[#78716C]">Port: <code className="text-[#197A50] font-mono">8081</code> (Java 21)</p>
                <p className="text-[10px] text-[#A8A29E] mt-1">Health status: UP</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#292524] mb-1">
                  <Lock className="w-3.5 h-3.5 text-[#197A50]" />
                  <span>Security & Tokens</span>
                </div>
                <p className="text-[11px] text-[#78716C]">HMAC-SHA256 (24h Expiry)</p>
                <p className="text-[10px] text-[#A8A29E] mt-1">BCrypt password hashing</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: USERS & STAFF DIRECTORY                             */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Role Filters */}
          <div className="bg-white p-4 rounded-3xl border border-[#EDE8DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or employee ID..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
              />
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-[#A8A29E] hover:text-[#292524]"
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
                    ? 'bg-[#197A50] text-white shadow-xs'
                    : 'bg-[#FAF8F2] text-[#78716C] hover:text-[#292524]'
                }`}
              >
                All Accounts ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('CUSTOMER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'CUSTOMER'
                    ? 'bg-[#197A50] text-white shadow-xs'
                    : 'bg-[#FAF8F2] text-[#78716C] hover:text-[#292524]'
                }`}
              >
                Customers ({metrics.customerCount})
              </button>
              <button
                onClick={() => setRoleFilter('STAFF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'STAFF'
                    ? 'bg-[#F28C45] text-white shadow-xs'
                    : 'bg-[#FAF8F2] text-[#78716C] hover:text-[#292524]'
                }`}
              >
                Kitchen Staff ({metrics.staffCount})
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === 'ADMIN'
                    ? 'bg-[#197A50] text-white shadow-xs'
                    : 'bg-[#FAF8F2] text-[#78716C] hover:text-[#292524]'
                }`}
              >
                Admins ({metrics.adminCount})
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {usersError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{usersError}</span>
              </div>
              <button
                onClick={fetchUsers}
                className="underline font-bold hover:text-red-900 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-[#EDE8DC] shadow-xs overflow-hidden">
            {usersLoading ? (
              <div className="p-12 text-center text-xs text-[#78716C]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#197A50] mb-3" />
                <p className="font-bold">Loading registered users from MySQL...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#78716C]">
                <Users className="w-8 h-8 mx-auto text-[#A8A29E] mb-2" />
                <p className="font-bold text-[#292524]">No accounts match the current filter</p>
                <p className="text-[11px] text-[#A8A29E] mt-1">Try clearing your search query or selecting "All Accounts".</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F2] border-b border-[#EDE8DC] text-[#78716C] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-5">User Details</th>
                      <th className="py-3.5 px-4">Role Clearance</th>
                      <th className="py-3.5 px-4">Employee ID</th>
                      <th className="py-3.5 px-4">Registered On</th>
                      <th className="py-3.5 px-4 text-right">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFE6]">
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
                        <tr key={u.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isAdminRole
                                    ? 'bg-[#EBF5F0] border border-[#D5E6DC] text-[#197A50]'
                                    : isStaffRole
                                    ? 'bg-[#FFF4EC] border border-[#FADCC7] text-[#F28C45]'
                                    : 'bg-[#FAF8F2] border border-[#EDE8DC] text-[#78716C]'
                                }`}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-[#292524]">{u.name}</p>
                                <p className="text-[11px] text-[#78716C]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isAdminRole
                                  ? 'bg-[#197A50] text-white'
                                  : isStaffRole
                                  ? 'bg-[#FFF4EC] text-[#F28C45] border border-[#FADCC7]'
                                  : 'bg-[#FAF8F2] text-[#78716C] border border-[#EDE8DC]'
                              }`}
                            >
                              {isAdminRole && <ShieldCheck className="w-3 h-3" />}
                              {isStaffRole && <ChefHat className="w-3 h-3" />}
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#78716C] font-mono text-[11px]">
                            {u.employeeId || <span className="text-[#A8A29E]">None</span>}
                          </td>
                          <td className="py-3.5 px-4 text-[#78716C] text-[11px]">{formattedDate}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#197A50]">
                              <span className="w-2 h-2 rounded-full bg-[#197A50]"></span> Active
                            </span>
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
          <div className="bg-white p-4 rounded-3xl border border-[#EDE8DC] shadow-xs flex items-center gap-2 overflow-x-auto">
            {['ALL', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  orderStatusFilter === st
                    ? 'bg-[#197A50] text-white shadow-xs'
                    : 'bg-[#FAF8F2] text-[#78716C] hover:text-[#292524]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-[#EDE8DC] shadow-xs overflow-hidden">
            {ordersLoading ? (
              <div className="p-12 text-center text-xs text-[#78716C]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#197A50] mb-3" />
                <p className="font-bold">Loading canteen orders from MySQL...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#78716C]">
                <ShoppingBag className="w-8 h-8 mx-auto text-[#A8A29E] mb-2" />
                <p className="font-bold text-[#292524]">No canteen orders found for status: {orderStatusFilter}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F2] border-b border-[#EDE8DC] text-[#78716C] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-5">Order # / Token</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Items Summary</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Order Placed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFE6]">
                    {filteredOrders.map((ord) => {
                      const dateStr = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—';

                      return (
                        <tr key={ord.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-extrabold text-[#292524]">{ord.orderNumber}</span>
                            <span className="block text-[11px] font-bold text-[#F28C45]">Token: {ord.tokenNumber}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#292524]">{ord.customerName}</p>
                            <p className="text-[11px] text-[#78716C]">{ord.customerEmail || '—'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-[#78716C]">
                            {ord.items?.length || 0} items
                            {ord.deliveryLocation ? ` • ${ord.deliveryLocation}` : ''}
                          </td>
                          <td className="py-3.5 px-4 font-black text-[#292524]">
                            ₹{ord.totalAmount?.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                ord.status === 'COMPLETED'
                                  ? 'bg-[#EBF5F0] text-[#197A50]'
                                  : ord.status === 'PREPARING'
                                  ? 'bg-[#FFF4EC] text-[#F28C45]'
                                  : ord.status === 'REJECTED'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-[#FAF8F2] text-[#78716C] border border-[#EDE8DC]'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-[11px] text-[#78716C]">{dateStr}</td>
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
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE8DC] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Total Catalog</span>
                <div className="w-7 h-7 rounded-lg bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#292524]">{menuMetrics.total}</p>
              <p className="text-[11px] text-[#78716C] mt-1">Dishes in database</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE8DC] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">In Stock</span>
                <div className="w-7 h-7 rounded-lg bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#197A50]">{menuMetrics.inStock}</p>
              <p className="text-[11px] text-[#78716C] mt-1">Active for ordering</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE8DC] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Sold Out</span>
                <div className="w-7 h-7 rounded-lg bg-[#FFF4EC] text-[#F28C45] flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#F28C45]">{menuMetrics.outOfStock}</p>
              <p className="text-[11px] text-[#78716C] mt-1">Temporarily disabled</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE8DC] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Dietary Split</span>
                <div className="w-7 h-7 rounded-lg bg-[#EBF5F0] text-[#197A50] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-[#292524] mt-1">
                <span className="text-[#197A50]">{menuMetrics.vegCount} Veg</span>
                <span className="text-[#78716C] font-normal mx-1">•</span>
                <span className="text-[#B91C1C]">{menuMetrics.nonVegCount} Non-Veg</span>
              </p>
              <p className="text-[11px] text-[#78716C] mt-1">Kitchen classification</p>
            </div>
          </div>

          {/* Menu Search, Filters & Action Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE8DC] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="Search dishes by name, description, badge (e.g. thali, paneer, bestseller)..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                />
                <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-3" />
                {menuSearchQuery && (
                  <button
                    onClick={() => setMenuSearchQuery('')}
                    className="absolute right-3 top-2.5 text-[#A8A29E] hover:text-[#292524]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Switcher & Primary Add Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#FAF8F2] p-1 rounded-xl border border-[#EDE8DC]">
                  <button
                    onClick={() => setMenuViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      menuViewMode === 'grid'
                        ? 'bg-white text-[#197A50] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMenuViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      menuViewMode === 'table'
                        ? 'bg-white text-[#197A50] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                    title="Table view"
                  >
                    <ListFilter className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleOpenAddDish}
                  className="px-4 py-2.5 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EDE8DC]/60 text-xs">
              {/* Category Dropdown/Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Category:
                </span>
                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#EDE8DC] text-xs font-bold text-[#292524] focus:outline-none focus:border-[#197A50]"
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
                <div className="flex items-center bg-[#FAF8F2] p-1 rounded-xl border border-[#EDE8DC]">
                  <button
                    onClick={() => setMenuDietFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuDietFilter === 'ALL'
                        ? 'bg-white text-[#292524] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                  >
                    All Diet
                  </button>
                  <button
                    onClick={() => setMenuDietFilter('VEG')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      menuDietFilter === 'VEG'
                        ? 'bg-[#EBF5F0] text-[#197A50] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#197A50]" />
                    Veg Only
                  </button>
                  <button
                    onClick={() => setMenuDietFilter('NON_VEG')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      menuDietFilter === 'NON_VEG'
                        ? 'bg-red-50 text-red-600 shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Non-Veg
                  </button>
                </div>

                {/* Stock Pills */}
                <div className="flex items-center bg-[#FAF8F2] p-1 rounded-xl border border-[#EDE8DC]">
                  <button
                    onClick={() => setMenuStockFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuStockFilter === 'ALL'
                        ? 'bg-white text-[#292524] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                  >
                    All Stock
                  </button>
                  <button
                    onClick={() => setMenuStockFilter('IN_STOCK')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuStockFilter === 'IN_STOCK'
                        ? 'bg-[#EBF5F0] text-[#197A50] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setMenuStockFilter('OUT_OF_STOCK')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      menuStockFilter === 'OUT_OF_STOCK'
                        ? 'bg-[#FFF4EC] text-[#F28C45] shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524]'
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
            <div className="p-4 rounded-3xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-3 shadow-xs">
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
                <div key={i} className="bg-white rounded-3xl border border-[#EDE8DC] p-4 space-y-3 animate-pulse">
                  <div className="h-40 bg-[#FAF8F2] rounded-2xl w-full" />
                  <div className="h-4 bg-[#FAF8F2] rounded-md w-3/4" />
                  <div className="h-3 bg-[#FAF8F2] rounded-md w-full" />
                  <div className="h-6 bg-[#FAF8F2] rounded-md w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!menuLoading && filteredMenuItems.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#EDE8DC] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] text-[#A8A29E] flex items-center justify-center mx-auto mb-4 border border-[#EDE8DC]">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-[#292524]">No dishes match your filter criteria</h3>
              <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">
                Try searching for a different term or reset your category, dietary, and stock filters.
              </p>
              <button
                onClick={() => {
                  setMenuSearchQuery('');
                  setMenuCategoryFilter('ALL');
                  setMenuDietFilter('ALL');
                  setMenuStockFilter('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EDE8DC] text-[#292524] text-xs font-bold border border-[#EDE8DC] transition-colors cursor-pointer"
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
                  className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col shadow-xs hover:shadow-md ${
                    dish.available ? 'border-[#EDE8DC]' : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  {/* Dish Image & Badges */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#FAF8F2] group">
                    <img
                      src={dish.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                      alt={dish.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Left Badges: Veg indicator & promo badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center bg-white shadow-xs ${
                          dish.vegetarian ? 'border-[#197A50]' : 'border-red-600'
                        }`}
                        title={dish.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            dish.vegetarian ? 'bg-[#197A50]' : 'bg-red-600'
                          }`}
                        />
                      </div>

                      {dish.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F28C45] text-white shadow-xs">
                          {dish.badge}
                        </span>
                      )}
                    </div>

                    {/* Top Right: In-Stock / Out-of-Stock Status Pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs shadow-xs ${
                          dish.available
                            ? 'bg-[#197A50]/90 text-white'
                            : 'bg-stone-900/80 text-amber-300 border border-amber-300/30'
                        }`}
                      >
                        {dish.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Bottom ID Chip */}
                    <div className="absolute bottom-2 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
                        {dish.id}
                      </span>
                    </div>
                  </div>

                  {/* Dish Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F28C45]">
                          {dish.categoryName || dish.category}
                        </span>
                        <span className="text-base font-black text-[#197A50]">₹{dish.price?.toFixed(2)}</span>
                      </div>

                      <h4 className="font-extrabold text-sm text-[#292524] line-clamp-1" title={dish.name}>
                        {dish.name}
                      </h4>

                      <p className="text-[11px] text-[#78716C] line-clamp-2 mt-1 leading-relaxed">
                        {dish.description || 'Delicious freshly prepared canteen dish.'}
                      </p>

                      {/* Metadata Chips: Prep Time, Calories */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#EDE8DC]/60 text-[11px] text-[#78716C]">
                        {dish.prepTime && (
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-[#A8A29E]" />
                            {dish.prepTime}
                          </span>
                        )}
                        {dish.calories && (
                          <span className="flex items-center gap-1 font-medium">
                            <Flame className="w-3 h-3 text-[#A8A29E]" />
                            {dish.calories}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions: Live Availability Switch & Edit/Delete */}
                    <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#EDE8DC]">
                      {/* Availability Quick Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(dish)}
                          disabled={togglingItemId === dish.id}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            dish.available ? 'bg-[#197A50]' : 'bg-stone-300'
                          } ${togglingItemId === dish.id ? 'opacity-50 cursor-wait' : ''}`}
                          title={`Click to mark ${dish.available ? 'Out of Stock' : 'In Stock'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              dish.available ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[11px] font-bold text-[#78716C]">
                          {togglingItemId === dish.id ? 'Saving...' : dish.available ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditDish(dish)}
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-[#197A50] hover:bg-[#EBF5F0] transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDish(dish)}
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-[#EDE8DC] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F2] text-[#78716C] font-extrabold uppercase tracking-wider text-[10px] border-b border-[#EDE8DC]">
                      <th className="py-3.5 px-5">Dish</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Diet</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Prep / Calories</th>
                      <th className="py-3.5 px-4">Availability</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFE6]">
                    {filteredMenuItems.map((dish) => (
                      <tr key={dish.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                        <td className="py-3 px-5 flex items-center gap-3">
                          <img
                            src={dish.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                            alt={dish.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#EDE8DC] shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div>
                            <p className="font-extrabold text-[#292524]">{dish.name}</p>
                            <span className="text-[10px] font-mono text-[#78716C]">{dish.id}</span>
                            {dish.badge && (
                              <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#F28C45] text-white">
                                {dish.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#78716C]">
                          {dish.categoryName || dish.category}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              dish.vegetarian
                                ? 'bg-[#EBF5F0] text-[#197A50]'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {dish.vegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-[#197A50] text-sm">
                          ₹{dish.price?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-[#78716C] text-[11px]">
                          {dish.prepTime || '15 mins'} {dish.calories ? `• ${dish.calories}` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(dish)}
                              disabled={togglingItemId === dish.id}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                dish.available ? 'bg-[#197A50]' : 'bg-stone-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  dish.available ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="text-[11px] font-bold text-[#78716C]">
                              {dish.available ? 'In Stock' : 'Sold Out'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditDish(dish)}
                              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#197A50] hover:bg-[#EBF5F0] transition-colors cursor-pointer"
                              title="Edit Dish"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteDish(dish)}
                              className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EDE8DC] p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DC] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF5F0] border border-[#D5E6DC] flex items-center justify-center text-[#197A50]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#292524]">Provision Privileged User</h3>
                  <p className="text-[11px] text-[#78716C]">Restricted to root administrators</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#FAF8F2] text-[#78716C] hover:text-[#292524] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {createError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-[#EBF5F0] border border-[#D5E6DC] text-[#197A50] text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            {/* Provision Form */}
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateFormData({ ...createFormData, role: 'STAFF' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      createFormData.role === 'STAFF'
                        ? 'bg-[#FFF4EC] border-[#F28C45] text-[#F28C45] shadow-xs'
                        : 'bg-[#FAF8F2] border-[#EDE8DC] text-[#78716C] hover:text-[#292524]'
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
                        ? 'bg-[#EBF5F0] border-[#197A50] text-[#197A50] shadow-xs'
                        : 'bg-[#FAF8F2] border-[#EDE8DC] text-[#78716C] hover:text-[#292524]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator (ADMIN)</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                />
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  placeholder="e.g. ramesh@officebite.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                />
              </div>

              {/* Initial Password */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">
                  Initial Password * <span className="text-[11px] font-normal text-[#78716C]">(min 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#A8A29E] hover:text-[#292524]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">
                  Employee ID <span className="text-[11px] font-normal text-[#78716C]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={createFormData.employeeId}
                  onChange={(e) => setCreateFormData({ ...createFormData, employeeId: e.target.value })}
                  placeholder={createFormData.role === 'ADMIN' ? 'e.g. ADMIN-02' : 'e.g. STAFF-02'}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EDE8DC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EDE8DC] text-[#78716C] hover:text-[#292524] font-bold text-xs hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EDE8DC] p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DC] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF5F0] border border-[#D5E6DC] flex items-center justify-center text-[#197A50]">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#292524]">
                    {editingDish ? `Edit Dish: ${editingDish.name}` : 'Add New Canteen Dish'}
                  </h3>
                  <p className="text-[11px] text-[#78716C]">
                    {editingDish
                      ? `Updating item ID: ${editingDish.id}`
                      : 'Create a new dish in the OfficeBite menu catalog'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDishModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#FAF8F2] text-[#78716C] hover:text-[#292524] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {dishFormError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{dishFormError}</span>
              </div>
            )}
            {dishFormSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-[#EBF5F0] border border-[#D5E6DC] text-[#197A50] text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dishFormSuccess}</span>
              </div>
            )}

            {/* Dish Form */}
            <form onSubmit={handleDishFormSubmit} className="space-y-4">
              {/* Row 1: Dish Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">
                    Dish Name * <span className="text-[11px] font-normal text-[#78716C]">(max 150 chars)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={dishFormData.name}
                    onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                    placeholder="e.g. Paneer Butter Masala"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="1"
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    placeholder="e.g. 140"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                </div>
              </div>

              {/* Row 2: Category & Category Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">Category *</label>
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
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
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">
                    Category Display Name <span className="text-[11px] font-normal text-[#78716C]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={dishFormData.categoryName}
                    onChange={(e) => setDishFormData({ ...dishFormData, categoryName: e.target.value })}
                    placeholder="e.g. Indian Meals"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">
                  Description <span className="text-[11px] font-normal text-[#78716C]">(max 1000 chars)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={dishFormData.description}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  placeholder="Ingredients, preparation details, flavor notes..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                />
              </div>

              {/* Image URL with Preview */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">Dish Image URL</label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={dishFormData.imageUrl}
                    onChange={(e) => setDishFormData({ ...dishFormData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                  {dishFormData.imageUrl && (
                    <img
                      src={dishFormData.imageUrl}
                      alt="Preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      className="w-10 h-10 rounded-xl object-cover border border-[#EDE8DC] shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Prep Time, Calories, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">Prep Time</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={dishFormData.prepTime}
                    onChange={(e) => setDishFormData({ ...dishFormData, prepTime: e.target.value })}
                    placeholder="e.g. 15 mins"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">Calories</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={dishFormData.calories}
                    onChange={(e) => setDishFormData({ ...dishFormData, calories: e.target.value })}
                    placeholder="e.g. 450 kcal"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1.5">
                    Badge <span className="text-[11px] font-normal text-[#78716C]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={dishFormData.badge}
                    onChange={(e) => setDishFormData({ ...dishFormData, badge: e.target.value })}
                    placeholder="e.g. Bestseller, New"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F2] border border-[#EDE8DC] rounded-xl focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]"
                  />
                </div>
              </div>

              {/* Row 4: Vegetarian & Available Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#EDE8DC]/60">
                {/* Diet Classification */}
                <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#EDE8DC] flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-[#292524]">Diet Classification</span>
                    <span className="text-[10px] text-[#78716C]">
                      {dishFormData.vegetarian ? 'Pure Vegetarian (Green)' : 'Non-Vegetarian (Red)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDishFormData({ ...dishFormData, vegetarian: !dishFormData.vegetarian })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      dishFormData.vegetarian ? 'bg-[#197A50]' : 'bg-red-500'
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
                <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#EDE8DC] flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-[#292524]">Stock Status</span>
                    <span className="text-[10px] text-[#78716C]">
                      {dishFormData.available ? 'In Stock (Orderable)' : 'Out of Stock'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDishFormData({ ...dishFormData, available: !dishFormData.available })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      dishFormData.available ? 'bg-[#197A50]' : 'bg-stone-300'
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
                <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#EDE8DC] flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-[#292524]">Popular Tag</span>
                    <span className="text-[10px] text-[#78716C]">Show in Quick Picks</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDishFormData({ ...dishFormData, isPopular: !dishFormData.isPopular })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      dishFormData.isPopular ? 'bg-[#F28C45]' : 'bg-stone-300'
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
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EDE8DC]">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EDE8DC] text-[#78716C] hover:text-[#292524] font-bold text-xs hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dishSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE8DC] p-6 sm:p-7 relative">
            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#EDE8DC] mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#292524]">Delete Menu Item</h3>
                <p className="text-[11px] text-[#78716C]">Permanent removal check</p>
              </div>
            </div>

            {/* Dish Card Summary */}
            <div className="p-3.5 bg-[#FAF8F2] rounded-2xl border border-[#EDE8DC] flex items-center gap-3 mb-4">
              <img
                src={dishToDelete.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                alt={dishToDelete.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#EDE8DC] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-xs text-[#292524] truncate">{dishToDelete.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#78716C]">
                  <span className="font-mono">{dishToDelete.id}</span>
                  <span>•</span>
                  <span className="font-bold text-[#197A50]">₹{dishToDelete.price?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* In-Use Conflict Notice (HTTP 409 Safe Handling) */}
            {isDeleteInUse ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <BadgeAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Referenced in Customer Order History</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90">
                  This dish is referenced in existing customer orders. Deleting it would corrupt past order receipts.
                  To prevent customers from ordering it, safely mark it as <strong>Out of Stock</strong> instead.
                </p>
                <button
                  type="button"
                  onClick={handleMarkOutOfStockInstead}
                  disabled={deleteSubmitting}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Out of Stock Instead</span>
                </button>
              </div>
            ) : deleteError ? (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            ) : (
              <p className="text-xs text-[#78716C] mb-5 leading-relaxed">
                Are you sure you want to delete <strong>'{dishToDelete.name}'</strong>? If this dish has never been ordered, it will be removed permanently.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EDE8DC]">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDishToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#EDE8DC] text-[#78716C] hover:text-[#292524] font-bold text-xs hover:bg-[#FAF8F2] transition-colors cursor-pointer"
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
