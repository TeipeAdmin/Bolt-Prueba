import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Gift,
  Star,
  X,
  Grid3x3,
  List,
  Clock,
  MapPin,
  Phone,
  TikTok,
  Facebook,
  Instagram,
  Globe,
  AlignLeft,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { ProductDetail } from '../../components/public/ProductDetail';
import { CartSidebar } from '../../components/public/CartSidebar';
import { CheckoutModal } from '../../components/public/CheckoutModal';
import { formatCurrency } from '../../utils/currencyUtils';
import { AnimatedCarousel } from '../../components/public/AnimatedCarousel'; /*DF:componenetes carousel*/
import Pathtop from '../../components/public/Pathformtop.tsx'; /*DF:componenetes pathform*/
import Pathbottom from '../../components/public/Pathformbottom.tsx'; /*DF:componenetes pathform*/
import Pathleft from '../../components/public/Pathformleft.tsx'; /*DF:componenetes pathform*/
import { FloatingFooter } from '../../components/public/FloatingFooter.tsx'; /*DF:componenetes pathform*/

export const PublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items: cartItems } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'editorial'>(
    'list'
  );
  const [showHoursModal, setShowHoursModal] = useState(false);
  // --- Scroll hide header ---
// Estado para controlar si el header debe mostrarse (scroll up o hover)
  const [showHeader, setShowHeader] = useState(true);
  // Estado para controlar la posición de scroll (para el fondo)
  const [scrolled, setScrolled] = useState(false);
  // Estado para controlar el hover (ya lo tenías)
  const [isHovered, setIsHovered] = useState(false);
  // Estado para guardar la última posición de scroll para detectar la dirección
  const [lastScrollY, setLastScrollY] = useState(0);

