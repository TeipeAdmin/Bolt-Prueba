import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { SuperAdminDashboard } from './superadmin/SuperAdminDashboard';
import { RestaurantsManagement } from './superadmin/RestaurantsManagement';
import { UsersManagement } from './superadmin/UsersManagement';
import { SubscriptionsManagement } from './superadmin/SubscriptionsManagement';
import { SuperAdminAnalytics } from './superadmin/SuperAdminAnalytics';
import { RestaurantDashboard } from './restaurant/RestaurantDashboard';
import { MenuManagement } from './restaurant/MenuManagement';
import { OrdersManagement } from './restaurant/OrdersManagement';
import { RestaurantSettings } from './restaurant/RestaurantSettings';
import { RestaurantAnalytics } from './restaurant/RestaurantAnalytics';
import { CategoriesManagement } from './restaurant/CategoriesManagement';
import { SubscriptionPlans } from './restaurant/SubscriptionPlans';
import { CustomersManagement } from './restaurant/CustomersManagement';
import { SupportTicketsManagement } from './superadmin/SupportTicketsManagement';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    if (user?.role === 'super_admin') {
      switch (activeTab) {
        case 'dashboard':
          return <SuperAdminDashboard />;
        case 'restaurants':
          return <RestaurantsManagement />;
        case 'users':
          return <UsersManagement />;
        case 'subscriptions':
          return <SubscriptionsManagement />;
        case 'support':
          return <SupportTicketsManagement />;
        case 'analytics':
          return <SuperAdminAnalytics />;
        default:
          return <SuperAdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <RestaurantDashboard />;
        case 'menu':
          return <MenuManagement />;
        case 'categories':
          return <CategoriesManagement />;
        case 'orders':
          return <OrdersManagement />;
        case 'customers':
          return <CustomersManagement />;
        case 'subscription':
          return <SubscriptionPlans />;
        case 'settings':
          return <RestaurantSettings />;
        case 'analytics':
          return <RestaurantAnalytics />;
        default:
          return <RestaurantDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigateToSettings={() => setActiveTab('settings')} />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};