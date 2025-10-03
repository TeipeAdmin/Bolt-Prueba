import { User, Restaurant, Subscription, Category, Product, Order } from '../types';

// Available plans - Updated system
export const availablePlans = [
  {
    id: 'gratis',
    name: 'Gratis',
    price: 0,
    currency: 'USD',
    billing_period: 'monthly' as const,
    features: {
      max_products: 10,
      max_categories: 5,
      analytics: false,
      custom_domain: false,
      priority_support: false,
      advanced_customization: false,
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 15,
    currency: 'USD',
    billing_period: 'monthly' as const,
    features: {
      max_products: 50,
      max_categories: 15,
      analytics: true,
      custom_domain: false,
      priority_support: false,
      advanced_customization: true,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 35,
    currency: 'USD',
    billing_period: 'monthly' as const,
    popular: true,
    features: {
      max_products: 200,
      max_categories: 50,
      analytics: true,
      custom_domain: true,
      priority_support: true,
      advanced_customization: true,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 75,
    currency: 'USD',
    billing_period: 'monthly' as const,
    features: {
      max_products: -1, // unlimited
      max_categories: -1, // unlimited
      analytics: true,
      custom_domain: true,
      priority_support: true,
      advanced_customization: true,
    },
  },
];

// Mock users data
export const mockUsers: User[] = [
  {
    id: 'super-1',
    email: 'admin@sistema.com',
    password: 'admin123',
    role: 'super_admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    email_verified: true,
  },
  {
    id: 'user-orlando',
    email: 'orlando@gmail.com',
    password: 'orlando123',
    role: 'restaurant_owner',
    restaurant_id: 'rest-orlando',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    email_verified: true,
  },
];

// Mock restaurants data
export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-orlando',
    user_id: 'user-orlando',
    name: 'Restaurante Orlando',
    slug: 'restaurante-orlando',
    email: 'orlando@gmail.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Ciudad',
    description: 'Deliciosa comida casera con ingredientes frescos y recetas tradicionales.',
    logo: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=300',
    owner_name: 'Orlando',
    settings: {
      currency: 'USD',
      language: 'es',
      timezone: 'America/Mexico_City',
      social_media: {
        facebook: '',
        instagram: '',
        whatsapp: '+1555123456',
      },
      ui_settings: {
        show_search_bar: true,
        info_message: 'Agrega los productos que desees al carrito, al finalizar tu pedido lo recibiremos por WhatsApp',
        layout_type: 'list',
      },
      theme: {
        primary_color: '#dc2626',
        secondary_color: '#f3f4f6',
        accent_color: '#16a34a',
        text_color: '#1f2937',
        primary_font: 'Inter',
        secondary_font: 'Poppins',
        font_sizes: {
          title: '32px',
          subtitle: '24px',
          normal: '16px',
          small: '14px',
        },
        font_weights: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700,
        },
        button_style: 'rounded',
      },
      business_hours: {
        monday: { open: '11:00', close: '23:00', is_open: true },
        tuesday: { open: '11:00', close: '23:00', is_open: true },
        wednesday: { open: '11:00', close: '23:00', is_open: true },
        thursday: { open: '11:00', close: '23:00', is_open: true },
        friday: { open: '11:00', close: '24:00', is_open: true },
        saturday: { open: '11:00', close: '24:00', is_open: true },
        sunday: { open: '12:00', close: '22:00', is_open: true },
      },
      delivery: {
        enabled: true,
        zones: [
          { id: '1', name: 'Centro', cost: 3.50, area_description: 'Centro histórico y alrededores' },
          { id: '2', name: 'Norte', cost: 4.50, area_description: 'Zona norte de la ciudad' },
        ],
        min_order_amount: 15.00,
      },
      preparation_time: '30-45 minutos',
      notifications: {
        email: 'orders@lapizzeria.com',
        whatsapp: '+1555123456',
        sound_enabled: true,
      },
      promo: {
        enabled: false,
        banner_image: '',
        promo_text: '',
        cta_text: 'Ver Ofertas',
        cta_link: '',
      },
    },
    subscription_id: 'sub-orlando',
    domain: 'restaurante-orlando',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
];

// Mock subscriptions
export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-orlando',
    restaurant_id: 'rest-orlando',
    plan_type: 'gratis',
    duration: 'monthly',
    start_date: '2024-01-15T00:00:00Z',
    end_date: '2099-12-31T23:59:59Z', // Gratis plan never expires
    status: 'active',
    auto_renew: false,
    created_at: '2024-01-15T00:00:00Z',
  },
];

// Mock categories
export const mockCategories: Category[] = [
  // Restaurante Orlando
  { id: 'cat-1', restaurant_id: 'rest-orlando', name: 'Platos Principales', description: 'Nuestros platos principales', icon: '🍽️', order_position: 1, active: true, created_at: '2024-01-15T00:00:00Z' },
  { id: 'cat-2', restaurant_id: 'rest-orlando', name: 'Bebidas', description: 'Bebidas refrescantes', icon: '🥤', order_position: 2, active: true, created_at: '2024-01-15T00:00:00Z' },
];

