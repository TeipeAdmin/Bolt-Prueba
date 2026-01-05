import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AuthContextType, User, Restaurant, RegisterData } from '../types';
import { supabase } from '../lib/supabase';

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
  const loadingUserRef = useRef(false);

  useEffect(() => {
    console.log('[AuthContext] Initializing auth context...');

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.email);

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
        console.log('[AuthContext] Loading user after auth event:', event);
        if (!loadingUserRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));

          const { data: { session: verifiedSession } } = await supabase.auth.getSession();
          if (verifiedSession?.user) {
            console.log('[AuthContext] Session verified, loading user data');
            await loadUserData(verifiedSession.user.id);
          } else {
            console.log('[AuthContext] Session not ready, skipping load');
            setLoading(false);
          }
        } else {
          console.log('[AuthContext] Skipping loadUserData, already in progress');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[AuthContext] User signed out');
        setUser(null);
        setRestaurant(null);
        setIsAuthenticated(false);
        setLoading(false);
        loadingUserRef.current = false;
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('[AuthContext] Token refreshed for user:', session.user.email);
      } else if (event === 'INITIAL_SESSION' && !session) {
        console.log('[AuthContext] No session found, setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      authListener?.subscription.unsubscribe();
    };
  }, []);


  const loadUserData = async (userId: string, retryCount = 0) => {
    if (loadingUserRef.current) {
      console.log('[AuthContext] loadUserData already in progress, skipping...');
      return;
    }

    try {
      console.log('[AuthContext] Loading user data for:', userId);
      loadingUserRef.current = true;
      setLoading(true);

      console.log('[AuthContext] About to query users table...');
      const startTime = Date.now();

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );

      const { data: userData, error: userError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      const duration = Date.now() - startTime;
      console.log(`[AuthContext] Query completed in ${duration}ms`);

      if (userError) {
        console.error('[AuthContext] Error loading user data:', userError);

        if (retryCount < 2) {
          console.log('[AuthContext] Retrying... attempt', retryCount + 1);
          loadingUserRef.current = false;
          await new Promise(resolve => setTimeout(resolve, 500));
          return loadUserData(userId, retryCount + 1);
        }

        console.error('[AuthContext] Max retries reached, signing out');
        await supabase.auth.signOut();
        setUser(null);
        setRestaurant(null);
        setIsAuthenticated(false);
        setLoading(false);
        loadingUserRef.current = false;
        return;
      }

      if (!userData) {
        console.error('[AuthContext] No user data found for userId:', userId);
        await supabase.auth.signOut();
        setUser(null);
        setRestaurant(null);
        setIsAuthenticated(false);
        setLoading(false);
        loadingUserRef.current = false;
        return;
      }

      console.log('[AuthContext] User data loaded successfully:', userData.email, 'Role:', userData.role);
      setUser(userData as User);
      setIsAuthenticated(true);
      setRequirePasswordChange(userData.require_password_change || false);

      if (userData.role === 'restaurant_owner' && userData.restaurant_id) {
        console.log('[AuthContext] Loading restaurant data for:', userData.restaurant_id);

        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', userData.restaurant_id)
          .maybeSingle();

        if (restaurantError) {
          console.error('[AuthContext] Error loading restaurant:', restaurantError);
        } else if (restaurantData) {
          console.log('[AuthContext] Restaurant data loaded:', restaurantData.name);
          setRestaurant(restaurantData as Restaurant);
        } else {
          console.warn('[AuthContext] No restaurant data found');
        }
      }

      if (userData.role === 'superadmin') {
        console.log('[AuthContext] User is superadmin, no restaurant needed');
        setRestaurant(null);
      }

      console.log('[AuthContext] Auth context fully loaded');
      setLoading(false);
      loadingUserRef.current = false;
    } catch (error) {
      console.error('[AuthContext] Unexpected error loading user data:', error);

      if (retryCount < 2) {
        console.log('[AuthContext] Retrying after unexpected error... attempt', retryCount + 1);
        loadingUserRef.current = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        return loadUserData(userId, retryCount + 1);
      }

      console.error('[AuthContext] Max retries reached after unexpected error, signing out');
      await supabase.auth.signOut();
      setUser(null);
      setRestaurant(null);
      setIsAuthenticated(false);
      setLoading(false);
      loadingUserRef.current = false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Error al iniciar sesión' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Usuario no autenticado' };

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ require_password_change: false })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      setRequirePasswordChange(false);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Error al cambiar la contraseña' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseSlug = data.restaurantName.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();

      const { data: existingSlugs } = await supabase
        .from('restaurants')
        .select('slug')
        .like('slug', `${baseSlug}%`);

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (existingSlugs?.some(r => r.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      const restaurantData = {
        name: data.restaurantName,
        slug: uniqueSlug,
        email: data.email,
        phone: data.phone,
        address: data.address,
        owner_name: data.ownerName,
        owner_id: authData.user.id,
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
            primary_font: 'Monserrat',
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
      };

      const { data: restaurantResult, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([restaurantData])
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      const { error: userError } = await supabase
        .from('users')
        .update({
          role: 'restaurant_owner',
          restaurant_id: restaurantResult.id,
          full_name: data.ownerName,
        })
        .eq('id', authData.user.id);

      if (userError) throw userError;

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          restaurant_id: restaurantResult.id,
          plan_type: 'gratis',
          duration: 'monthly',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: '2099-12-31T23:59:59Z',
          auto_renew: false,
        }]);

      if (subscriptionError) throw subscriptionError;

      await supabase.auth.signOut();

      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      await supabase.auth.signOut();
      return { success: false, error: error.message || 'Error al registrar' };
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, role, restaurant_id')
        .eq('email', email)
        .maybeSingle();

      if (!userData) {
        return { success: false, error: 'No se encontró una cuenta con ese email' };
      }

      let restaurantData = null;
      if (userData.restaurant_id) {
        const { data } = await supabase
          .from('restaurants')
          .select('id, name, phone')
          .eq('id', userData.restaurant_id)
          .maybeSingle();
        restaurantData = data;
      }

      const { error: ticketError } = await supabase
        .from('support_tickets')
        .insert([{
          restaurant_id: restaurantData?.id || null,
          subject: 'Solicitud de recuperación de contraseña',
          category: 'account',
          priority: 'high',
          message: `El usuario ${userData.full_name || 'Sin nombre'} con email ${email} ha solicitado recuperar su contraseña.\n\nRol del usuario: ${userData.role}\nFecha de solicitud: ${new Date().toLocaleString('es-CO')}`,
          contact_email: email,
          contact_phone: restaurantData?.phone || null,
          status: 'pending',
        }]);

      if (ticketError) throw ticketError;

      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message || 'Error al solicitar recuperación' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRestaurant(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setRestaurant(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
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