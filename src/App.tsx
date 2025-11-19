import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './hooks/useToast';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicMenu } from './pages/public/PublicMenu';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, restaurant } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // Check if restaurant is inactive (expired subscription)
  if (isAuthenticated && restaurant && restaurant.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Suscripción Requerida</h2>
          <p className="text-gray-600 mb-6">
            {t('suscriptionend')}
          </p>
          <Navigate to="/dashboard" />
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login"
        element={
          loading ? (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando aplicación...</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          loading ? (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando aplicación...</p>
              </div>
            </div>
          ) : (
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          )
        }
      />
      <Route
        path="/:slug"
        element={
          <CartProvider>
            <PublicMenu />
          </CartProvider>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppRoutes />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;