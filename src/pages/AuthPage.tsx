import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, TrendingUp, Smartphone, Users, Clock, BarChart3, Shield, Zap } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { requirePasswordChange, changePassword } = useAuth();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40l2.83 2.83-1.41 1.41L0 41.41l-2.83 2.83-1.41-1.41L-1.41 40l-2.83-2.83 1.41-1.41L0 38.59zM0 1.4l2.83 2.83 1.41-1.41L1.41 0 4.24-2.83 2.83-4.24 0-1.41-2.83-4.24-4.24-2.83-1.41 0-4.24 2.83-2.83 4.24 0 1.41z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-16">
            <img
              src="/PLATYO LOGO (2).png"
              alt="Platyo"
              className="h-16 w-auto"
            />
          </div>

          {/* Main Value Proposition */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Transforma la gestión de tu restaurante
            </h2>
            <p className="text-xl text-orange-100 leading-relaxed">
              La plataforma todo-en-uno que necesitas para modernizar tu negocio y aumentar tus ventas
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Menú Digital</h3>
                <p className="text-sm text-orange-100">Catálogo online con código QR</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Más Ventas</h3>
                <p className="text-sm text-orange-100">Aumenta hasta 40% tus ingresos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Análisis en Tiempo Real</h3>
                <p className="text-sm text-orange-100">Reportes y estadísticas detalladas</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Gestión de Pedidos</h3>
                <p className="text-sm text-orange-100">Control total y eficiente</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Base de Clientes</h3>
                <p className="text-sm text-orange-100">Fideliza y conoce mejor a tus clientes</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Configuración Rápida</h3>
                <p className="text-sm text-orange-100">Listo en menos de 10 minutos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-gray-400">Restaurantes Activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-gray-400">Pedidos Procesados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-gray-400">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={requirePasswordChange || false}
        onPasswordChanged={(newPassword) => changePassword?.(newPassword)}
      />
    </div>
  );
};