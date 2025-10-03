// Translation system for the restaurant management app
export type Language = 'es' | 'en';

export interface Translations {
  // Common
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  create: string;
  update: string;
  loading: string;
  search: string;
  filter: string;
  actions: string;
  status: string;
  date: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  total: string;
  subtotal: string;
  yes: string;
  no: string;
  close: string;
  view: string;
  print: string;
  download: string;
  active: string;
  inactive: string;
  pending: string;
  confirmed: string;
  preparing: string;
  ready: string;
  delivered: string;
  cancelled: string;
  
  // Navigation
  dashboard: string;
  categories: string;
  menu: string;
  orders: string;
  customers: string;
  subscription: string;
  settings: string;
  analytics: string;
  
  // Auth
  login: string;
  register: string;
  logout: string;
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  ownerName: string;
  acceptTerms: string;
  backToLogin: string;
  demoAccounts: string;
  superadmin: string;
  restaurant: string;
  
  // Dashboard
  totalProducts: string;
  activeProducts: string;
  todayOrders: string;
  totalSales: string;
  recentOrders: string;
  restaurantStatus: string;
  lastUpdate: string;
  noOrdersYet: string;
  ordersWillAppear: string;
  
  // Orders
  orderManagement: string;
  orderNumber: string;
  customer: string;
  orderType: string;
  pickup: string;
  delivery: string;
  table: string;
  completedToday: string;
  inPreparation: string;
  printTicket: string;
  confirmOrder: string;
  cancelOrder: string;
  nextStep: string;
  customerInfo: string;
  products: string;
  orderSummary: string;
  specialInstructions: string;
  deliveryAddress: string;
  references: string;
  estimatedTime: string;
  thankYouOrder: string;
  
  // Products
  productManagement: string;
  newProduct: string;
  productName: string;
  category: string;
  price: string;
  variations: string;
  ingredients: string;
  noProductsInCategory: string;
  createFirstProduct: string;
  productImages: string;
  variationsAndPrices: string;
  addVariation: string;
  addIngredient: string;
  preparationTime: string;
  productStatus: string;
  draft: string;
  outOfStock: string;
  archived: string;
  optional: string;
  extraCost: string;
  productUpdated: string;
  productCreated: string;
  productDeleted: string;
  productArchived: string;
  
  // Categories
  categoryManagement: string;
  newCategory: string;
  categoryName: string;
  noCategoriesCreated: string;
  createFirstCategory: string;
  categoryIcon: string;
  categoryUpdated: string;
  categoryCreated: string;
  categoryDeleted: string;
  categoryActivated: string;
  categoryDeactivated: string;
  order: string;
  
  // Customers
  customerManagement: string;
  totalCustomers: string;
  vipCustomers: string;
  frequentCustomers: string;
  averageSpent: string;
  contact: string;
  ordersCount: string;
  totalSpent: string;
  orderTypes: string;
  segment: string;
  lastOrder: string;
  newCustomer: string;
  regular: string;
  frequent: string;
  vip: string;
  
  // Settings
  generalSettings: string;
  regionalSettings: string;
  language: string;
  currency: string;
  businessHours: string;
  deliverySettings: string;
  tableOrders: string;
  qrCodes: string;
  themeSettings: string;
  socialMedia: string;
  notifications: string;
  restaurantInfo: string;
  contactInfo: string;
  businessInfo: string;
  operationalSettings: string;
  enabled: string;
  disabled: string;
  minimumOrder: string;
  deliveryCost: string;
  deliveryZones: string;
  numberOfTables: string;
  enableQRCodes: string;
  printAll: string;
  downloadAll: string;
  mesa: string;
  
  // Analytics
  totalRevenue: string;
  averageTicket: string;
  monthlyOrders: string;
  ordersByType: string;
  ordersByStatus: string;
  topProducts: string;
  recentActivity: string;
  filterByDates: string;
  from: string;
  to: string;
  clearFilters: string;
  showingDataFrom: string;
  until: string;
  today: string;
  notEnoughData: string;
  noSalesYet: string;
  sold: string;
  
  // Subscription
  subscriptionPlans: string;
  choosePlan: string;
  currentPlan: string;
  planActivated: string;
  freePlan: string;
  basicPlan: string;
  proPlan: string;
  businessPlan: string;
  mostPopular: string;
  unlimited: string;
  upTo: string;
  advancedStats: string;
  customDomain: string;
  prioritySupport: string;
  advancedCustomization: string;
  perfectToStart: string;
  forGrowingRestaurants: string;
  forChainsAndFranchises: string;
  needHelp: string;
  allPlansInclude: string;
  canChangeAnytime: string;
  