// Mock products
export const mockProducts: Product[] = [
  // Restaurante Orlando - Platos Principales
  {
    id: 'prod-1',
    restaurant_id: 'rest-orlando',
    category_id: 'cat-1',
    name: 'Pollo a la Plancha',
    description: 'Pechuga de pollo jugosa a la plancha con especias caseras, acompañada de vegetales frescos',
    images: ['https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=500'],
    variations: [
      { id: 'var-1', name: 'Porción Regular', price: 15.99 },
      { id: 'var-2', name: 'Porción Grande', price: 19.99 },
    ],
    ingredients: [
      { id: 'ing-1', name: 'Pechuga de pollo', optional: false },
      { id: 'ing-2', name: 'Vegetales', optional: false },
      { id: 'ing-3', name: 'Especias caseras', optional: false },
      { id: 'ing-4', name: 'Papas fritas extra', optional: true, extra_cost: 3.00 },
    ],
    dietary_restrictions: ['sin gluten'],
    spice_level: 0,
    preparation_time: '20-25 minutos',
    status: 'active',
    sku: 'POLLO-001',
    is_available: true,
    is_featured: true,
    order_index: 1,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod-2',
    restaurant_id: 'rest-orlando',
    category_id: 'cat-2',
    name: 'Coca Cola',
    description: 'Bebida refrescante clásica',
    images: ['https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=500'],
    variations: [
      { id: 'var-3', name: 'Lata 355ml', price: 2.50 },
      { id: 'var-4', name: 'Botella 600ml', price: 3.50 },
    ],
    ingredients: [],
    dietary_restrictions: [],
    spice_level: 0,
    preparation_time: 'Inmediato',
    status: 'active',
    sku: 'BEB-001',
    is_available: true,
    is_featured: false,
    order_index: 2,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    restaurant_id: 'rest-orlando',
    order_number: 'ORL-241201-001',
    customer: {
      name: 'Juan Pérez',
      phone: '+1555987654',
      email: 'juan@email.com',
      address: '123 Customer Street',
    },
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1', 
        product: {
          id: 'prod-1',
          restaurant_id: 'rest-orlando',
          category_id: 'cat-1',
          name: 'Pollo a la Plancha',
          description: 'Pechuga de pollo jugosa a la plancha con especias caseras, acompañada de vegetales frescos',
          images: ['https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=500'],
          variations: [
            { id: 'var-1', name: 'Porción Regular', price: 15.99 },
            { id: 'var-2', name: 'Porción Grande', price: 19.99 },
          ],
          ingredients: [
            { id: 'ing-1', name: 'Pechuga de pollo', optional: false },
            { id: 'ing-2', name: 'Vegetales', optional: false },
            { id: 'ing-3', name: 'Especias caseras', optional: false },
            { id: 'ing-4', name: 'Papas fritas extra', optional: true, extra_cost: 3.00 },
          ],
          dietary_restrictions: ['sin gluten'],
          spice_level: 0,
          preparation_time: '20-25 minutos',
          status: 'active',
          sku: 'POLLO-001',
          is_available: true,
          is_featured: true,
          order_index: 1,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        },
        variation: { id: 'var-1', name: 'Porción Regular', price: 15.99 },
        quantity: 1,
        unit_price: 15.99,
        total_price: 15.99,
        selected_ingredients: [
          { id: 'ing-4', name: 'Papas fritas extra', optional: true, extra_cost: 3.00 },
        ],
        special_notes: 'Bien cocido por favor',
      },
    ],
    order_type: 'delivery',
    delivery_address: '123 Customer Street',
    delivery_cost: 3.50,
    subtotal: 15.99,
    total: 19.49,
    status: 'pending',
    created_at: '2024-12-01T10:30:00Z',
    updated_at: '2024-12-01T10:30:00Z',
  },
];

// Utility functions for localStorage
export const loadFromStorage = <T>(key: string, defaultValue?: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item && item !== 'undefined' && item !== 'null') {
      const parsed = JSON.parse(item);
      console.log(`Loaded from storage [${key}]:`, parsed);
      return parsed;
    }
    console.log(`Using default value for [${key}]:`, defaultValue);
    return defaultValue as T;
  } catch {
    console.error(`Error loading from storage [${key}], using default:`, defaultValue);
    return defaultValue as T;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    console.log(`Saving to storage [${key}]:`, data);
    localStorage.setItem(key, JSON.stringify(data));
    
    // Verify the save
    const saved = localStorage.getItem(key);
    console.log(`Verified save [${key}]:`, saved ? JSON.parse(saved) : null);
  } catch (error) {
    console.error(`Error saving to localStorage [${key}]:`, error);
  }
};

// Initialize data in localStorage if not present
export const initializeData = (): void => {
  const hasInitialized = localStorage.getItem('data_initialized');

  if (!hasInitialized) {
    console.log('First time initialization - loading mock data');
    saveToStorage('users', mockUsers);
    saveToStorage('restaurants', mockRestaurants);
    saveToStorage('subscriptions', mockSubscriptions);
    saveToStorage('categories', mockCategories);
    saveToStorage('products', mockProducts);
    saveToStorage('orders', mockOrders);
    saveToStorage('supportTickets', []);
    localStorage.setItem('data_initialized', 'true');

    console.log('Data initialized:', {
      users: mockUsers,
      restaurants: mockRestaurants
    });
  } else {
    console.log('Data already initialized, skipping...');
  }
};

// Reset all data to initial mock data
export const resetAllData = (): void => {
  console.log('Resetting all data to initial state...');
  saveToStorage('users', mockUsers);
  saveToStorage('restaurants', mockRestaurants);
  saveToStorage('subscriptions', mockSubscriptions);
  saveToStorage('categories', mockCategories);
  saveToStorage('products', mockProducts);
  saveToStorage('orders', mockOrders);
  saveToStorage('supportTickets', []);
  localStorage.setItem('data_initialized', 'true');
  console.log('Data reset complete!');
  window.location.reload();
};