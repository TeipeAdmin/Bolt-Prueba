import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Restaurant, RegisterData, Subscription, SupportTicket } from '../types';
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
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

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

    // Check if password change is required
    if (foundUser.require_password_change) {
      setUser(foundUser);
      setRestaurant(userRestaurant);
      setRequirePasswordChange(true);
      setIsAuthenticated(false);
      return { success: true };
    }

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

  const changePassword = (newPassword: string) => {
    if (!user) return;

    const users = loadFromStorage('users', []) as User[];
    const updatedUsers = users.map((u: User) =>
      u.id === user.id
        ? { ...u, password: newPassword, require_password_change: false, updated_at: new Date().toISOString() }
        : u
    );

    saveToStorage('users', updatedUsers);

    const updatedUser = { ...user, password: newPassword, require_password_change: false };
    setUser(updatedUser);
    setRequirePasswordChange(false);
    setIsAuthenticated(true);

    // Save to localStorage
    const authData = {
      user: updatedUser,
      restaurant
    };
    saveToStorage('currentAuth', authData);
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

    const restaurantId = `rest-${Date.now()}`;
    const userId = `user-${Date.now()}`;

    // Create new user
    const newUser: User = {
      id: userId,
      email: data.email,
      password: data.password,
      role: 'restaurant_owner',
      restaurant_id: restaurantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_verified: false,
    };

    // Create new restaurant - ACTIVE with FREE subscription
    const newRestaurant: Restaurant = {
      id: restaurantId,
      name: data.restaurantName,
      slug: uniqueSlug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      owner_name: data.ownerName,
      owner_id: userId,
      settings: {
        currency: 'USD',
        language: 'es',
        timezone: 'America/Bogota',
        ui_settings: {
          layout_type: 'list',
          show_search_bar: true,
          info_message: 'Agrega los productos que desees al carrito, al finalizar tu pedido lo recibiremos por WhatsApp',
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
        social_media: {
          facebook: '',
          instagram: '',
          whatsapp: data.phone || '',
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
        },
        table_orders: {
          enabled: false,
          table_numbers: 0,
          qr_codes: false,
          auto_assign: false,
        },
        notifications: {
          email: data.email,
          whatsapp: data.phone,
          sound_enabled: true,
        },
      },
      domain: uniqueSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create FREE subscription (gratis plan - never expires)
    const subscriptionId = `sub-${Date.now()}`;
    const newSubscription: Subscription = {
      id: subscriptionId,
      restaurant_id: restaurantId,
      plan_type: 'gratis',
      duration: 'monthly',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: '2099-12-31T23:59:59Z', // Gratis plan never expires
      auto_renew: false,
      created_at: new Date().toISOString(),
    };

    // Link subscription to restaurant
    newRestaurant.subscription_id = subscriptionId;

    // Save to storage
    const subscriptions = loadFromStorage('subscriptions', []) as Subscription[];
    saveToStorage('users', [...users, newUser]);
    saveToStorage('restaurants', [...restaurants, newRestaurant]);
    saveToStorage('subscriptions', [...subscriptions, newSubscription]);

    return { success: true };
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const users = loadFromStorage('users', []) as User[];
    const restaurants = loadFromStorage('restaurants', []) as Restaurant[];

    const foundUser = users.find((u: User) => u.email === email);

    if (!foundUser) {
      return { success: false, error: 'No se encontró una cuenta con ese email' };
    }

    const userRestaurant = restaurants.find((r: Restaurant) => r.owner_id === foundUser.id);

    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newTicket = {
      id: ticketId,
      restaurantId: userRestaurant?.id || 'N/A',
      restaurantName: userRestaurant?.name || 'Usuario sin restaurante',
      subject: 'Solicitud de recuperación de contraseña',
      category: 'account',
      priority: 'high',
      message: `El usuario ${foundUser.name || 'Sin nombre'} con email ${email} ha solicitado recuperar su contraseña.\n\nRol del usuario: ${foundUser.role}\nFecha de solicitud: ${new Date(now).toLocaleString('es-CO')}`,
      contactEmail: email,
      contactPhone: userRestaurant?.phone || 'No disponible',
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    };

    const tickets = loadFromStorage('supportTickets', []);
    saveToStorage('supportTickets', [...tickets, newTicket]);

    console.log('Password reset request created as support ticket:', ticketId);

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
    requirePasswordChange,
    changePassword,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};