  // Public Menu
  addToCart: string;
  cart: string;
  checkout: string;
  yourOrder: string;
  cartEmpty: string;
  addProductsToStart: string;
  proceedToCheckout: string;
  orderConfirmed: string;
  orderSent: string;
  willContactSoon: string;
  continue: string;
  finalizeOrder: string;
  orderTypeSelection: string;
  pickupAtRestaurant: string;
  tableOrder: string;
  selectTable: string;
  fullName: string;
  optionalEmail: string;
  completeAddress: string;
  locationReferences: string;
  
  // Days of week
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  
  // Months
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  
  // Time
  open: string;
  closed: string;
  openNow: string;
  closedNow: string;
  hours: string;
  minutes: string;
  
  // Errors and Messages
  error: string;
  success: string;
  warning: string;
  info: string;
  required: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordsDontMatch: string;
  userNotFound: string;
  incorrectPassword: string;
  emailAlreadyRegistered: string;
  registrationSuccessful: string;
  accountPendingApproval: string;
  unexpectedError: string;
  confirmDelete: string;
  actionCannotBeUndone: string;
  
  // Limits and Restrictions
  productLimitReached: string;
  categoryLimitReached: string;
  upgradeSubscription: string;
  addMoreProducts: string;
  addMoreCategories: string;
  
  // Super Admin
  superAdminPanel: string;
  superAdminDashboard: string;
  restaurantsManagement: string;
  usersManagement: string;
  subscriptionsManagement: string;
  systemStatistics: string;
}

