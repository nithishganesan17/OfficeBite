export const CATEGORIES = [
  {
    id: 'all',
    name: 'All Dishes',
    icon: 'UtensilsCrossed',
    image: '/assets/images/showcase_thali_royal.png',
  },
  {
    id: 'indian-meals',
    name: 'Indian Meals',
    icon: 'Flame',
    image: '/assets/images/showcase_thali_deluxe.png',
  },
  {
    id: 'dosa',
    name: 'Dosa & Crepes',
    icon: 'Sparkles',
    image: '/assets/images/showcase_masala_dosa.png',
  },
  {
    id: 'idli',
    name: 'Idli Specials',
    icon: 'Sun',
    image: '/assets/images/showcase_steamed_idli.png',
  },
  {
    id: 'biryani',
    name: 'Dum Biryani',
    icon: 'Crown',
    image: '/assets/images/biryani_bowl_nobg.png',
  },
  {
    id: 'rice-bowls',
    name: 'Rice Bowls',
    icon: 'Soup',
    image: '/assets/images/jeera_rice_bowl.png',
  },
  {
    id: 'sandwiches',
    name: 'Sandwiches',
    icon: 'Layers',
    image: '/assets/images/club_sandwich.png',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: 'Cookie',
    image: '/assets/images/samosa_platter.png',
  },
  {
    id: 'coffee',
    name: 'Filter Coffee & Tea',
    icon: 'Coffee',
    image: '/assets/images/filter_coffee.png',
  },
  {
    id: 'juice',
    name: 'Fresh Juices',
    icon: 'Citrus',
    image: '/assets/images/fresh_juice_varieties.png',
  },
];

