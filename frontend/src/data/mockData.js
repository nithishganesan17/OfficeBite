export const CATEGORIES = [
  { id: 'all', name: 'All Dishes', icon: 'UtensilsCrossed' },
  { id: 'indian-meals', name: 'Indian Meals', icon: 'Flame' },
  { id: 'dosa', name: 'Dosa & Crepes', icon: 'Sparkles' },
  { id: 'idli', name: 'Idli Specials', icon: 'Sun' },
  { id: 'biryani', name: 'Dum Biryani', icon: 'Crown' },
  { id: 'rice-bowls', name: 'Rice Bowls', icon: 'Soup' },
  { id: 'sandwiches', name: 'Sandwiches', icon: 'Layers' },
  { id: 'snacks', name: 'Crispy Snacks', icon: 'Cookie' },
  { id: 'coffee', name: 'Filter Coffee & Tea', icon: 'Coffee' },
  { id: 'juice', name: 'Fresh Juices', icon: 'Citrus' },
  { id: 'desserts', name: 'Desserts', icon: 'IceCream' },
];

export const MENU_ITEMS = [
  // --- Indian Meals ---
  {
    id: 'dish-1',
    name: 'Deluxe North Indian Thali',
    category: 'indian-meals',
    categoryName: 'Indian Meals',
    description: 'Slow-cooked Paneer Butter Masala, Dal Makhani, 2 Butter Rotis, fragrant Jeera Rice, Gulab Jamun, Papad & Mint Salad.',
    price: 180,
    rating: 4.9,
    reviewsCount: 342,
    prepTime: '15 mins',
    calories: '680 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    alt: 'Authentic Indian thali meal platter with curries, roti and rice'
  },
  {
    id: 'dish-2',
    name: 'Executive South Indian Thali',
    category: 'indian-meals',
    categoryName: 'Indian Meals',
    description: 'Steamed Sona Masoori Rice, Madras Sambar, Pepper Rasam, Poriyal, Kootu, Curd, Crispy Appalam & Semiya Payasam.',
    price: 160,
    rating: 4.8,
    reviewsCount: 228,
    prepTime: '12 mins',
    calories: '590 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Healthy Choice',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    alt: 'South Indian thali meal with rice, sambar, and traditional side curries'
  },
  {
    id: 'dish-3',
    name: 'Paneer Tikka Rice Platter',
    category: 'indian-meals',
    categoryName: 'Indian Meals',
    description: 'Char-grilled cottage cheese skewers in smoky tandoori marinade, served over spiced saffron pilaf with fresh mint raita.',
    price: 175,
    rating: 4.7,
    reviewsCount: 185,
    prepTime: '14 mins',
    calories: '540 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'High Protein',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    alt: 'Paneer tikka skewers with aromatic spiced rice'
  },

  // --- Dosa ---
  {
    id: 'dish-4',
    name: 'Mysore Masala Dosa',
    category: 'dosa',
    categoryName: 'Dosa & Crepes',
    description: 'Crisp golden fermented rice crepe layered with spicy red garlic-chili chutney, stuffed with tempered potato mash, served with 3 chutneys & sambar.',
    price: 110,
    rating: 4.9,
    reviewsCount: 412,
    prepTime: '10 mins',
    calories: '380 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Crowd Favorite',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    alt: 'Crisp Mysore masala dosa served with fresh coconut chutneys and sambar'
  },
  {
    id: 'dish-5',
    name: 'Ghee Roast Paper Dosa',
    category: 'dosa',
    categoryName: 'Dosa & Crepes',
    description: 'Ultra-thin, paper-crisp golden dosa roasted with pure desi ghee, dusted with aromatic gun powder (karam podi).',
    price: 125,
    rating: 4.8,
    reviewsCount: 198,
    prepTime: '8 mins',
    calories: '420 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Desi Ghee',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    alt: 'Thin paper roast dosa served hot with coconut dip'
  },
  {
    id: 'dish-6',
    name: 'Paneer Bhurji Stuffed Dosa',
    category: 'dosa',
    categoryName: 'Dosa & Crepes',
    description: 'Crunchy golden crepe stuffed with fresh crumbled paneer tossed with cumin, green chilies, onions, and fresh coriander.',
    price: 145,
    rating: 4.7,
    reviewsCount: 164,
    prepTime: '12 mins',
    calories: '450 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Chef Special',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    alt: 'Freshly made paneer dosa with side dips'
  },

  // --- Idli ---
  {
    id: 'dish-7',
    name: 'Ghee Podi Button Idlis (14 pcs)',
    category: 'idli',
    categoryName: 'Idli Specials',
    description: 'Bite-sized pillow-soft steamed idlis tossed generously in hot melted ghee and roasted spicy lentil gunpowder.',
    price: 95,
    rating: 4.9,
    reviewsCount: 310,
    prepTime: '8 mins',
    calories: '320 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    alt: 'Steamed South Indian idlis with coconut chutney and hot sambar'
  },
  {
    id: 'dish-8',
    name: 'Classic Steamed Idli-Vada Combo',
    category: 'idli',
    categoryName: 'Idli Specials',
    description: 'Two fluffy steamed rice cakes paired with one crunchy golden medu vada, served with piping hot piping sambar & mint chutney.',
    price: 85,
    rating: 4.8,
    reviewsCount: 280,
    prepTime: '7 mins',
    calories: '340 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Morning Star',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    alt: 'Traditional South Indian idli and crispy vada breakfast plate'
  },

  // --- Biryani ---
  {
    id: 'dish-9',
    name: 'Royal Veg Dum Biryani',
    category: 'biryani',
    categoryName: 'Dum Biryani',
    description: 'Long-grain aged basmati rice slow-cooked in handi with seasonal vegetables, brown onions, saffron, and fresh mint. Served with cucumber raita.',
    price: 195,
    rating: 4.9,
    reviewsCount: 520,
    prepTime: '15 mins',
    calories: '580 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Chef Signature',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    alt: 'Fragrant vegetable biryani garnished with fried onions and mint leaves'
  },
  {
    id: 'dish-10',
    name: 'Paneer Makhani Biryani Bowl',
    category: 'biryani',
    categoryName: 'Dum Biryani',
    description: 'Marinated soft paneer cubes cooked in velvet makhani gravy layered with spiced basmati biryani rice and toasted cashews.',
    price: 215,
    rating: 4.8,
    reviewsCount: 290,
    prepTime: '15 mins',
    calories: '640 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Rich & Creamy',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    alt: 'Paneer biryani served in a traditional clay pot'
  },

  // --- Rice Bowls ---
  {
    id: 'dish-11',
    name: 'Dal Makhani & Jeera Rice Bowl',
    category: 'rice-bowls',
    categoryName: 'Rice Bowls',
    description: '24-hour slow-simmered black urad lentils infused with butter, cream, and ginger, served alongside fluffy jeera rice and sirka onions.',
    price: 140,
    rating: 4.9,
    reviewsCount: 375,
    prepTime: '10 mins',
    calories: '490 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Comfort Bowl',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    alt: 'Dal makhani rice bowl topped with fresh cream and coriander'
  },
  {
    id: 'dish-12',
    name: 'Punjabi Rajma Chawal Bowl',
    category: 'rice-bowls',
    categoryName: 'Rice Bowls',
    description: 'Homestyle red kidney beans slow-braised in a roasted onion-tomato gravy, served over steaming basmati rice with lime & green chili.',
    price: 135,
    rating: 4.8,
    reviewsCount: 260,
    prepTime: '10 mins',
    calories: '460 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Classic',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    alt: 'Homestyle rajma chawal bowl with pickled onions'
  },
  {
    id: 'dish-13',
    name: 'Amritsari Chole Rice Bowl',
    category: 'rice-bowls',
    categoryName: 'Rice Bowls',
    description: 'Dark, tangy chickpeas stewed with tea leaves and roasted spices, paired with fragrant basmati rice and tangy kachumber salad.',
    price: 140,
    rating: 4.7,
    reviewsCount: 195,
    prepTime: '10 mins',
    calories: '470 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Spicy Delight',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    alt: 'Amritsari chole bowl with seasoned rice'
  },

  // --- Sandwiches ---
  {
    id: 'dish-14',
    name: 'Bombay Grilled Veg Club Sandwich',
    category: 'sandwiches',
    categoryName: 'Sandwiches',
    description: 'Triple-decker grilled sandwich packed with spiced potato masala, crisp cucumber, ripe tomatoes, Amul cheese & spicy mint chutney.',
    price: 110,
    rating: 4.9,
    reviewsCount: 380,
    prepTime: '10 mins',
    calories: '390 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Office Favorite',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    alt: 'Grilled gourmet vegetable sandwich cut in triangles with cheese pull'
  },
  {
    id: 'dish-15',
    name: 'Paneer Tikka Focaccia Melt',
    category: 'sandwiches',
    categoryName: 'Sandwiches',
    description: 'Artisan rosemary focaccia filled with tandoori paneer, caramelized onions, capsicum, and melted mozzarella.',
    price: 135,
    rating: 4.8,
    reviewsCount: 215,
    prepTime: '12 mins',
    calories: '440 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Artisan',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    alt: 'Toasted gourmet paneer panini sandwich'
  },

  // --- Snacks ---
  {
    id: 'dish-16',
    name: 'Punjabi Samosa Platter (2 pcs)',
    category: 'snacks',
    categoryName: 'Crispy Snacks',
    description: 'Golden, flaky handmade pastry crust stuffed with spiced potatoes, green peas, and cashews. Served with tamarind & spicy mint dips.',
    price: 60,
    rating: 4.9,
    reviewsCount: 460,
    prepTime: '5 mins',
    calories: '280 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Evening Hit',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    alt: 'Golden crispy samosas served with sweet tamarind chutney'
  },
  {
    id: 'dish-17',
    name: 'Crispy Medu Vada (2 pcs)',
    category: 'snacks',
    categoryName: 'Crispy Snacks',
    description: 'Crispy golden fried lentil donuts with a soft, airy center, seasoned with black pepper, curry leaves, and ginger. Served with hot sambar.',
    price: 70,
    rating: 4.7,
    reviewsCount: 185,
    prepTime: '6 mins',
    calories: '260 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Crispy Gold',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    alt: 'Golden crispy medu vada with fresh coconut chutney'
  },

  // --- Coffee & Tea ---
  {
    id: 'dish-18',
    name: 'Madras Filter Coffee (Traditional Tumbler)',
    category: 'coffee',
    categoryName: 'Filter Coffee & Tea',
    description: 'Authentic South Indian chicory blend decoction poured back and forth with frothy full-cream milk in a traditional stainless tumbler.',
    price: 40,
    rating: 4.95,
    reviewsCount: 620,
    prepTime: '4 mins',
    calories: '110 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    alt: 'Freshly brewed artisan coffee with thick golden crema'
  },
  {
    id: 'dish-19',
    name: 'Cold Brew Hazelnut Latte',
    category: 'coffee',
    categoryName: 'Filter Coffee & Tea',
    description: '16-hour slow steeped Arabica cold brew poured over ice, lightly sweetened with roasted hazelnut syrup and chilled oat milk.',
    price: 95,
    rating: 4.8,
    reviewsCount: 240,
    prepTime: '3 mins',
    calories: '140 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Energizing',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    alt: 'Iced cold brew coffee latte with glass and ice cubes'
  },

  // --- Fresh Juices ---
  {
    id: 'dish-20',
    name: 'Cold-Pressed Valencia Orange Juice',
    category: 'juice',
    categoryName: 'Fresh Juices',
    description: '100% natural, freshly squeezed sweet citrus juice with zero added sugar or preservatives. Rich in immunity-boosting Vitamin C.',
    price: 95,
    rating: 4.9,
    reviewsCount: 310,
    prepTime: '5 mins',
    calories: '110 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: '100% Pure',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    alt: 'Chilled glass of fresh pure orange juice with fruit slices'
  },
  {
    id: 'dish-21',
    name: 'Watermelon Mint Hydration Cooler',
    category: 'juice',
    categoryName: 'Fresh Juices',
    description: 'Fresh seedless watermelon crushed with garden mint leaves, a squeeze of key lime, and Himalayan pink rock salt.',
    price: 80,
    rating: 4.8,
    reviewsCount: 195,
    prepTime: '4 mins',
    calories: '75 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Refreshing',
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80',
    alt: 'Chilled pink watermelon juice with mint sprig in tall glass'
  },

  // --- Desserts ---
  {
    id: 'dish-22',
    name: 'Warm Shahi Gulab Jamun (2 pcs)',
    category: 'desserts',
    categoryName: 'Desserts',
    description: 'Golden brown fried khoya dumplings soaked in fragrant green cardamom and saffron rose syrup, garnished with slivered pistachios.',
    price: 65,
    rating: 4.9,
    reviewsCount: 380,
    prepTime: '3 mins',
    calories: '240 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Melt-in-Mouth',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    alt: 'Warm gulab jamun in rich golden sugar syrup garnished with pistachios'
  },
  {
    id: 'dish-23',
    name: 'Royal Kesar Pista Rasmalai (2 pcs)',
    category: 'desserts',
    categoryName: 'Desserts',
    description: 'Delicate, spongy cottage cheese patties steeped in thickened saffron-infused whole milk with crushed pistachios & almonds.',
    price: 85,
    rating: 4.9,
    reviewsCount: 290,
    prepTime: '3 mins',
    calories: '210 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Chef Choice',
    image: 'https://images.unsplash.com/photo-1505253758473-96b46deae27c?auto=format&fit=crop&w=800&q=80',
    alt: 'Chilled saffron rasmalai dessert topped with sliced nuts'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'OB-8492',
    tokenNumber: 'A-42',
    placedAt: 'Today, 1:15 PM',
    status: 'PREPARING',
    statusLabel: 'Kitchen is Preparing',
    statusColor: 'emerald',
    deliveryType: 'CANTEEN_PICKUP',
    deliveryLocation: 'Express Counter 2 • Floor 3',
    estimatedMinutes: 8,
    items: [
      { menuItemId: 'dish-4', name: 'Mysore Masala Dosa', quantity: 1, price: 110 },
      { menuItemId: 'dish-18', name: 'Authentic Madras Filter Coffee', quantity: 1, price: 40 }
    ],
    subtotal: 150,
    tax: 7.50,
    total: 157.50,
    specialInstructions: 'Extra coconut chutney and crispy dosa please'
  },
  {
    id: 'OB-8411',
    tokenNumber: 'B-19',
    placedAt: 'Today, 12:40 PM',
    status: 'READY',
    statusLabel: 'Ready for Pickup',
    statusColor: 'orange',
    deliveryType: 'CANTEEN_PICKUP',
    deliveryLocation: 'Hot Meal Counter 1 • Floor 3',
    estimatedMinutes: 0,
    items: [
      { menuItemId: 'dish-1', name: 'Deluxe North Indian Thali', quantity: 1, price: 180 },
      { menuItemId: 'dish-20', name: 'Cold-Pressed Valencia Orange Juice', quantity: 1, price: 95 }
    ],
    subtotal: 275,
    tax: 13.75,
    total: 288.75,
    specialInstructions: 'Pack papad separately'
  },
  {
    id: 'OB-8205',
    tokenNumber: 'D-08',
    placedAt: 'Yesterday, 1:20 PM',
    status: 'DELIVERED',
    statusLabel: 'Delivered to Desk',
    statusColor: 'gray',
    deliveryType: 'DESK_DELIVERY',
    deliveryLocation: 'Tower A • 4th Floor • Desk 412',
    estimatedMinutes: 0,
    items: [
      { menuItemId: 'dish-9', name: 'Royal Veg Dum Biryani', quantity: 1, price: 195 },
      { menuItemId: 'dish-22', name: 'Warm Shahi Gulab Jamun (2 pcs)', quantity: 1, price: 65 }
    ],
    subtotal: 260,
    tax: 13.00,
    total: 273.00,
    specialInstructions: 'Left with reception team'
  }
];

