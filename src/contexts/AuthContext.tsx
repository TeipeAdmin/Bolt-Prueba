import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Restaurant, RegisterData, Subscription } from '../types';
import { loadFromStorage, saveToStorage, initializeData } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = loadFromStorage('currentAuth', null);
    console.log('Loading saved auth:', savedAuth);
    if (savedAuth) {
      setUser(savedAuth.user);
      setRestaurant(savedAuth.restaurant);
      setIsAuthenticated(true);
      console.log('Auth restored from storage:', { user: savedAuth.user, restaurant: savedAuth.restaurant });
    } else {
      // Only initialize data if no auth is saved (first time)
      initializeData();
    }
    checkSubscriptionStatus();
    setLoading(false);
  }, []);

  const checkSubscriptionStatus = () => {
    const subscriptions = loadFromStorage('subscriptions', []) as Subscription[];
    const now = new Date();

    console.log('Checking subscription status:', { subscriptions });

    // Check for expired subscriptions
    const updatedSubscriptions = subscriptions.map((sub: Subscription) => {
      if (sub.status === 'active' && new Date(sub.end_date) < now && sub.plan_type !== 'gratis') {
        console.log('Expiring subscription:', sub);
        return { ...sub, status: 'expired' as const };
      }
      return sub;
    });

    // Save updated subscriptions if any changed
    if (JSON.stringify(updatedSubscriptions) !== JSON.stringify(subscriptions)) {
      saveToStorage('subscriptions', updatedSubscriptions);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = loadFromStorage('users', []) as User[];
    const restaurants = loadFromStorage('restaurants', []) as Restaurant[];
    
    console.log('Login attempt:', { email, password });
    console.log('Available users:', users);
    
    // Find user by email
    const foundUser = users.find((u: User) => u.email === email);
    
    if (!foundUser) {
      console.log('User not found');
      return { success: false, error: 'Usuario no encontrado' };
    }

    console.log('Found user:', foundUser);
    console.log('Password check:', { provided: password, stored: foundUser.password });

    // Validate password
    if (foundUser.password !== password) {
      console.log('Password mismatch');
      return { success: false, error: 'Contraseña incorrecta' };
    }

    let userRestaurant = null;
    if (foundUser.role === 'restaurant_owner') {
      if (foundUser.restaurant_id) {
        userRestaurant = restaurants.find((r: Restaurant) => r.id === foundUser.restaurant_id);
        if (!userRestaurant) {
          console.log('Restaurant not found for user');
          return { success: false, error: 'Restaurante no encontrado para este usuario' };
        }
      } else {
        console.log('User has no restaurant assigned');
        return { success: false, error: 'No tienes un restaurante asignado. Contacta al administrador.' };
      }
    }

    console.log('Login successful');
    setUser(foundUser);
    setRestaurant(userRestaurant);
    setIsAuthenticated(true);

    // Save to localStorage
    const authData = {
      user: foundUser,
      restaurant: userRestaurant,
    };
    console.log('Saving auth data:', authData);
    saveToStorage('currentAuth', authData);

    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const users = loadFromStorage('users', []) as User[];
    const restaurants = loadFromStorage('restaurants', []) as Restaurant[];

    // Check if email already exists
    if (users.find((u: User) => u.email === data.email)) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Create unique slug from restaurant name
    const baseSlug = data.restaurantName.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim();

    // Check if slug already exists and make it unique
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (restaurants.find((r: Restaurant) => r.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      role: 'restaurant_owner',
      created_at: new Date().toISOString(),
      email_verified: false,
    };

    // Create new restaurant
    const newRestaurant: Restaurant = {
      id: `rest-${Date.now()}`,
      user_id: newUser.id,
      name: data.restaurantName,
      slug: uniqueSlug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      owner_name: data.ownerName,
      settings: {
        currency: 'USD',
        language: 'es',
        timezone: 'America/Mexico_City',
        ui_settings: {
          layout_type: 'cards',
          show_search_bar: true,
          info_message: 'Agrega los productos que desees al carrito, al finalizar tu pedido lo recibiremos por WhatsApp',
        },
        theme: {
          template: 'modern',
          primary_color: '#2563eb', 
          secondary_color: '#ffffff',
          tertiary_color: '#1f2937',
          font_family: 'Inter',
          button_style: 'rounded',
        },
        social_media: {
          facebook: '',
          instagram: '',
          twitter: '',
          whatsapp: '',
          website: '',
        },
        business_hours: {
          monday: { open: '09:00', close: '22:00', is_open: true },
          tuesday: { open: '09:00', close: '22:00', is_open: true },
          wednesday: { open: '09:00', close: '22:00', is_open: true },
          thursday: { open: '09:00', close: '22:00', is_open: true },
          friday: { open: '09:00', close: '23:00', is_open: true },
          saturday: { open: '09:00', close: '23:00', is_open: true },
          sunday: { open: '10:00', close: '21:00', is_open: true },
        },
        delivery: {
          enabled: false,
          zones: [],
          min_order_amount: 0,
          estimated_time: '30-45 minutos',
        },
        notifications: {
          email: data.email,
          sound_enabled: true,
        },
      },
      status: 'pending',
      domain: uniqueSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to storage
    saveToStorage('users', [...users, newUser]);
    saveToStorage('restaurants', [...restaurants, newRestaurant]);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setRestaurant(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentAuth');
  };

  const value: AuthContextType = {
    user,
    restaurant,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};