export const MENU_ITEMS = [
  // --- Indian Meals ---
  {
    id: 'dish-1',
    name: 'Deluxe North Indian Thali',
    category: 'indian-meals',
    categoryName: 'Indian Meals',
    description: 'Authentic royal spread: 3 hot whole-wheat rotis, steamed basmati rice, aromatic dal fry, homestyle spiced sabzi, chole masala, fresh cucumber raita & traditional pickles.',
    price: 180,
    rating: 4.9,
    reviewsCount: 342,
    prepTime: '15 mins',
    calories: '680 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Bestseller',
    image: '/assets/images/deluxe_north_indian_thali.png',
    alt: 'Deluxe North Indian thali meal platter with rotis, rice, dal, curries, and raita'
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
    image: '/assets/images/executive_south_indian_thali.png',
    alt: 'Executive South Indian thali meal platter with rice, sambar, and traditional side curries'
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
    image: '/assets/images/showcase_paneer_tikka.png',
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
    image: '/assets/images/mysore_masala_dosa.png',
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
    image: '/assets/images/ghee_roast_paper_dosa.png',
    alt: 'Crisp golden ghee roast paper dosa with melting butter, served with sambar and traditional chutneys'
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
    image: '/assets/images/paneer_bhurji_dosa.png',
    alt: 'Freshly made paneer bhurji dosa with three chutneys on black plate'
  },

  // --- Idli ---
  {
    id: 'dish-7',
    name: 'Ghee Podi Button Idlis (14 pcs)',
    category: 'idli',
    categoryName: 'Idli Specials',
    description: 'Bite-sized pillow-soft steamed idlis tossed generously in hot melted ghee and roasted spicy lentil gunpowder, served with coconut chutney & sambar.',
    price: 95,
    rating: 4.9,
    reviewsCount: 310,
    prepTime: '8 mins',
    calories: '320 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Bestseller',
    image: '/assets/images/ghee_podi_button_idlis.png',
    alt: 'Golden ghee podi button idlis on banana leaf with coconut chutney and hot sambar'
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
    image: '/assets/images/showcase_steamed_idli.png',
    alt: 'Traditional South Indian idli and crispy vada breakfast plate'
  },

  // --- Biryani ---
  {
    id: 'dish-9',
    name: 'Royal Chicken Dum Biryani',
    category: 'biryani',
    categoryName: 'Dum Biryani',
    description: 'Long-grain aged basmati rice slow-cooked on dum with tender spiced chicken, brown onions, saffron, and fresh mint. Served with cucumber raita.',
    price: 195,
    rating: 4.9,
    reviewsCount: 520,
    prepTime: '15 mins',
    calories: '580 kcal',
    isVeg: false,
    isPopular: true,
    isAvailable: true,
    badge: 'Chef Signature',
    image: '/assets/images/chicken_dum_biryani_bowl.png',
    alt: 'Royal chicken dum biryani garnished with fried onions and mint leaves'
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
    image: '/assets/images/veg_paneer_biryani_bowl.png',
    alt: 'Paneer biryani served in a traditional clay pot'
  },

  // --- Rice Bowls ---
  {
    id: 'dish-11',
    name: 'Fragrant Ghee Jeera Rice Bowl',
    category: 'rice-bowls',
    categoryName: 'Rice Bowls',
    description: 'Aromatic long-grain basmati rice tempered with whole roasted cumin seeds (jeera), pure desi ghee, and fresh green coriander. Served hot with comforting lentils.',
    price: 130,
    rating: 4.9,
    reviewsCount: 375,
    prepTime: '8 mins',
    calories: '420 kcal',
    isVeg: true,
    isPopular: true,
    isAvailable: true,
    badge: 'Jeera Special',
    image: '/assets/images/fragrant_ghee_jeera_rice_bowl.png',
    alt: 'Fragrant ghee jeera rice bowl topped with melting golden desi ghee, roasted cumin seeds, fresh coriander, and a brass bowl of warm ghee'
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
    image: '/assets/images/rajma_chawal_bowl.png',
    alt: 'Homestyle rajma chawal bowl with pickled onions'
  },
  {
    id: 'dish-13',
    name: 'Amritsari Chole Rice Bowl',
    category: 'rice-bowls',
    categoryName: 'Rice Bowls',
    description: 'Tangy spiced Amritsari chole and slow-cooked Kashmiri rajma served over fragrant steamed basmati rice with sliced red onions and fresh coriander.',
    price: 140,
    rating: 4.7,
    reviewsCount: 195,
    prepTime: '10 mins',
    calories: '470 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Spicy Delight',
    image: '/assets/images/amritsari_chole_rice_bowl.png',
    alt: 'Amritsari chole and rajma rice bowl with sliced onions'
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
    image: '/assets/images/club_sandwich.png',
    alt: 'Grilled gourmet club sandwich with cheese pull'
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
    image: '/assets/images/paneer_tikka_focaccia_melt.png',
    alt: 'Artisan grilled rosemary focaccia melt stuffed with spiced tandoori paneer, peppers, melted mozzarella cheese pull, and fresh mint chutney'
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
    image: '/assets/images/samosa_platter.png',
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
    image: '/assets/images/medu_vada_platter.png',
    alt: 'Crispy golden medu vada platter with coconut on banana leaf'
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
    image: '/assets/images/madras_filter_coffee.png',
    alt: 'Traditional frothy Madras filter coffee served in authentic brass davarah and tumbler on dark slate coaster with roasted coffee beans'
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
    image: '/assets/images/cold_brew_hazelnut_latte.png',
    alt: 'Iced cold brew hazelnut latte with cream swirls and roasted hazelnuts on dark slate coaster'
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
    image: '/assets/images/cold_pressed_valencia_orange_juice.png',
    alt: 'Chilled glass of fresh cold-pressed Valencia orange juice with mint and orange slices on dark slate platter'
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
    image: '/assets/images/watermelon_mint_hydration_cooler.png',
    alt: 'Refreshing iced watermelon mint cooler with fresh watermelon slices on dark slate coaster'
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
    image: '/assets/images/warm_shahi_gulab_jamun.png',
    alt: 'Warm gulab jamun in rich golden sugar syrup garnished with pistachios'
  },
  {
    id: 'dish-23',
    name: 'Royal Kesar Pista Rasmalai (2 pcs)',
    category: 'desserts',
    categoryName: 'Desserts',
    description: 'Delicate, spongy cottage cheese patties steeped in thickened saffron-infused whole milk with crushed pistachios, almonds & fragrant rose petals.',
    price: 85,
    rating: 4.9,
    reviewsCount: 290,
    prepTime: '3 mins',
    calories: '210 kcal',
    isVeg: true,
    isPopular: false,
    isAvailable: true,
    badge: 'Chef Choice',
    image: '/assets/images/royal_kesar_pista_rasmalai.png',
    alt: 'Chilled saffron rasmalai dessert steeped in thickened milk with pistachios and rose petals'
  },
  {
    id: 'dish-24',
    name: 'Chettinad Pepper Chicken Bowl',
    category: 'rice-bowls',
    categoryName: 'Rice Bowls',
    categoryAlias: ['rice-bowls', 'RICE_BOWLS', 'indian-meals'],
    description: 'Tender chicken braised in freshly roasted black pepper, fennel, curry leaves and coconut gravy, served over steaming hot basmati rice.',
    price: 185,
    rating: 4.9,
    reviewsCount: 340,
    prepTime: '12 mins',
    calories: '540 kcal',
    isVeg: false,
    isPopular: true,
    isAvailable: true,
    badge: 'Spicy Signature',
    image: '/assets/images/chicken_dum_biryani_bowl.png',
    alt: 'Chettinad pepper chicken bowl served with fragrant basmati rice'
  },
  {
    id: 'dish-25',
    name: 'Grilled Chicken Tikka Focaccia Melt',
    category: 'sandwiches',
    categoryName: 'Sandwiches',
    categoryAlias: ['sandwiches', 'SANDWICHES'],
    description: 'Smoky tandoori chicken tikka, caramelized onions, crisp bell peppers, and melted mozzarella cheese inside warm toasted rosemary focaccia.',
    price: 155,
    rating: 4.8,
    reviewsCount: 230,
    prepTime: '10 mins',
    calories: '490 kcal',
    isVeg: false,
    isPopular: false,
    isAvailable: true,
    badge: 'Artisan Melt',
    image: '/assets/images/paneer_tikka_focaccia_melt.png',
    alt: 'Toasted focaccia melt stuffed with smoky chicken tikka and melted cheese'
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

/**
 * 5 Main Signature Dishes for Homepage Showcase Carousel.
 * Clean, premium selection of flagship royal dishes:
 * 1. Royal North Indian Thali
 * 2. Mysore Masala Paper Dosa
 * 3. Royal Idli & Medu Vada Platter
 * 4. Royal Chicken Dum Biryani
 * 5. Tandoori Paneer Tikka Platter
 */
export const HOMEPAGE_SIGNATURE_DISHES = [
  {
    id: 'showcase-paneer-tikka',
    name: 'Tandoori Paneer Tikka Platter',
    badge: 'Tandoor Signature',
    rating: 4.8,
    reviewsCount: 265,
    price: 175,
    prepTime: '12-15 mins',
    description:
      'Charcoal-roasted cottage cheese skewers infused with Kashmiri red chillies, mustard oil, thick hung curd, roasted bell peppers, charred red onions, and tangy mint-coriander chutney.',
    image: '/assets/images/showcase_paneer_tikka.png',
    imageUrl: '/assets/images/showcase_paneer_tikka.png',
    category: 'snacks',
    categoryAlias: ['snacks', 'SNACKS'],
    isVeg: true,
  },
  {
    id: 'showcase-masala-dosa',
    name: 'Golden Crispy Masala Dosa',
    badge: 'South Indian Classic',
    rating: 4.9,
    reviewsCount: 410,
    price: 125,
    prepTime: '8-10 mins',
    description:
      'Crispy, golden-roasted thin rice crepe served on a fresh banana leaf with piping-hot drumstick sambar and tempered coconut chutney.',
    image: '/assets/images/showcase_masala_dosa.png',
    imageUrl: '/assets/images/showcase_masala_dosa.png',
    category: 'dosa',
    categoryAlias: ['dosa', 'SOUTH_INDIAN', 'south-indian'],
    isVeg: true,
  },
  {
    id: 'showcase-steamed-idli',
    name: 'Royal Steamed Idli Platter',
    badge: 'Morning Special',
    rating: 4.9,
    reviewsCount: 310,
    price: 110,
    prepTime: '6-8 mins',
    description:
      'Pillow-soft steamed idlis sprinkled with mustard seeds and curry leaves on fresh banana leaf, paired with rich vegetable sambar and thick coconut chutney.',
    image: '/assets/images/showcase_steamed_idli.png',
    imageUrl: '/assets/images/showcase_steamed_idli.png',
    category: 'idli',
    categoryAlias: ['idli', 'BREAKFAST', 'south-indian'],
    isVeg: true,
  },
  {
    id: 'showcase-thali-deluxe',
    name: 'Royal North Indian Thali',
    badge: "Chef's Royal Thali",
    rating: 4.9,
    reviewsCount: 320,
    price: 180,
    prepTime: '15-20 mins',
    description:
      'A majestic spread of fragrant basmati rice, rich slow-simmered dal makhani, paneer butter masala, seasonal sabzi, hot phulkas, fresh salad, and traditional accompaniments.',
    image: '/assets/images/showcase_thali_deluxe.png',
    imageUrl: '/assets/images/showcase_thali_deluxe.png',
    category: 'indian-meals',
    categoryAlias: ['indian-meals', 'MEALS', 'north-indian', 'all'],
    isVeg: true,
  },
  {
    id: 'showcase-biryani',
    name: 'Royal Chicken Dum Biryani',
    badge: "Chef's Signature",
    rating: 4.9,
    reviewsCount: 520,
    price: 195,
    prepTime: '15-20 mins',
    description:
      'Long-grain fragrant basmati rice slow-cooked on dum with tender spiced chicken, saffron strands, fresh mint, caramelized onions, and house-blended royal potli masala.',
    image: '/assets/images/biryani_bowl_nobg.png',
    imageUrl: '/assets/images/biryani_bowl_nobg.png',
    category: 'biryani',
    categoryAlias: ['biryani', 'BIRYANI', 'rice-bowls'],
    isVeg: false,
  },
];

/**
 * 5 Showcase dishes matching the uploaded and cleanly extracted transparent PNGs.
 * Ordered exactly as requested:
 * 1. Masala Dosa
 * 2. Paneer Tikka
 * 3. North Indian Thali
 * 4. Idli
 * 5. Another North Indian food platter (Heritage Royal Thali Feast)
 */
export const SHOWCASE_DISHES = [
  {
    id: 'showcase-thali-deluxe',
    name: 'Royal North Indian Thali',
    badge: "Chef's Royal Thali",
    rating: 4.9,
    reviewsCount: 320,
    price: 180,
    prepTime: '15-20 mins',
    description:
      'A majestic spread of fragrant basmati rice, rich slow-simmered dal makhani, paneer butter masala, seasonal sabzi, hot phulkas, fresh salad, and traditional accompaniments.',
    image: '/assets/images/showcase_thali_deluxe.png',
    imageUrl: '/assets/images/showcase_thali_deluxe.png',
    category: 'indian-meals',
    categoryAlias: ['indian-meals', 'MEALS', 'north-indian', 'all'],
    isVeg: true,
  },
  {
    id: 'showcase-masala-dosa',
    name: 'Golden Crispy Masala Dosa',
    badge: 'South Indian Classic',
    rating: 4.9,
    reviewsCount: 410,
    price: 125,
    prepTime: '8-10 mins',
    description:
      'Crispy, golden-roasted thin rice crepe served on a fresh banana leaf with piping-hot drumstick sambar and tempered coconut chutney.',
    image: '/assets/images/showcase_masala_dosa.png',
    imageUrl: '/assets/images/showcase_masala_dosa.png',
    category: 'dosa',
    categoryAlias: ['dosa', 'SOUTH_INDIAN', 'south-indian'],
    isVeg: true,
  },
  {
    id: 'showcase-paneer-dosa',
    name: 'Artisan Paneer Bhurji Dosa',
    badge: 'Chef Special',
    rating: 4.8,
    reviewsCount: 164,
    price: 145,
    prepTime: '10-12 mins',
    description:
      'Crunchy golden crepe stuffed with fresh spiced paneer bhurji, served with coconut chutney, mint chutney, and spicy tomato chutney.',
    image: '/assets/images/paneer_bhurji_dosa.png',
    imageUrl: '/assets/images/paneer_bhurji_dosa.png',
    category: 'dosa',
    categoryAlias: ['dosa', 'SOUTH_INDIAN', 'south-indian'],
    isVeg: true,
  },
  {
    id: 'showcase-steamed-idli',
    name: 'Royal Steamed Idli Platter',
    badge: 'Morning Special',
    rating: 4.9,
    reviewsCount: 310,
    price: 110,
    prepTime: '6-8 mins',
    description:
      'Pillow-soft steamed idlis sprinkled with mustard seeds and curry leaves on fresh banana leaf, paired with rich vegetable sambar and thick coconut chutney.',
    image: '/assets/images/showcase_steamed_idli.png',
    imageUrl: '/assets/images/showcase_steamed_idli.png',
    category: 'idli',
    categoryAlias: ['idli', 'BREAKFAST', 'south-indian'],
    isVeg: true,
  },
  {
    id: 'showcase-biryani',
    name: 'Royal Chicken Dum Biryani',
    badge: "Chef's Signature",
    rating: 4.9,
    reviewsCount: 520,
    price: 195,
    prepTime: '15-20 mins',
    description:
      'Long-grain fragrant basmati rice slow-cooked on dum with tender spiced chicken, saffron strands, fresh mint, caramelized onions, and house-blended royal potli masala.',
    image: '/assets/images/biryani_bowl_nobg.png',
    imageUrl: '/assets/images/biryani_bowl_nobg.png',
    category: 'biryani',
    categoryAlias: ['biryani', 'BIRYANI', 'rice-bowls'],
    isVeg: false,
  },
  {
    id: 'showcase-paneer-tikka',
    name: 'Tandoori Paneer Tikka Platter',
    badge: 'Tandoor Signature',
    rating: 4.8,
    reviewsCount: 265,
    price: 175,
    prepTime: '12-15 mins',
    description:
      'Charcoal-roasted cottage cheese skewers infused with Kashmiri red chillies, mustard oil, thick hung curd, roasted bell peppers, charred red onions, and tangy mint-coriander chutney.',
    image: '/assets/images/showcase_paneer_tikka.png',
    imageUrl: '/assets/images/showcase_paneer_tikka.png',
    category: 'snacks',
    categoryAlias: ['snacks', 'SNACKS'],
    isVeg: true,
  },
  {
    id: 'showcase-samosa',
    name: 'Crispy Punjabi Samosa Platter',
    badge: 'Evening Hit',
    rating: 4.9,
    reviewsCount: 460,
    price: 60,
    prepTime: '5-8 mins',
    description:
      'Golden, flaky handmade pastry crust stuffed with spiced potatoes, green peas, and cashews. Served with tamarind & spicy mint dips.',
    image: '/assets/images/samosa_platter.png',
    imageUrl: '/assets/images/samosa_platter.png',
    category: 'snacks',
    categoryAlias: ['snacks', 'SNACKS'],
    isVeg: true,
  },
  {
    id: 'showcase-rice-bowl',
    name: 'Royal Jeera Rice Bowl',
    badge: 'Jeera Special',
    rating: 4.9,
    reviewsCount: 290,
    price: 130,
    prepTime: '8-10 mins',
    description:
      'Aromatic long-grain basmati rice tempered with whole roasted cumin seeds (jeera), pure desi ghee, and fresh green coriander. Served hot in a rustic artisan bowl.',
    image: '/assets/images/jeera_rice_bowl.png',
    imageUrl: '/assets/images/jeera_rice_bowl.png',
    category: 'rice-bowls',
    categoryAlias: ['rice-bowls', 'RICE_BOWLS'],
    isVeg: true,
  },
  {
    id: 'showcase-rajma-chawal',
    name: 'Punjabi Rajma Chawal Bowl',
    badge: 'Desi Classic',
    rating: 4.8,
    reviewsCount: 260,
    price: 135,
    prepTime: '10-12 mins',
    description:
      'Homestyle slow-braised red kidney beans in rich spiced onion-tomato gravy, served over steaming basmati rice with lime & fresh coriander.',
    image: '/assets/images/rajma_chawal_bowl.png',
    imageUrl: '/assets/images/rajma_chawal_bowl.png',
    category: 'rice-bowls',
    categoryAlias: ['rice-bowls', 'RICE_BOWLS'],
    isVeg: true,
  },
  {
    id: 'showcase-veg-biryani',
    name: 'Paneer Makhani Biryani Bowl',
    badge: 'Chef Signature',
    rating: 4.8,
    reviewsCount: 290,
    price: 215,
    prepTime: '15 mins',
    description:
      'Marinated soft paneer cubes cooked in velvet makhani gravy layered with spiced basmati biryani rice and toasted cashews.',
    image: '/assets/images/veg_paneer_biryani_bowl.png',
    imageUrl: '/assets/images/veg_paneer_biryani_bowl.png',
    category: 'biryani',
    categoryAlias: ['biryani', 'BIRYANI'],
    isVeg: true,
  },
  {
    id: 'showcase-sandwich',
    name: 'Gourmet Bombay Club Sandwich',
    badge: 'Quick Bite',
    rating: 4.7,
    reviewsCount: 185,
    price: 120,
    prepTime: '8-10 mins',
    description:
      'Triple-decker toasted artisan sourdough layered with mint chutney, sliced potatoes, cucumbers, ripe tomatoes, melted amul cheese, and house chaat masala.',
    image: '/assets/images/club_sandwich.png',
    imageUrl: '/assets/images/club_sandwich.png',
    category: 'sandwiches',
    categoryAlias: ['sandwiches', 'SANDWICHES'],
    isVeg: true,
  },
  {
    id: 'showcase-coffee',
    name: 'Degree Kumbakonam Filter Coffee',
    badge: 'Heritage Brew',
    rating: 5.0,
    reviewsCount: 640,
    price: 45,
    prepTime: '3-5 mins',
    description:
      'Freshly roasted plantation peaberry and chicory decoction frothed with boiling thick farm milk, served piping hot in a classic cup with roasted coffee beans.',
    image: '/assets/images/filter_coffee.png',
    imageUrl: '/assets/images/filter_coffee.png',
    category: 'coffee',
    categoryAlias: ['coffee', 'COFFEE', 'beverages'],
    isVeg: true,
  },
  {
    id: 'showcase-juice',
    name: 'Fresh Cold-Pressed Valencia Juice',
    badge: 'Cold Pressed',
    rating: 4.8,
    reviewsCount: 175,
    price: 85,
    prepTime: '4-6 mins',
    description:
      '100% pure cold-pressed Valencia oranges and sweet lime with no added sugar or water, bursting with natural vitamin C and invigorating citrus freshness.',
    image: '/assets/images/cold_pressed_valencia_orange_juice.png',
    imageUrl: '/assets/images/cold_pressed_valencia_orange_juice.png',
    category: 'juice',
    categoryAlias: ['juice', 'JUICE', 'beverages'],
    isVeg: true,
  },
  {
    id: 'showcase-watermelon',
    name: 'Watermelon Mint Hydration Cooler',
    badge: 'Summer Special',
    rating: 4.8,
    reviewsCount: 195,
    price: 80,
    prepTime: '4 mins',
    description:
      'Fresh seedless watermelon crushed with garden mint leaves, a squeeze of key lime, and Himalayan pink rock salt. Chilled to perfection.',
    image: '/assets/images/watermelon_mint_hydration_cooler.png',
    imageUrl: '/assets/images/watermelon_mint_hydration_cooler.png',
    category: 'juice',
    categoryAlias: ['juice', 'JUICE', 'beverages'],
    isVeg: true,
  },
  {
    id: 'showcase-thali-royal',
    name: 'Heritage Royal Thali Feast',
    badge: 'Grand Feast Selection',
    rating: 5.0,
    reviewsCount: 480,
    price: 220,
    prepTime: '15-20 mins',
    description:
      'The crown jewel of traditional dining: aromatic ghee rice, smoked paneer tikka, yellow tadka dal, palak paneer, spiced bhindi, crispy paratha, papadum, and house-made festive dessert.',
    image: '/assets/images/showcase_thali_royal.png',
    imageUrl: '/assets/images/showcase_thali_royal.png',
    category: 'all',
    categoryAlias: ['all', 'MEALS'],
    isVeg: true,
  },
];