export const translations: Record<Language, Translations> = {
  es: {
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    create: 'Crear',
    update: 'Actualizar',
    loading: 'Cargando',
    search: 'Buscar',
    filter: 'Filtrar',
    actions: 'Acciones',
    status: 'Estado',
    date: 'Fecha',
    name: 'Nombre',
    description: 'Descripción',
    email: 'Email',
    phone: 'Teléfono',
    address: 'Dirección',
    total: 'Total',
    subtotal: 'Subtotal',
    yes: 'Sí',
    no: 'No',
    close: 'Cerrar',
    view: 'Ver',
    print: 'Imprimir',
    download: 'Descargar',
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    
    // Navigation
    dashboard: 'Dashboard',
    categories: 'Categorías',
    menu: 'Menú',
    orders: 'Pedidos',
    customers: 'Clientes',
    subscription: 'Suscripción',
    settings: 'Configuración',
    analytics: 'Estadísticas',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    loginTitle: 'Iniciar Sesión',
    loginSubtitle: 'Accede a tu panel de administración',
    registerTitle: 'Registra tu Restaurante',
    registerSubtitle: 'Completa los datos para crear tu cuenta',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    restaurantName: 'Nombre del Restaurante',
    ownerName: 'Nombre del Propietario',
    acceptTerms: 'Acepto los ',
    backToLogin: 'Volver al Login',
    demoAccounts: 'Cuentas de demostración:',
    superadmin: 'Superadmin',
    restaurant: 'Restaurante',
    
    // Dashboard
    totalProducts: 'Productos',
    activeProducts: 'activos',
    todayOrders: 'Pedidos Hoy',
    totalSales: 'Ventas Totales',
    recentOrders: 'Pedidos Recientes',
    restaurantStatus: 'Estado del Restaurante',
    lastUpdate: 'Última actualización',
    noOrdersYet: 'No hay pedidos aún',
    ordersWillAppear: 'Los pedidos aparecerán aquí una vez que los clientes empiecen a ordenar.',
    
    // Orders
    orderManagement: 'Gestión de Pedidos',
    orderNumber: 'Pedido',
    customer: 'Cliente',
    orderType: 'Tipo',
    pickup: 'Recoger',
    delivery: 'Delivery',
    table: 'Mesa',
    completedToday: 'Completados Hoy',
    inPreparation: 'En Preparación',
    printTicket: 'Imprimir Ticket',
    confirmOrder: 'Confirmar',
    cancelOrder: 'Cancelar',
    nextStep: 'Siguiente Paso',
    customerInfo: 'Información del Cliente',
    products: 'Productos',
    orderSummary: 'Resumen del Pedido',
    specialInstructions: 'Instrucciones Especiales',
    deliveryAddress: 'Dirección de Entrega',
    references: 'Referencias',
    estimatedTime: 'Tiempo estimado',
    thankYouOrder: '¡Gracias por tu pedido!',
    
    // Products
    productManagement: 'Gestión de Menú',
    newProduct: 'Nuevo Producto',
    productName: 'Nombre del Producto',
    category: 'Categoría',
    price: 'Precio',
    variations: 'Variaciones',
    ingredients: 'Ingredientes',
    noProductsInCategory: 'No hay productos en esta categoría',
    createFirstProduct: 'Comienza creando tu primer producto para mostrar en el menú.',
    productImages: 'Imágenes del Producto',
    variationsAndPrices: 'Variaciones y Precios',
    addVariation: 'Agregar Variación',
    addIngredient: 'Agregar Ingrediente',
    preparationTime: 'Tiempo de Preparación',
    productStatus: 'Estado',
    draft: 'Borrador',
    outOfStock: 'Agotado',
    archived: 'Archivado',
    optional: 'Opcional',
    extraCost: 'Costo extra',
    productUpdated: 'Producto Actualizado',
    productCreated: 'Producto Creado',
    productDeleted: 'Producto Eliminado',
    productArchived: 'Producto Archivado',
    
    // Categories
    categoryManagement: 'Gestión de Categorías',
    newCategory: 'Nueva Categoría',
    categoryName: 'Nombre de la Categoría',
    noCategoriesCreated: 'No hay categorías creadas',
    createFirstCategory: 'Crea tu primera categoría para organizar tu menú.',
    categoryIcon: 'Icono (Emoji)',
    categoryUpdated: 'Categoría Actualizada',
    categoryCreated: 'Categoría Creada',
    categoryDeleted: 'Categoría Eliminada',
    categoryActivated: 'Categoría Activada',
    categoryDeactivated: 'Categoría Desactivada',
    order: 'Orden',
    
    // Customers
    customerManagement: 'Gestión de Clientes',
    totalCustomers: 'Total Clientes',
    vipCustomers: 'Clientes VIP',
    frequentCustomers: 'Frecuentes',
    averageSpent: 'Gasto Promedio',
    contact: 'Contacto',
    ordersCount: 'Pedidos',
    totalSpent: 'Total Gastado',
    orderTypes: 'Tipos de Pedido',
    segment: 'Segmento',
    lastOrder: 'Último Pedido',
    newCustomer: 'Nuevo',
    regular: 'Regular',
    frequent: 'Frecuente',
    vip: 'VIP',
    
    // Settings
    generalSettings: 'Configuración General',
    regionalSettings: 'Configuración Regional',
    language: 'Idioma',
    currency: 'Moneda',
    businessHours: 'Horarios de Atención',
    deliverySettings: 'Configuración de Delivery',
    tableOrders: 'Pedidos en Mesa',
    qrCodes: 'Códigos QR',
    themeSettings: 'Configuración de Tema',
    socialMedia: 'Redes Sociales',
    notifications: 'Notificaciones',
    restaurantInfo: 'Información del Restaurante',
    contactInfo: 'Información de Contacto',
    businessInfo: 'Información del Negocio',
    operationalSettings: 'Configuración Operacional',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
    minimumOrder: 'Pedido Mínimo',
    deliveryCost: 'Costo de Delivery',
    deliveryZones: 'Zonas de Delivery',
    numberOfTables: 'Número de Mesas',
    enableQRCodes: 'Habilitar Códigos QR',
    printAll: 'Imprimir Todos',
    downloadAll: 'Descargar Todos',
    mesa: 'Mesa',
    
    // Analytics
    totalRevenue: 'Ingresos Totales',
    averageTicket: 'Ticket Promedio',
    monthlyOrders: 'Pedidos por Mes',
    ordersByType: 'Pedidos por Tipo',
    ordersByStatus: 'Estados de Pedidos',
    topProducts: 'Productos Más Vendidos',
    recentActivity: 'Actividad Reciente',
    filterByDates: 'Filtrar por Fechas',
    from: 'Desde',
    to: 'Hasta',
    clearFilters: 'Limpiar Filtros',
    showingDataFrom: 'Mostrando datos desde',
    until: 'hasta',
    today: 'hoy',
    notEnoughData: 'No hay datos suficientes para mostrar',
    noSalesYet: 'No hay ventas registradas aún',
    sold: 'vendidos',
    
    // Subscription
    subscriptionPlans: 'Planes de Suscripción',
    choosePlan: 'Elige el plan que mejor se adapte a las necesidades de tu restaurante',
    currentPlan: 'Plan Actual',
    planActivated: '¡Plan Activado!',
    freePlan: 'Gratis',
    basicPlan: 'Basic',
    proPlan: 'Pro',
    businessPlan: 'Business',
    mostPopular: 'Más Popular',
    unlimited: 'ilimitados',
    upTo: 'Hasta',
    advancedStats: 'Estadísticas avanzadas',
    customDomain: 'Dominio personalizado',
    prioritySupport: 'Soporte prioritario',
    advancedCustomization: 'Personalización avanzada',
    perfectToStart: 'Perfecto para empezar',
    forGrowingRestaurants: 'Para restaurantes en crecimiento',
    forChainsAndFranchises: 'Para cadenas y franquicias',
    needHelp: '¿Necesitas ayuda para elegir?',
    allPlansInclude: 'Todos los planes incluyen acceso completo a nuestro sistema de gestión de menús y pedidos.',
    canChangeAnytime: 'Puedes cambiar de plan en cualquier momento.',
    
    // Public Menu
    addToCart: 'Agregar al Carrito',
    cart: 'Carrito',
    checkout: 'Finalizar Pedido',
    yourOrder: 'Tu Pedido',
    cartEmpty: 'Tu carrito está vacío',
    addProductsToStart: 'Agrega algunos productos para comenzar',
    proceedToCheckout: 'Proceder al Checkout',
    orderConfirmed: '¡Pedido Confirmado!',
    orderSent: '¡Tu pedido ha sido enviado!',
    willContactSoon: 'Hemos enviado tu pedido por WhatsApp al restaurante. Te contactarán pronto para confirmar.',
    continue: 'Continuar',
    finalizeOrder: 'Finalizar Pedido',
    orderTypeSelection: 'Tipo de Pedido',
    pickupAtRestaurant: 'En el restaurante',
    tableOrder: 'Pedido en mesa',
    selectTable: 'Seleccionar Mesa',
    fullName: 'Nombre Completo',
    optionalEmail: 'Email (opcional)',
    completeAddress: 'Dirección Completa',
    locationReferences: 'Referencias y puntos de ubicación',
    
    // Days of week
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    
    // Months
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',
    
    // Time
    open: 'Abierto',
    closed: 'Cerrado',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado',
    hours: 'horas',
    minutes: 'minutos',
    
    // Errors and Messages
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    required: 'obligatorio',
    invalidEmail: 'Email inválido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    userNotFound: 'Usuario no encontrado',
    incorrectPassword: 'Contraseña incorrecta',
    emailAlreadyRegistered: 'El email ya está registrado',
    registrationSuccessful: '¡Registro Exitoso!',
    accountPendingApproval: 'Tu cuenta está pendiente de aprobación por nuestro equipo.',
    unexpectedError: 'Error inesperado',
    confirmDelete: '¿Estás seguro de que quieres eliminar',
    actionCannotBeUndone: 'Esta acción no se puede deshacer.',
    
    // Limits and Restrictions
    productLimitReached: 'Límite de Productos Alcanzado',
    categoryLimitReached: 'Límite de Categorías Alcanzado',
    upgradeSubscription: 'Actualiza tu suscripción',
    addMoreProducts: 'para agregar más productos.',
    addMoreCategories: 'para agregar más categorías.',
    
    // Super Admin
    superAdminPanel: 'Panel de Superadministrador',
    superAdminDashboard: 'Dashboard Principal',
    restaurantsManagement: 'Gestión de Restaurantes',
    usersManagement: 'Gestión de Usuarios',
    subscriptionsManagement: 'Gestión de Suscripciones',
    systemStatistics: 'Estadísticas del Sistema',
  },
  
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    update: 'Update',
    loading: 'Loading',
    search: 'Search',
    filter: 'Filter',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    description: 'Description',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    total: 'Total',
    subtotal: 'Subtotal',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    view: 'View',
    print: 'Print',
    download: 'Download',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Navigation
    dashboard: 'Dashboard',
    categories: 'Categories',
    menu: 'Menu',
    orders: 'Orders',
    customers: 'Customers',
    subscription: 'Subscription',
    settings: 'Settings',
    analytics: 'Analytics',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    loginTitle: 'Login',
    loginSubtitle: 'Access your admin panel',
    registerTitle: 'Register your Restaurant',
    registerSubtitle: 'Complete the information to create your account',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    restaurantName: 'Restaurant Name',
    ownerName: 'Owner Name',
    acceptTerms: 'I accept the terms and conditions',
    backToLogin: 'Back to Login',
    demoAccounts: 'Demo accounts:',
    superadmin: 'Superadmin',
    restaurant: 'Restaurant',
    
    // Dashboard
    totalProducts: 'Products',
    activeProducts: 'active',
    todayOrders: 'Today Orders',
    totalSales: 'Total Sales',
    recentOrders: 'Recent Orders',
    restaurantStatus: 'Restaurant Status',
    lastUpdate: 'Last update',
    noOrdersYet: 'No orders yet',
    ordersWillAppear: 'Orders will appear here once customers start ordering.',
    
    // Orders
    orderManagement: 'Order Management',
    orderNumber: 'Order',
    customer: 'Customer',
    orderType: 'Type',
    pickup: 'Pickup',
    delivery: 'Delivery',
    table: 'Table',
    completedToday: 'Completed Today',
    inPreparation: 'In Preparation',
    printTicket: 'Print Ticket',
    confirmOrder: 'Confirm',
    cancelOrder: 'Cancel',
    nextStep: 'Next Step',
    customerInfo: 'Customer Information',
    products: 'Products',
    orderSummary: 'Order Summary',
    specialInstructions: 'Special Instructions',
    deliveryAddress: 'Delivery Address',
    references: 'References',
    estimatedTime: 'Estimated time',
    thankYouOrder: 'Thank you for your order!',
    
    // Products
    productManagement: 'Menu Management',
    newProduct: 'New Product',
    productName: 'Product Name',
    category: 'Category',
    price: 'Price',
    variations: 'Variations',
    ingredients: 'Ingredients',
    noProductsInCategory: 'No products in this category',
    createFirstProduct: 'Start by creating your first product to display on the menu.',
    productImages: 'Product Images',
    variationsAndPrices: 'Variations and Prices',
    addVariation: 'Add Variation',
    addIngredient: 'Add Ingredient',
    preparationTime: 'Preparation Time',
    productStatus: 'Status',
    draft: 'Draft',
    outOfStock: 'Out of Stock',
    archived: 'Archived',
    optional: 'Optional',
    extraCost: 'Extra cost',
    productUpdated: 'Product Updated',
    productCreated: 'Product Created',
    productDeleted: 'Product Deleted',
    productArchived: 'Product Archived',
    
    // Categories
    categoryManagement: 'Category Management',
    newCategory: 'New Category',
    categoryName: 'Category Name',
    noCategoriesCreated: 'No categories created',
    createFirstCategory: 'Create your first category to organize your menu.',
    categoryIcon: 'Icon (Emoji)',
    categoryUpdated: 'Category Updated',
    categoryCreated: 'Category Created',
    categoryDeleted: 'Category Deleted',
    categoryActivated: 'Category Activated',
    categoryDeactivated: 'Category Deactivated',
    order: 'Order',
    
    // Customers
    customerManagement: 'Customer Management',
    totalCustomers: 'Total Customers',
    vipCustomers: 'VIP Customers',
    frequentCustomers: 'Frequent',
    averageSpent: 'Average Spent',
    contact: 'Contact',
    ordersCount: 'Orders',
    totalSpent: 'Total Spent',
    orderTypes: 'Order Types',
    segment: 'Segment',
    lastOrder: 'Last Order',
    newCustomer: 'New',
    regular: 'Regular',
    frequent: 'Frequent',
    vip: 'VIP',
    
    // Settings
    generalSettings: 'General Settings',
    regionalSettings: 'Regional Settings',
    language: 'Language',
    currency: 'Currency',
    businessHours: 'Business Hours',
    deliverySettings: 'Delivery Settings',
    tableOrders: 'Table Orders',
    qrCodes: 'QR Codes',
    themeSettings: 'Theme Settings',
    socialMedia: 'Social Media',
    notifications: 'Notifications',
    restaurantInfo: 'Restaurant Information',
    contactInfo: 'Contact Information',
    businessInfo: 'Business Information',
    operationalSettings: 'Operational Settings',
    enabled: 'Enabled',
    disabled: 'Disabled',
    minimumOrder: 'Minimum Order',
    deliveryCost: 'Delivery Cost',
    deliveryZones: 'Delivery Zones',
    numberOfTables: 'Number of Tables',
    enableQRCodes: 'Enable QR Codes',
    printAll: 'Print All',
    downloadAll: 'Download All',
    mesa: 'Table',
    
    // Analytics
    totalRevenue: 'Total Revenue',
    averageTicket: 'Average Ticket',
    monthlyOrders: 'Monthly Orders',
    ordersByType: 'Orders by Type',
    ordersByStatus: 'Orders by Status',
    topProducts: 'Top Products',
    recentActivity: 'Recent Activity',
    filterByDates: 'Filter by Dates',
    from: 'From',
    to: 'To',
    clearFilters: 'Clear Filters',
    showingDataFrom: 'Showing data from',
    until: 'until',
    today: 'today',
    notEnoughData: 'Not enough data to display',
    noSalesYet: 'No sales recorded yet',
    sold: 'sold',
    
    // Subscription
    subscriptionPlans: 'Subscription Plans',
    choosePlan: 'Choose the plan that best fits your restaurant needs',
    currentPlan: 'Current Plan',
    planActivated: 'Plan Activated!',
    freePlan: 'Free',
    basicPlan: 'Basic',
    proPlan: 'Pro',
    businessPlan: 'Business',
    mostPopular: 'Most Popular',
    unlimited: 'unlimited',
    upTo: 'Up to',
    advancedStats: 'Advanced analytics',
    customDomain: 'Custom domain',
    prioritySupport: 'Priority support',
    advancedCustomization: 'Advanced customization',
    perfectToStart: 'Perfect to start',
    forGrowingRestaurants: 'For growing restaurants',
    forChainsAndFranchises: 'For chains and franchises',
    needHelp: 'Need help choosing?',
    allPlansInclude: 'All plans include full access to our menu and order management system.',
    canChangeAnytime: 'You can change plans at any time.',
    
    // Public Menu
    addToCart: 'Add to Cart',
    cart: 'Cart',
    checkout: 'Checkout',
    yourOrder: 'Your Order',
    cartEmpty: 'Your cart is empty',
    addProductsToStart: 'Add some products to get started',
    proceedToCheckout: 'Proceed to Checkout',
    orderConfirmed: 'Order Confirmed!',
    orderSent: 'Your order has been sent!',
    willContactSoon: 'We have sent your order via WhatsApp to the restaurant. They will contact you soon to confirm.',
    continue: 'Continue',
    finalizeOrder: 'Finalize Order',
    orderTypeSelection: 'Order Type',
    pickupAtRestaurant: 'At the restaurant',
    tableOrder: 'Table order',
    selectTable: 'Select Table',
    fullName: 'Full Name',
    optionalEmail: 'Email (optional)',
    completeAddress: 'Complete Address',
    locationReferences: 'References and location points',
    
    // Days of week
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    
    // Time
    open: 'Open',
    closed: 'Closed',
    openNow: 'Open now',
    closedNow: 'Closed',
    hours: 'hours',
    minutes: 'minutes',
    
    // Errors and Messages
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    required: 'required',
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    userNotFound: 'User not found',
    incorrectPassword: 'Incorrect password',
    emailAlreadyRegistered: 'Email is already registered',
    registrationSuccessful: 'Registration Successful!',
    accountPendingApproval: 'Your account is pending approval by our team.',
    unexpectedError: 'Unexpected error',
    confirmDelete: 'Are you sure you want to delete',
    actionCannotBeUndone: 'This action cannot be undone.',
    
    // Limits and Restrictions
    productLimitReached: 'Product Limit Reached',
    categoryLimitReached: 'Category Limit Reached',
    upgradeSubscription: 'Upgrade your subscription',
    addMoreProducts: 'to add more products.',
    addMoreCategories: 'to add more categories.',
    
    // Super Admin
    superAdminPanel: 'Super Admin Panel',
    superAdminDashboard: 'Main Dashboard',
    restaurantsManagement: 'Restaurant Management',
    usersManagement: 'User Management',
    subscriptionsManagement: 'Subscription Management',
    systemStatistics: 'System Statistics',
  },
};

export const useTranslation = (language: Language = 'es') => {
  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations['es'][key] || key;
  };
  
  return { t };
};