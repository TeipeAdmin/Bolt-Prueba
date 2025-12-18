import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, MapPin, Filter, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { Product, Restaurant, Category } from '../../types';
import { ProductCard } from '../../components/public/ProductCard';
import { FilterSidebar } from '../../components/public/FilterSidebar';
import { CartSidebar } from '../../components/public/CartSidebar';
import { ProductDetail } from '../../components/public/ProductDetail';

interface ProductWithRestaurant extends Product {
  restaurant: Restaurant;
  categories: Category[];
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  dietaryRestrictions: string[];
  spiceLevel: number[];
  searchQuery: string;
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest';
}

export const MarketplacePage: React.FC = () => {
  const { t } = useLanguage();
  const { items } = useCart();
  const [products, setProducts] = useState<ProductWithRestaurant[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRestaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRestaurant | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100000],
    dietaryRestrictions: [],
    spiceLevel: [],
    searchQuery: '',
    sortBy: 'name'
  });

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);

      const restaurantsResponse = await fetch('/api/restaurants');
      const restaurantsData = await restaurantsResponse.json();

      const allProducts: ProductWithRestaurant[] = [];
      const allCategories: Category[] = [];

      for (const restaurant of restaurantsData) {
        const productsResponse = await fetch(`/api/restaurants/${restaurant.id}/products`);
        const productsData = await productsResponse.json();

        const categoriesResponse = await fetch(`/api/restaurants/${restaurant.id}/categories`);
        const categoriesData = await categoriesResponse.json();

        allCategories.push(...categoriesData);

        for (const product of productsData) {
          if (product.is_available && product.status === 'active') {
            const productCategoriesResponse = await fetch(`/api/products/${product.id}/categories`);
            const productCategories = await productCategoriesResponse.json();

            allProducts.push({
              ...product,
              restaurant,
              categories: productCategories
            });
          }
        }
      }

      const uniqueCategories = Array.from(
        new Map(allCategories.map(cat => [cat.id, cat])).values()
      );

      setProducts(allProducts);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.restaurant.name.toLowerCase().includes(query) ||
        product.categories.some(cat => cat.name.toLowerCase().includes(query))
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        product.categories.some(cat => filters.categories.includes(cat.id))
      );
    }

    if (filters.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(product =>
        product.dietary_restrictions?.some(restriction =>
          filters.dietaryRestrictions.includes(restriction)
        )
      );
    }

    if (filters.spiceLevel.length > 0) {
      filtered = filtered.filter(product =>
        product.spice_level !== undefined &&
        filters.spiceLevel.includes(product.spice_level)
      );
    }

    filtered = filtered.filter(product => {
      const minPrice = Math.min(...product.variations.map(v => v.price));
      return minPrice >= filters.priceRange[0] && minPrice <= filters.priceRange[1];
    });

    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const minPriceA = Math.min(...a.variations.map(v => v.price));
          const minPriceB = Math.min(...b.variations.map(v => v.price));
          return minPriceA - minPriceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const minPriceA = Math.min(...a.variations.map(v => v.price));
          const minPriceB = Math.min(...b.variations.map(v => v.price));
          return minPriceB - minPriceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 100000],
      dietaryRestrictions: [],
      spiceLevel: [],
      searchQuery: '',
      sortBy: 'name'
    });
  };

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t('marketplace')}</h1>
            </div>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchProducts')}
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">{t('filters')}</span>
                {(filters.categories.length > 0 || filters.dietaryRestrictions.length > 0) && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {filters.categories.length + filters.dietaryRestrictions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} {t('productsFound')}
          </p>

          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">{t('marketplaceSortByName')}</option>
            <option value="price-low">{t('marketplaceSortByPriceLow')}</option>
            <option value="price-high">{t('marketplaceSortByPriceHigh')}</option>
            <option value="newest">{t('marketplaceSortByNewest')}</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">{t('marketplaceNoProducts')}</p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('marketplaceClearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                restaurant={product.restaurant}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        categories={categories}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          restaurant={selectedProduct.restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