// --- Lógica del Scroll ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Detección de la Posición (para el cambio de fondo)
      // Se activa 'scrolled' si el scroll es mayor a 50px
      const isScrolled = currentScrollY > 50;
      setScrolled(isScrolled);

      // 2. Detección de la Dirección (para esconder/mostrar)
      // Se muestra si: scroll hacia arriba O cerca de la cima
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowHeader(true);
      } 
      // Se esconde si: scroll hacia abajo Y está lejos de la cima
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);
  



  const loadMenuData = () => {
    try {
      setLoading(true);
      setError(null);

      const restaurants = loadFromStorage('restaurants', []);
      const restaurantData = restaurants.find(
        (r: Restaurant) => r.slug === slug || r.id === slug || r.domain === slug
      );

      if (!restaurantData) {
        setError(`Restaurante no encontrado: ${slug}`);
        setLoading(false);
        return;
      }

      const subscriptions = loadFromStorage('subscriptions', []);
      const subscription = subscriptions.find(
        (s: Subscription) => s.restaurant_id === restaurantData.id
      );

      if (!subscription || subscription.status !== 'active') {
        setError(
          'Este restaurante no está disponible en este momento. Suscripción inactiva o vencida.'
        );
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      const allCategories = loadFromStorage('categories', []);
      const allProducts = loadFromStorage('products', []);

      const restaurantCategories = allCategories
        .filter(
          (cat: Category) =>
            cat.restaurant_id === restaurantData.id && cat.active
        )
        .sort(
          (a: Category, b: Category) =>
            (a.order_position || 0) - (b.order_position || 0)
        );

      const restaurantProducts = allProducts.filter(
        (prod: Product) =>
          prod.restaurant_id === restaurantData.id && prod.status === 'active'
      );

      setCategories(restaurantCategories);
      setProducts(restaurantProducts);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el menú');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadMenuData();
    } else {
      setError('No se proporcionó un identificador de restaurante');
      setLoading(false);
    }
  }, [slug]);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory;

      if (!matchesCategory) return false;

      if (searchTerm === '') return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description &&
          product.description.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const getFeaturedProducts = () => {
    if (!restaurant?.settings.promo?.featured_product_ids?.length) {
      return products.filter((p) => p.is_featured).slice(0, 5);
    }

    const featuredIds = restaurant.settings.promo.featured_product_ids;
    return products.filter((p) => featuredIds.includes(p.id)).slice(0, 5);
  };

  const featuredProducts = getFeaturedProducts();
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const nextSlide = () => {
    setFeaturedSlideIndex(
      (prev) => (prev + 1) % Math.max(1, featuredProducts.length)
    );
  };

  const prevSlide = () => {
    setFeaturedSlideIndex(
      (prev) =>
        (prev - 1 + featuredProducts.length) %
        Math.max(1, featuredProducts.length)
    );
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurante no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'El menú que buscas no está disponible.'}
          </p>
        </div>
      </div>
    );
  }

  const theme = restaurant.settings.theme;
  const primaryColor = theme.primary_color || '#FFC700';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const menuBackgroundColor = theme.menu_background_color || '#ffffff';
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';
  const textColor = theme.primary_text_color || '#111827';
  const hasPromo =
    restaurant.settings.promo?.enabled &&
    restaurant.settings.promo?.vertical_promo_image;
  const internalDivStyle = scrolled ? {
    // 1. Fondo semi-transparente
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    // 2. Aplicación del Glassmorphism (blur al fondo de lo que hay detrás)
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', // Para compatibilidad
    transition: 'background-color 300ms, backdrop-filter 300ms' 
  } : {
    // Transparente cuando está en la parte superior
    backgroundColor: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    transition: 'background-color 300ms, backdrop-filter 300ms'
  };

  return (
    <div
      className="min-h-screen relative p-1 gap-1" /*DF:NECESITO QUE VERIFIQUEMOS ESTO*/
      style={
        {
          backgroundColor: menuBackgroundColor,
          '--primary-color': primaryColor,
          '--secondary-color': secondaryColor,
          '--menu-bg-color': menuBackgroundColor,
          '--card-bg-color': cardBackgroundColor,
          '--primary-text-color': primaryTextColor,
          '--secondary-text-color': secondaryTextColor,
          '--text-color': textColor,
          '--primary-font': theme.primary_font || 'Inter',
          '--secondary-font': theme.secondary_font || 'Poppins',
        } as React.CSSProperties
      }
    >
      <style>{`p, span { color: ${primaryTextColor} !important; }`}</style>
      {/*<LeftShape color={primaryColor} />*/}
      {/* DECORATIVE ORGANIC SHAPES - MATCHING REFERENCE */}
      {/*SE AGREGARON TODOS LOS SVG*/}
      {theme?.pathform &&  (
      <Pathleft
        color={primaryColor}
        className="
          absolute   
          opacity-90
          w-[160px] 
          h-[400px]
          translate-y-[30%]
          -translate-x-[10%]
          /*VERSION DESKTOP*/
          md:-top-20
          md:w-[320px]
          md:h-[800px]
          md:-translate-y-[15%]
          md:-translate-x-[10%]
        "
      /> 
      )}
      {theme?.pathform &&  (
      <Pathbottom
        color={primaryColor}
        className="
          /* Versión móvil */
          absolute 
          top-0 
          right-0 
          opacity-90 
          w-[150px]
          h-[150px]
          -translate-y-[25%]
          translate-x-[0%] 
            
          /* Versión escritorio */
          md:absolute 
          md:top-0 
          md:right-0 
          md:opacity-90
          md:w-[300px]
          md:h-[300px]
          -translate-y-[25%]
          translate-x-[0%]

        "
      />
      )}
     {theme?.pathform &&  (
      <Pathtop
        color={primaryColor}
        className="
          /* Versión móvil */
          md:absolute 
          md:-bottom-20 
          md:right-0 
          md:opacity-90 
          md:w-[300px]
          md:h-[300px]
          md:-translate-y-[27%]
          md:translate-x-[0%] 
          md:rotate-90  
        
          /* Versión escritorio */
          absolute 
          -bottom-20 
          right-0 
          opacity-90 
          w-[150px]
          h-[150px]
          -translate-y-[54%]
          translate-x-[0%] 
          rotate-90
          
        "
      />
      )}
      {' '}
      {/* HEADER */}
      <header 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`sticky top-0 z-50 transition-transform duration-300 pb-5 ${
          showHeader || isHovered ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {' '}
        {/* DF: SE QUITÓ EL BLUR */}
        <div className="w-full mx-auto px-4 py-2 rounded-lg"
          style={internalDivStyle} // <-- ¡AQUÍ ESTÁ EL BLUR!
        >
          
          
          {' '}
          {/* DF: SE REDUJO EL PADDING PARA QUE QUEDE MAS DELGADO */}
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-xs shadow-lg rounded-lg">
              <div className="relative">
                {/* Icono de lupa */}
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: primaryTextColor, stroke: primaryTextColor }}
                />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      setTimeout(() => {
                        document.getElementById(
                          'products-section'
                        ); /*DF:se quita scrooll intoview para que quite la section de featured*/
                      }, 100);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:outline-none transition-colors placeholder-opacity-70 custom-placeholder"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBackgroundColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                    color: primaryTextColor,
                    caretColor: primaryTextColor,
                    fontFamily: theme.secondary_font || 'Poppins',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = primaryTextColor)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = cardBackgroundColor)
                  }
                />

                {/* CSS dinámico para el placeholder*/}
                <style>{`
                  .custom-placeholder::placeholder {
                    color: ${primaryTextColor} !important;
                    opacity: 0.7;
                  }
                `}</style>
              </div>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 text-center">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-16 mx-auto"
                />
              ) : (
                <div
                  className="text-3xl font-bold" 
                  style={{
                    color: primaryColor,
                    fontFamily: theme.secondary_font || 'Poppins',
                  }}
                >
                  {restaurant.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Action Buttons */}

            <div className="flex items-center gap-2 flex-1 justify-end max-w-xs">
              {/* DF:OPEN/CLOSED STATUS BUTTON */}
              <button
                onClick={() => setShowHoursModal(true)}
                className="hidden  md:flex  md:h-[45px] items-center gap-2 p-3 rounded-lg transition-all hover:opacity-90 shadow-lg" /*DF:PARA QUE EL BOTON DE ABIERTO SOLO APAREZCA EN EL HEADER EN VERSION PC*/
                style={{
                  fontFamily: theme.primary_font || 'Poppins',
                  backgroundColor: (() => {
                    const now = new Date();
                    const dayNames = [
                      'sunday',
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                    ];
                    const currentDay = dayNames[now.getDay()];
                    const hours =
                      restaurant.settings.business_hours?.[currentDay];
                    if (!hours?.is_open) return '#fcaeae'; // cerrado = rojo
                    const currentTime = now.getHours() * 60 + now.getMinutes();
                    const [openH, openM] = hours.open.split(':').map(Number);
                    const [closeH, closeM] = hours.close.split(':').map(Number);
                    const openTime = openH * 60 + openM;
                    const closeTime = closeH * 60 + closeM;
                    return currentTime >= openTime && currentTime <= closeTime
                      ? '#AFFEBF'
                      : '#fcaeae'; // abierto o cerrado
                    
                  })(),
                }}
              >
                {(() => {
                  const now = new Date();
                  const dayNames = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ];
                  const currentDay = dayNames[now.getDay()];
                  const hours =
                    restaurant.settings.business_hours?.[currentDay];
                  const isOpen = (() => {
                    if (!hours?.is_open) return false;
                    const currentTime = now.getHours() * 60 + now.getMinutes();
                    const [openH, openM] = hours.open.split(':').map(Number);
                    const [closeH, closeM] = hours.close.split(':').map(Number);
                    const openTime = openH * 60 + openM;
                    const closeTime = closeH * 60 + closeM;
                    return currentTime >= openTime && currentTime <= closeTime;
                  })();

                  // 🎨 Cambia estos valores según los colores que prefieras
                  const textColor = isOpen ? '#1d4b40' : '#491c1c'; // texto verde oscuro si abierto, blanco si cerrado
                  const iconColor = isOpen ? '#1d4b40' : '#491c1c'; // mismo color para el ícono

                  return (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" style={{ color: iconColor }} />
                      <div className="text-right">
                        <h5
                          className="font-bold text-sm"
                          style={{
                            color: textColor,
                            fontFamily: theme.primary_font || 'Poppins',
                            textTransform: 'uppercase',
                          }}
                        >
                          {isOpen ? 'Abierto' : 'Cerrado'}
                        </h5>
                      </div>
                    </div>
                  );
                })()}
              </button>
              {hasPromo && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="p-3 rounded-lg border transition-colors relative hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Gift
                    className="w-5 h-5"
                    style={{
                      color: primaryColor,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px', // antes 6px → negativo para que quede encima del borde
                      right: '-4px', // antes 6px → negativo para que sobresalga del borde
                      width: '17px',
                      height: '17px',
                      backgroundColor: secondaryColor,
                      borderRadius: '50%',
                    }}
                  />
                </button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="p-3 rounded-lg border hover:opacity-90 transition-colors relative shadow-lg"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: cardBackgroundColor,
                  borderRadius:
                    theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                }}
              >
                <ShoppingCart
                  className="w-5 h-5"
                  style={{ color: primaryColor, stroke: primaryColor }}
                />
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {!searchTerm && featuredProducts.length > 0 && (
        <div className="text-left px-[15px]  md:px-[210px] md:-mt-[9px] md:-mb-[30px] scale-[0.85]">
          {' '}
          {/*DF:pasar toda esta seccion completa*/}
          <p
            className="text-xl"
            style={{
              color: textColor,
              fontFamily: theme.secondary_font || 'Poppins',
            }}
          >
            Te presentamos nuestros
          </p>
          <h2
            className="text-5xl font-bold "
            style={{
              color: textColor,
              fontFamily: theme.primary_font || 'Poppins',
            }}
          >
            DESTACADOS
          </h2>
          <div className="flex items-left justify-left gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-current"
                style={{ color: primaryColor }}
              />
            ))}
          </div>
        </div>
      )}
      {/* ANIMATED CAROUSEL */}
      {!searchTerm && featuredProducts.length > 0 && (
        <AnimatedCarousel
          products={featuredProducts}
          primaryColor={primaryColor}
          textColor={textColor}
          cardBackgroundColor={cardBackgroundColor}
          fontFamily={theme.secondary_font || 'Poppins'}
          onProductClick={setSelectedProduct}
        />
      )}
      {/* PRODUCTS LIST */}
      <main
        className="max-w-6xl mx-auto pb-[74px] md:-mt-[20px] md:pb-[125px] py-1  relative z-10 "
        id="products-section"
      >
        {' '}
        {/*DF:Se disminuye padding para que quede todo mas pegado*/}
        {/* CATEGORIES TABS - CENTERED */}
        <div className="flex flex-col justify-center items-center w-full max-w-7xl mx-auto py-4 relative z-20 md:items-center md:flex-row  md:justify-between ">
          {/* 1. SECCIÓN DE CATEGORÍAS (Izquierda en móvil / Centro en desktop) */}
          {/* w-full md:w-auto md:mx-auto permite el scroll en móvil y centra en desktop. */}
          <div className="w-full  md:mx-auto">
            <div className="flex gap-2 py-[2px] overflow-x-auto scrollbar-hide justify-start ;">
              {' '}
              {/* Eliminamos justify-center de aquí */}
              {/* Botón 'Todos' */}
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-6 py-2 whitespace-nowrap transition-all font-medium text-sm flex-shrink-0"
                style={{
                  backgroundColor:
                    selectedCategory === 'all' ? primaryColor : 'transparent',
                  color:
                    selectedCategory === 'all' ? secondaryTextColor : primaryColor,
                  border: `1px solid ${primaryColor}`,
                  borderRadius:
                    theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  fontFamily: theme.primary_font || 'Inter',
                }}
              >
                Todos
              </button>
              {/* Mapeo de Categorías */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="px-6 py-2 whitespace-nowrap transition-all font-medium text-sm flex-shrink-0"
                  style={{
                    backgroundColor:
                      selectedCategory === category.id
                        ? primaryColor
                        : 'transparent',
                    color:
                      selectedCategory === category.id
                        ? secondaryTextColor
                        : primaryColor,
                    border: `1px solid ${primaryColor}`,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                    fontFamily: theme.primary_font || 'Inter',
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SELECTOR DE VISTA (Derecha en móvil y desktop) */}
          {/* w-full mt-4 en móvil para ocupar el ancho debajo de las categorías.
               md:w-auto md:mt-0 en desktop para volver a su ancho y alinearse a la derecha. */}
          <div className="flex justify-end gap-2 w-full md:w-auto mt-4 md:mt-0">

              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'shadow-md' : 'opacity-80'
                }`}
                style={{
                  backgroundColor: viewMode === 'list' ? cardBackgroundColor : 'rgba(255,255,255,0.4)',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                }}
              >
              <List
                className="w-5 h-5"
                style={{
                  color: viewMode === 'list' ? primaryColor : textColor,
                }}
              />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'shadow-md' : 'opacity-80'
              }`}
                style={{
                  backgroundColor: viewMode === 'grid' ? cardBackgroundColor : 'rgba(255,255,255,0.4)',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                }}
            >
              <Grid3x3
                className="w-5 h-5"
                style={{
                  color: viewMode === 'grid' ? primaryColor : textColor,
                }}
              />
            </button>
            <button
              onClick={() => setViewMode('editorial')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                viewMode === 'editorial' ? 'shadow-md' : 'opacity-80'
              }`}
                style={{
                  backgroundColor: viewMode === 'editorial' ? cardBackgroundColor : 'rgba(255,255,255,0.4)',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                }}
            >
              <AlignLeft
                className="w-5 h-5"
                style={{
                  color: viewMode === 'editorial' ? primaryColor : textColor,
                }}
              />
            </button>
          </div>
        </div>
        {/* View Mode Selector */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p
              className="text-gray-600"
              style={{ fontFamily: theme.primary_font || 'Inter' }}
            >
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'list'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' /*DF: agregar scale para reducir un poco el tamaño*/
                : viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2'
            }
          >
            {filteredProducts.map((product) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;

              if (viewMode === 'editorial') {
                return (
                  <div
                    key={product.id}
                    className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      borderRadius:
                        theme.button_style === 'rounded'
                          ? '0.75rem'
                          : '0.25rem',
                      backgroundColor: cardBackgroundColor,
                    }}
                  >
                    <div className="flex flex-col md:flex-row gap-2 ">
                      {' '}
                      {/*DF:Se quito el pading*/}
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={`
                            w-full md:w-[164px] md:h-[154px] object-cover flex-shrink-0
                            ${
                              theme.button_style === 'rounded'
                                ? 'md:rounded-lg md:rounded-tr-none md:rounded-br-none'
                                : 'md:rounded-sm md:rounded-tr-none md:rounded-br-none'
                            }
                          `}
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-center p-2">
                        <h2
                          className="font-bold mb-3"
                          style={{
                            fontFamily: theme.primary_font || 'Poppins',
                            color: primaryColor,
                          }}
                        >
                          {product.name}
                        </h2>
                        <p
                          className="mb-4 text-base leading-relaxed line-clamp-2"
                          style={{
                            fontFamily: theme.secondary_font  || 'Inter',
                            color: secondaryTextColor,
                          }}
                        >
                          {product.description}
                        </p>
                        <span
                          className="font-bold text-2xl"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`,
                          }}
                        >
                          {formatCurrency(
                          minPrice,
                          restaurant.settings.currency || 'USD'
                        )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (viewMode === 'grid') {
                return (
                  <div
                    key={product.id}
                    className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      borderRadius:
                        theme.button_style === 'rounded'
                          ? '0.75rem'
                          : '0.25rem',
                      backgroundColor: cardBackgroundColor,
                    }}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="aspect-[4/3] w-full  object-cover" /*DF:SE AGREGA ASPECT PARA QUE SE VEAN DEL MISMO TAMAÑO*/
                      />
                    )}
                    <div className="p-2 ">
                      <h2
                        className="font-bold line-clamp-1"
                        style={{
                          fontSize: '16px',
                          fontFamily: theme.primary_font || 'Poppins',
                          color: primaryColor,
                        }}
                      >
                        {product.name}
                      </h2>
                      <p
                        className=" text-base leading-relaxed line-clamp-2" /*DF: SE LE AGREGO LINE-CLAMP 2 PARA QUE SE VIERA LA DESCRIPCION*/
                        style={{
                          fontFamily: theme.secondary_font || 'Inter',
                          color: secondaryTextColor,
                        }}
                      >
                        {product.description}
                      </p>
                      <span
                        className="font-bold text-lg"
                        style={{
                          fontFamily: theme.secondary_font || 'Poppins',
                          cssText: `color: ${primaryColor} !important;`,
                        }}
                      >
                        {formatCurrency(
                          minPrice,
                          restaurant.settings.currency || 'USD'
                        )}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={product.id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-left gap-4 p-4 pl-0 py-0"
                  onClick={() => setSelectedProduct(product)}
                  style={{
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                    display: 'flex',
                    backgroundColor: cardBackgroundColor,
                  }}
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover rounded-xl flex-shrink-0 " /*DF: agregue el rounded-xl para que se vea cuadrada la imagen*/
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        borderTopRightRadius: '0px',
                        borderBottomRightRadius:
                          '0px' /*DF:configurar las imagenes para que vayan al borde*/,
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0 p-4">
                    <h2
                      className="font-bold mb-1 truncate"
                      style={{
                        fontSize: '16px',
                        fontFamily: theme.primary_font || 'Poppins',
                        color: primaryColor,
                      }}
                    >
                      {product.name}
                    </h2>
                    <p
                      className="text-gray-600 text-sm mb-2 line-clamp-2"
                      style={{ fontFamily: theme.secondary_font || 'Inter',}}
                    >
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold text-lg"
                        style={{
                          fontFamily: theme.secondary_font || 'Poppins',
                          cssText: `color: ${primaryColor} !important;`,
                        }}
                      >
                        {formatCurrency(
                          minPrice,
                          restaurant.settings.currency || 'USD'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {/* PROMOTIONAL MODAL */}
      {showPromoModal && hasPromo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius:
                theme.button_style === 'rounded' ? '1rem' : '0.5rem',
            }}
          >
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              style={{
                borderRadius:
                  theme.button_style === 'rounded' ? '9999px' : '0.5rem',
              }}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <img
              src={restaurant.settings.promo.vertical_promo_image}
              alt="Promoción"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          restaurant={restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {/* CART SIDEBAR */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        restaurant={restaurant}
      />
      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        restaurant={restaurant}
      />
      {/* HOURS MODAL */}
      {showHoursModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowHoursModal(false)}
        >
          <div
            className="relative max-w-md w-full rounded-lg overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: cardBackgroundColor,
              borderRadius:
                theme.button_style === 'rounded' ? '1rem' : '0.5rem',
            }}
          >
            <button
              onClick={() => setShowHoursModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X
                className="w-5 h-5"
                style={{ color: primaryTextColor, stroke: primaryTextColor }}
              />
            </button>
            <h3
              className="text-xl font-bold mb-4"
              style={{
                color: textColor,
                fontFamily: theme.secondary_font || 'Poppins',
              }}
            >
              Horarios de Atención
            </h3>
            <div className="space-y-3">
              {restaurant.settings.business_hours &&
                Object.entries(restaurant.settings.business_hours).map(
                  ([day, hours]: [string, any]) => {
                    const dayNames: Record<string, string> = {
                      monday: 'Lunes',
                      tuesday: 'Martes',
                      wednesday: 'Miércoles',
                      thursday: 'Jueves',
                      friday: 'Viernes',
                      saturday: 'Sábado',
                      sunday: 'Domingo',
                    };
                    return (
                      <div
                        key={day}
                        className="flex justify-between items-center py-2 border-b "
                        style={{ borderColor: textColor }}
                      >
                        <span
                          className="font-medium"
                          style={{
                            color: textColor,
                            fontFamily: theme.primary_font || 'Inter',
                          }}
                        >
                          {dayNames[day]}
                        </span>
                        <span
                          className="text-gray-600"
                          style={{ fontFamily: theme.text_color || 'Inter' }}
                        >
                          {hours.is_open
                            ? `${hours.open} - ${hours.close}`
                            : 'Cerrado'}
                        </span>
                      </div>
                    );
                  }
                )}
            </div>
          </div>
        </div>
      )}
      {/* FLOATING FOOTER BAR */}      
      <div
        className="hidden md:block fixed bottom-2 rounded-b-xl rounded-tr-xl  left-[24px] right-[24px]  md:left-4 md:right-4 md:rounded-b-xl md:rounded-t-xl  md:left-4 md:right-4 py-1 shadow-lg z-40 " /* DF: se le agregar este codigo para los bordes redondeados y padding a los lados*/
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-center">
            {/* OPEN/CLOSED STATUS BUTTON */}
            <button
              onClick={() => setShowHoursModal(true)}
              className="fixed md:hidden left-[24px]  bottom-[82px] transform -translate-y-1/2 shadow-lg px-3 py-3 hover:shadow-xl z-10 rounded-t-xl"
              style={{
                backgroundColor: (() => {
                  const now = new Date();
                  const dayNames = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ];
                  const currentDay = dayNames[now.getDay()];
                  const hours =
                    restaurant.settings.business_hours?.[currentDay];
                  if (!hours?.is_open) return '#fcaeae'; // cerrado = rojo
                  const currentTime = now.getHours() * 60 + now.getMinutes();
                  const [openH, openM] = hours.open.split(':').map(Number);
                  const [closeH, closeM] = hours.close.split(':').map(Number);
                  const openTime = openH * 60 + openM;
                  const closeTime = closeH * 60 + closeM;
                  return currentTime >= openTime && currentTime <= closeTime
                    ? '#AFFEBF'
                    : '#fcaeae'; // abierto o cerrado
                })(),
              }}
            >
              {(() => {
                const now = new Date();
                const dayNames = [
                  'sunday',
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                ];
                const currentDay = dayNames[now.getDay()];
                const hours = restaurant.settings.business_hours?.[currentDay];
                const isOpen = (() => {
                  if (!hours?.is_open) return false;
                  const currentTime = now.getHours() * 60 + now.getMinutes();
                  const [openH, openM] = hours.open.split(':').map(Number);
                  const [closeH, closeM] = hours.close.split(':').map(Number);
                  const openTime = openH * 60 + openM;
                  const closeTime = closeH * 60 + closeM;
                  return currentTime >= openTime && currentTime <= closeTime;
                })();

                // 🎨 Cambia estos valores según los colores que prefieras
                const textColor = isOpen ? '#1d4b40' : '#491c1c'; // texto verde oscuro si abierto, blanco si cerrado
                const iconColor = isOpen ? '#1d4b40' : '#491c1c'; // mismo color para el ícono

                return (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: iconColor }} />
                    <div className="text-right">
                      <h5
                        className="font-bold text-sm"
                        style={{
                          color: textColor,
                          fontFamily: theme.secondary_font || 'Poppins',
                        }}
                      >
                        {isOpen ? 'Abierto' : 'Cerrado'}
                      </h5>
                    </div>
                  </div>
                );
              })()}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <MapPin
                className="w-4 h-4"
                style={{
                  color: secondaryTextColor,
                  stroke: secondaryTextColor,
                }}
              />
              <span
                className="font-medium"
                style={{
                  fontFamily: theme.primary_font || 'Inter',
                  cssText: `color: ${secondaryTextColor} !important;`,
                }}
              >
                {restaurant.address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {restaurant.settings.social_media?.website && (
                <a
                  href={restaurant.settings.social_media.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Globe
                    className="w-5 h-5"
                    style={{ color: primaryColor, stroke: primaryColor }}
                  />
                </a>
              )}
              {restaurant.settings.social_media?.tiktok && (
                <a
                  href={restaurant.settings.social_media.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill={primaryColor}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-6.95a8.16 8.16 0 004.65 1.46v-3.4a4.84 4.84 0 01-1.2-.5z" />
                  </svg>
                </a>
              )}

              {restaurant.settings.social_media?.twitter && (
                <a
                  href={restaurant.settings.social_media.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <svg
                    className="w-5 h-5 "
                    fill={primaryColor}
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  {/*<Twitter className="w-5 h-5" style={{ color: primaryColor, stroke: primaryColor }} />*/}
                </a>
              )}
              {restaurant.settings.social_media?.facebook && (
                <a
                  href={restaurant.settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Facebook
                    className="w-5 h-5"
                    style={{ color: primaryColor, stroke: primaryColor }}
                  />
                </a>
              )}
              {restaurant.settings.social_media?.instagram && (
                <a
                  href={restaurant.settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Instagram
                    className="w-5 h-5"
                    style={{ color: primaryColor, stroke: primaryColor }}
                  />
                </a>
              )}
              {restaurant.settings.social_media?.whatsapp && (
                <a
                  href={restaurant.settings.social_media.phone}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill={primaryColor}
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {/*<Phone className="w-5 h-5" style={{ color: primaryColor, stroke: primaryColor }} />*/}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ✅ SOLO MÓVIL */}
      <div className="block md:hidden">
        <FloatingFooter
          textColor={primaryTextColor}
          restaurant={restaurant}
          primaryColor={primaryColor}
          secondaryTextColor={secondaryTextColor}
          cardBackgroundColor={cardBackgroundColor}
          theme={theme}
        />
      </div>
    </div>
  );
};
