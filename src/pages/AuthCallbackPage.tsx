import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          setError('No se pudo iniciar sesión. Por favor intenta nuevamente.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, role, restaurant_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
          throw userError;
        }

        if (!userData) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              role: 'restaurant_owner',
              require_password_change: false,
            }]);

          if (insertError) {
            console.error('Error creating user:', insertError);
            throw insertError;
          }
        }

        navigate('/dashboard');
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Error al procesar la autenticación');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando autenticación</h2>
        <p className="text-gray-600">Por favor espera un momento...</p>
      </div>
    </div>
  );
};