/**
 * Resolves any dish item (or name/synthetic ID) to its authoritative canonical dish from the catalog.
 * Guarantees that canonical MySQL dish IDs ('dish-1', 'dish-20', etc.) are used everywhere.
 */
export const getCanonicalDish = (item) => {
  if (!item) return null;

  // 1. Direct ID match if it's already a valid canonical ID
  const directId = item.menuItemId || item.id;
  if (directId && typeof directId === 'string' && directId.startsWith('dish-') && !directId.includes('reorder')) {
    const found = MENU_ITEMS.find((d) => d.id === directId);
    if (found) return found;
  }

  // 2. Extract clean name to match
  const rawName = (item.name || item.itemName || (typeof item === 'string' ? item : '')).trim();
  if (!rawName) return null;
  const lowerName = rawName.toLowerCase();

  // Try exact match first
  let found = MENU_ITEMS.find((d) => d.name.toLowerCase() === lowerName);
  if (found) return found;

  // Try substring / fuzzy contains match (e.g. "Warm Shahi Gulab Jamun" vs "Warm Shahi Gulab Jamun (2 pcs)")
  found = MENU_ITEMS.find((d) => {
    const dLower = d.name.toLowerCase();
    return dLower.includes(lowerName) || lowerName.includes(dLower);
  });
  if (found) return found;

  // Try matching synthetic slug (e.g. dish-reorder-cold-pressed-valencia-orange-juice -> cold pressed valencia orange juice)
  if (typeof directId === 'string' && directId.includes('dish-reorder-')) {
    const slugName = directId.replace('dish-reorder-', '').replace(/-/g, ' ').toLowerCase();
    found = MENU_ITEMS.find((d) => d.name.toLowerCase().includes(slugName) || slugName.includes(d.name.toLowerCase()));
    if (found) return found;
  }

  return null;
};

