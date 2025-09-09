import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Gift } from 'lucide-react';
import { Plan, Subscription, Restaurant } from '../../types';
import { availablePlans } from '../../data/mockData';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const SubscriptionPlans: React.FC = () => {
  const { restaurant, user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      loadCurrentSubscription();
    }
  }, [restaurant]);

  const loadCurrentSubscription = () => {
    const subscriptions = loadFromStorage('subscriptions', []);
    const subscription = subscriptions.find((sub: Subscription) => 
      sub.restaurant_id === restaurant?.id && sub.status === 'active'
    );
    setCurrentSubscription(subscription || null);
  };

  const handleSelectPlan = async (planId: string) => {
    if (!restaurant || !user) return;

    setLoading(true);

    try {
      // Load current data directly from localStorage
      let subscriptions = [];
      let restaurants = [];
      
      try {
        const storedSubs = localStorage.getItem('subscriptions');
        const storedRests = localStorage.getItem('restaurants');
        subscriptions = storedSubs ? JSON.parse(storedSubs) : [];
        restaurants = storedRests ? JSON.parse(storedRests) : [];
      } catch (error) {
        console.error('Error loading data:', error);
        subscriptions = [];
        restaurants = [];
      }

      console.log('Before update:', { subscriptions, restaurants });

      // Deactivate current subscription
      subscriptions = subscriptions.map((sub: Subscription) =>
        sub.restaurant_id === restaurant.id
          ? { ...sub, status: 'cancelled' as const, updated_at: new Date().toISOString() }
          : sub
      );

      // Create new subscription
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        restaurant_id: restaurant.id,
        plan_type: planId as any,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: planId === 'free' 
          ? '2099-12-31T23:59:59Z' 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        auto_renew: planId !== 'free',
        created_at: new Date().toISOString(),
      };

      subscriptions.push(newSubscription);

      // Update restaurant status
      restaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? { ...r, status: 'active' as const, updated_at: new Date().toISOString() }
          : r
      );

      console.log('After update:', { subscriptions, restaurants });

      // Save changes directly to localStorage
      try {
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
        console.log('Data saved successfully');
      } catch (error) {
        console.error('Error saving data:', error);
      }

      // Verify save directly
      try {
        const savedSubscriptions = localStorage.getItem('subscriptions');
        const savedRestaurants = localStorage.getItem('restaurants');
        console.log('Verified save:', { 
          savedSubscriptions: savedSubscriptions ? JSON.parse(savedSubscriptions) : null,
          savedRestaurants: savedRestaurants ? JSON.parse(savedRestaurants) : null
        });
      } catch (error) {
        console.error('Error verifying save:', error);
      }

      // Update auth context
      try {
        const currentAuthStr = localStorage.getItem('currentAuth');
        if (currentAuthStr) {
          const currentAuth = JSON.parse(currentAuthStr);
          currentAuth.restaurant = restaurants.find((r: Restaurant) => r.id === restaurant.id) || currentAuth.restaurant;
          localStorage.setItem('currentAuth', JSON.stringify(currentAuth));
          console.log('Updated auth context:', currentAuth);
        }
      } catch (error) {
        console.error('Error updating auth context:', error);
      }

      // Force reload of current subscription
      loadCurrentSubscription();
      
      const selectedPlan = availablePlans.find(p => p.id === planId);
      if (planId !== 'free') {
        showToast(
          'success',
          t('planActivated'),
          `Your ${selectedPlan?.name} plan has been activated successfully. You now have access to all included features.`,
          6000
        );
      } else {
        showToast(
          'info',
          'Free Plan Activated',
          'You have switched to the free plan. Some features may be limited.',
          5000
        );
      }

      // Force page reload immediately to ensure all components update
      window.location.reload();
    } catch (error) {
      console.error('Error updating subscription:', error);
      showToast(
        'error',
        'Error Changing Plan',
        'There was a problem changing your subscription plan. Please try again or contact support.',
        6000
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Gift className="w-8 h-8" />;
      case 'basic':
        return <Zap className="w-8 h-8" />;
      case 'pro':
        return <Star className="w-8 h-8" />;
      case 'business':
        return <Crown className="w-8 h-8" />;
      default:
        return <Gift className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'text-gray-600';
      case 'basic':
        return 'text-blue-600';
      case 'pro':
        return 'text-purple-600';
      case 'business':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFeaturesList = (plan: any) => {
    const features = [];
    
    if (plan.features.max_products === -1) {
      features.push(`${t('unlimited')} products`);
    } else {
      features.push(`${t('upTo')} ${plan.features.max_products} products`);
    }
    
    if (plan.features.max_categories === -1) {
      features.push(`${t('unlimited')} categories`);
    } else {
      features.push(`${t('upTo')} ${plan.features.max_categories} categories`);
    }
    
    if (plan.features.analytics) features.push(t('advancedStats'));
    if (plan.features.custom_domain) features.push(t('customDomain'));
    if (plan.features.priority_support) features.push(t('prioritySupport'));
    if (plan.features.advanced_customization) features.push(t('advancedCustomization'));
    
    return features;
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_type === planId;
  };

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('subscriptionPlans')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('choosePlan')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular 
                ? 'border-purple-500 transform scale-105' 
                : isCurrentPlan(plan.id)
                ? 'border-green-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="error" className="bg-purple-600 text-white px-4 py-1">
                  {t('mostPopular')}
                </Badge>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4">
                <Badge variant="success" className="px-3 py-1">
                  {t('currentPlan')}
                </Badge>
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 ${getPlanColor(plan.id)}`}>
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  {plan.price === 0 ? (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">{t('freePlan')}</span>
                      <p className="text-sm text-gray-600 mt-1">Forever</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-1">USD/mes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <ul className="space-y-3">
                  {getFeaturesList(plan).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                {isCurrentPlan(plan.id) ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    {t('currentPlan')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    loading={loading}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : ''
                    }`}
                    variant={plan.popular ? 'primary' : 'primary'}
                  >
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <div className="bg-blue-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('needHelp')}
          </h3>
          <p className="text-blue-700 mb-4">
            {t('allPlansInclude')} {t('canChangeAnytime')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-600">
            <div>
              <strong>{t('freePlan')}:</strong> {t('perfectToStart')}
            </div>
            <div>
              <strong>Basic/Pro:</strong> {t('forGrowingRestaurants')}
            </div>
            <div>
              <strong>Business:</strong> {t('forChainsAndFranchises')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};