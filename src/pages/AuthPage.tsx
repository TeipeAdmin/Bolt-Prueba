import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, TrendingUp, Smartphone, Users, Clock, BarChart3, Shield, Zap, Receipt, Eye } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { requirePasswordChange, changePassword } = useAuth();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <img
                  src="/PLATYO FAVICON BLANCO.svg"
                  alt="Platyo"
                  className="w-10 h-10 flex-shrink-0"
                />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Platyo</h1>
              <p className="text-sm text-gray-400">Gestión, pedidos y satisfacción: todo en un solo lugar</p>
            </div>
          </div>

          {/* Main Value Proposition */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Transforma la gestión de tu restaurante
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              La plataforma todo-en-uno que necesitas para modernizar tu negocio y aumentar tus ventas
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Menú Digital</h3>
                <p className="text-sm text-gray-400">Catálogo online con código QR</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Más Ventas</h3>
                <p className="text-sm text-gray-400">Aumenta hasta 40% tus ingresos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Análisis en Tiempo Real</h3>
                <p className="text-sm text-gray-400">Reportes y estadísticas detalladas</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Gestión de Pedidos</h3>
                <p className="text-sm text-gray-400">Control total y eficiente</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Base de Clientes</h3>
                <p className="text-sm text-gray-400">Fideliza y conoce mejor a tus clientes</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Configuración Rápida</h3>
                <p className="text-sm text-gray-400">Listo en menos de 10 minutos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Facturación POS</h3>
                <p className="text-sm text-gray-400">Sistema integrado de punto de venta</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Seguimiento en Tiempo Real</h3>
                <p className="text-sm text-gray-400">Clientes rastrean sus pedidos al instante</p>
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