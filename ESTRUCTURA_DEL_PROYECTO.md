# Documentación Técnica - Sistema de Gestión de Restaurantes

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Sistema de Datos](#sistema-de-datos)
5. [Contextos y Estado Global](#contextos-y-estado-global)
6. [Rutas y Navegación](#rutas-y-navegación)
7. [Componentes Principales](#componentes-principales)
8. [Tipos de Datos](#tipos-de-datos)
9. [Guía de Edición](#guía-de-edición)
10. [Flujos de Usuario](#flujos-de-usuario)

---

## Descripción General

Esta es una aplicación web multi-tenant construida con React + TypeScript + Vite que permite a restaurantes crear y gestionar menús digitales. La aplicación tiene dos roles principales:

- **Super Admin**: Administra todos los restaurantes, usuarios y suscripciones del sistema
- **Restaurant Owner**: Gestiona su propio restaurante, menú, pedidos y configuraciones

### Tecnologías Principales
- **React 18.3.1** - Framework principal
- **TypeScript 5.5.3** - Tipado estático
- **React Router DOM 7.8.2** - Navegación
- **Tailwind CSS 3.4.1** - Estilos
- **Lucide React 0.344.0** - Iconos
- **Vite 5.4.2** - Build tool
- **LocalStorage** - Persistencia de datos (mock)

---

## Arquitectura de la Aplicación

### Flujo de Datos
```
localStorage (persistencia)
    ↓
mockData.ts (capa de datos)
    ↓
Contexts (AuthContext, CartContext, LanguageContext)
    ↓
Components/Pages (UI)
```

### Patrones de Diseño
- **Context API**: Para estado global (autenticación, carrito, idioma)
- **Component Composition**: Componentes reutilizables pequeños
- **Custom Hooks**: Lógica reutilizable (useToast, useAuth, useLanguage)
- **Props drilling prevention**: Uso extensivo de Context API

---

## Estructura de Carpetas

```
project/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── layout/         # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── public/         # Componentes para menú público
│   │   │   ├── CartSidebar.tsx
│   │   │   ├── CheckoutModal.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── restaurant/     # Componentes del restaurante
│   │   │   └── ProductForm.tsx
│   │   └── ui/             # Componentes UI genéricos
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   │
│   ├── contexts/           # Contextos de React
│   │   ├── AuthContext.tsx      # Autenticación y usuario
│   │   ├── CartContext.tsx      # Carrito de compras
│   │   └── LanguageContext.tsx  # Idioma y traducciones
│   │
│   ├── data/               # Datos y mock data
│   │   └── mockData.ts     # Datos de prueba y funciones de storage
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useToast.tsx    # Sistema de notificaciones
│   │
│   ├── pages/              # Páginas principales
│   │   ├── public/         # Páginas públicas
│   │   │   └── PublicMenu.tsx
│   │   ├── restaurant/     # Páginas del restaurante
│   │   │   ├── CategoriesManagement.tsx
│   │   │   ├── CustomersManagement.tsx
│   │   │   ├── MenuManagement.tsx
│   │   │   ├── OrdersManagement.tsx
│   │   │   ├── RestaurantAnalytics.tsx
│   │   │   ├── RestaurantDashboard.tsx
│   │   │   ├── RestaurantSettings.tsx
│   │   │   └── SubscriptionPlans.tsx
│   │   ├── superadmin/     # Páginas del super admin
│   │   │   ├── RestaurantsManagement.tsx
│   │   │   ├── SubscriptionsManagement.tsx
│   │   │   ├── SuperAdminAnalytics.tsx
│   │   │   ├── SuperAdminDashboard.tsx
│   │   │   ├── SupportTicketsManagement.tsx
│   │   │   └── UsersManagement.tsx
│   │   ├── AuthPage.tsx    # Página de login/registro
│   │   └── DashboardPage.tsx # Dashboard principal
│   │
│   ├── types/              # Definiciones de TypeScript
│   │   └── index.ts        # Todos los tipos e interfaces
│   │
│   ├── utils/              # Utilidades
│   │   ├── currencyUtils.ts    # Formateo de moneda
│   │   ├── themeUtils.ts       # Gestión de temas
│   │   └── translations.ts     # Sistema de traducciones
│   │
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
│
├── .env                    # Variables de entorno
├── package.json            # Dependencias
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
└── tailwind.config.js      # Configuración Tailwind

```

---

## Sistema de Datos

### LocalStorage como Base de Datos

La aplicación usa localStorage para simular una base de datos. Los datos se almacenan en estas claves:

```typescript
'users'          // Usuarios del sistema
'restaurants'    // Restaurantes registrados
'subscriptions'  // Suscripciones activas
'categories'     // Categorías de productos
'products'       // Productos del menú
'orders'         // Pedidos
'currentAuth'    // Sesión actual del usuario
```

### Funciones Principales en mockData.ts

```typescript
// Cargar datos del localStorage
loadFromStorage<T>(key: string, defaultValue?: T): T

// Guardar datos al localStorage
saveToStorage<T>(key: string, data: T): void

// Inicializar datos de prueba
initializeData(): void
```

### Datos de Prueba Incluidos

**Usuario Super Admin:**
- Email: admin@sistema.com
- Password: admin123

**Usuario Restaurante:**
- Email: orlando@gmail.com
- Password: orlando123
- Restaurante: "Restaurante Orlando"
- Slug: restaurante-orlando

---

## Contextos y Estado Global

### AuthContext

**Ubicación**: `src/contexts/AuthContext.tsx`

**Responsabilidades**:
- Gestión de autenticación (login, register, logout)
- Información del usuario actual
- Información del restaurante asociado
- Estado de carga inicial
- Verificación de estado de suscripción

**API del Context**:
```typescript
interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}
```

**Uso**:
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, restaurant, login, logout, isAuthenticated } = useAuth();
```

### CartContext

**Ubicación**: `src/contexts/CartContext.tsx`

**Responsabilidades**:
- Gestión del carrito de compras
- Añadir/eliminar productos
- Calcular totales
- Gestionar cantidades

**API del Context**:
```typescript
interface CartContextType {
  items: CartItem[];
  addItem: (product, variation, quantity?, notes?) => void;
  removeItem: (productId, variationId) => void;
  updateQuantity: (productId, variationId, quantity) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
```

### LanguageContext

**Ubicación**: `src/contexts/LanguageContext.tsx`

**Responsabilidades**:
- Gestión del idioma de la interfaz
- Traducciones
- Persistir idioma en configuración del restaurante

**API del Context**:
```typescript
interface LanguageContextType {
  language: Language; // 'es' | 'en'
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; // Función de traducción
}
```

---

## Rutas y Navegación

### Rutas Principales

```typescript
// Rutas públicas
'/login'                    // Página de autenticación
'/menu/:slug'              // Menú público del restaurante
'/:slug'                   // Alias del menú público

// Rutas privadas (requieren autenticación)
'/dashboard'               // Dashboard principal (redirige según rol)

// Redirección
'/'                        // Redirige a /login
'*'                        // Cualquier ruta no encontrada -> /login
```

### Componente PrivateRoute

**Ubicación**: `src/App.tsx`

**Funcionalidad**:
- Verifica autenticación
- Muestra loading mientras carga
- Verifica estado de suscripción del restaurante
- Redirige a /login si no está autenticado
- Muestra mensaje si la suscripción expiró

### Lógica de Dashboard

El `DashboardPage` renderiza contenido diferente según el rol:

**Super Admin**:
- dashboard → SuperAdminDashboard
- restaurants → RestaurantsManagement
- users → UsersManagement
- subscriptions → SubscriptionsManagement
- support → SupportTicketsManagement
- analytics → SuperAdminAnalytics

**Restaurant Owner**:
- dashboard → RestaurantDashboard
- menu → MenuManagement
- categories → CategoriesManagement
- orders → OrdersManagement
- customers → CustomersManagement
- subscription → SubscriptionPlans
- settings → RestaurantSettings
- analytics → RestaurantAnalytics (solo con plan de pago)

---

## Componentes Principales

### Layout Components

#### Header (`components/layout/Header.tsx`)

**Props**:
```typescript
interface HeaderProps {
  onNavigateToSettings?: () => void;
}
```

**Funcionalidad**:
- Muestra logo y nombre del restaurante
- Email del usuario
- Botón de configuración (solo restaurant owner)
- Botón de logout

#### Sidebar (`components/layout/Sidebar.tsx`)

**Props**:
```typescript
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
```

**Funcionalidad**:
- Navegación principal
- Tabs diferentes según rol de usuario
- Acceso a analytics solo con suscripción de pago

### UI Components

#### Button (`components/ui/Button.tsx`)
Componente de botón reutilizable con variantes y tamaños.

#### Modal (`components/ui/Modal.tsx`)
Modal genérico para diálogos y formularios.

#### Badge (`components/ui/Badge.tsx`)
Etiquetas de estado (success, warning, error, info, gray).

#### Input (`components/ui/Input.tsx`)
Input de formulario con validación y estilos.

#### Toast (`components/ui/Toast.tsx`)
Sistema de notificaciones temporales.

---

## Tipos de Datos

### Interfaces Principales

```typescript
// Usuario del sistema
interface User {
  id: string;
  email: string;
  password: string;
  role: 'restaurant_owner' | 'super_admin';
  created_at: string;
  updated_at: string;
}

// Restaurante
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  logo?: string;
  owner_name?: string;
  owner_id: string;
  is_active: boolean;
  settings: RestaurantSettings;
  created_at: string;
  updated_at: string;
}

// Producto
interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  images: string[];
  variations: ProductVariation[];
  ingredients?: ProductIngredient[];
  dietary_restrictions?: string[];
  spice_level?: number;
  preparation_time?: string;
  status: 'active' | 'inactive';
  sku?: string;
  is_available: boolean;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Categoría
interface Category {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Pedido
interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  customer: Customer;
  items: OrderItem[];
  order_type: 'pickup' | 'delivery' | 'table';
  delivery_address?: string;
  table_number?: string;
  delivery_cost?: number;
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  estimated_time?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

// Suscripción
interface Subscription {
  id: string;
  restaurant_id: string;
  plan_type: 'free' | 'basic' | 'pro' | 'business';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}
```

**Ver todas las interfaces**: `src/types/index.ts`

---

## Guía de Edición

### Cómo Agregar una Nueva Página

1. **Crear el archivo de la página**:
```typescript
// src/pages/restaurant/NuevaPagina.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const NuevaPagina: React.FC = () => {
  const { restaurant } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      {/* Tu contenido aquí */}
    </div>
  );
};
```

2. **Importar en DashboardPage**:
```typescript
// src/pages/DashboardPage.tsx
import { NuevaPagina } from './restaurant/NuevaPagina';
```

3. **Agregar caso en renderContent**:
```typescript
case 'nueva-pagina':
  return <NuevaPagina />;
```

4. **Agregar opción en Sidebar**:
```typescript
// src/components/layout/Sidebar.tsx
const restaurantTabs = [
  // ... tabs existentes
  { id: 'nueva-pagina', name: 'Nueva Página', icon: IconoDeLucide },
];
```

### Cómo Agregar un Nuevo Campo a un Producto

1. **Actualizar la interfaz**:
```typescript
// src/types/index.ts
export interface Product {
  // ... campos existentes
  nuevo_campo: string; // Agregar aquí
}
```

2. **Actualizar mockData**:
```typescript
// src/data/mockData.ts
export const mockProducts: Product[] = [
  {
    // ... campos existentes
    nuevo_campo: 'valor por defecto',
  }
];
```

3. **Actualizar ProductForm**:
```typescript
// src/components/restaurant/ProductForm.tsx
// Agregar input en el formulario
<Input
  label="Nuevo Campo"
  value={formData.nuevo_campo}
  onChange={(e) => setFormData({...formData, nuevo_campo: e.target.value})}
/>
```

4. **Actualizar la visualización**:
```typescript
// src/pages/restaurant/MenuManagement.tsx
// Mostrar el nuevo campo donde sea necesario
<p>{product.nuevo_campo}</p>
```

### Cómo Modificar Datos de localStorage

```typescript
// Leer datos
import { loadFromStorage } from '../data/mockData';
const products = loadFromStorage('products', []);

// Modificar datos
import { saveToStorage } from '../data/mockData';
const updatedProducts = products.map(p =>
  p.id === productId ? { ...p, nombre: 'nuevo nombre' } : p
);
saveToStorage('products', updatedProducts);
```

### Cómo Agregar una Nueva Traducción

1. **Actualizar translations.ts**:
```typescript
// src/utils/translations.ts
const translations = {
  es: {
    // ... traducciones existentes
    nuevaClave: 'Nuevo Texto en Español',
  },
  en: {
    // ... traducciones existentes
    nuevaClave: 'New Text in English',
  }
};
```

2. **Usar en componentes**:
```typescript
const { t } = useLanguage();
<h1>{t('nuevaClave')}</h1>
```

### Cómo Personalizar Estilos

**Colores del tema**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Agregar nuevos colores
        'custom-blue': '#1E40AF',
      }
    }
  }
}
```

**Uso en componentes**:
```jsx
<div className="bg-custom-blue text-white">Contenido</div>
```

### Cómo Agregar un Nuevo Plan de Suscripción

```typescript
// src/data/mockData.ts
export const availablePlans = [
  // ... planes existentes
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    billing_period: 'monthly' as const,
    features: {
      max_products: -1,
      max_categories: -1,
      analytics: true,
      custom_domain: true,
      priority_support: true,
      advanced_customization: true,
      // Agregar nuevas features
      api_access: true,
      white_label: true,
    },
  },
];
```

---

## Flujos de Usuario

### Flujo de Registro

1. Usuario accede a `/login`
2. Hace clic en "Registrarse"
3. Completa formulario de registro:
   - Email
   - Contraseña
   - Nombre del restaurante
   - Teléfono
   - Dirección
   - Nombre del propietario
4. Sistema crea:
   - Usuario nuevo con rol `restaurant_owner`
   - Restaurante con slug único
   - Suscripción gratuita activa
5. Redirige a `/login` para iniciar sesión

### Flujo de Login

1. Usuario ingresa email y password
2. Sistema busca usuario en localStorage
3. Valida credenciales
4. Si es `restaurant_owner`, carga datos del restaurante
5. Guarda sesión en `currentAuth`
6. Redirige a `/dashboard`

### Flujo de Creación de Producto

1. Restaurant owner accede a "Menú"
2. Clic en "Nuevo Producto"
3. Sistema verifica límite del plan actual
4. Si está dentro del límite, muestra formulario
5. Usuario completa:
   - Nombre y descripción
   - Categoría
   - Imágenes (URLs)
   - Variaciones (tamaños/precios)
   - Ingredientes opcionales
   - Estado (activo/inactivo)
6. Guarda en localStorage
7. Actualiza lista de productos

### Flujo de Pedido Público

1. Cliente accede a `/:slug` (menú público)
2. Sistema carga restaurante por slug
3. Muestra catálogo de productos activos
4. Cliente agrega productos al carrito
5. Revisa carrito en sidebar
6. Hace checkout completando:
   - Nombre
   - Teléfono
   - Dirección (si es delivery)
   - Notas especiales
7. Sistema genera pedido
8. Envía por WhatsApp al restaurante

### Flujo de Gestión de Pedidos

1. Restaurant owner accede a "Pedidos"
2. Ve lista de pedidos con estados
3. Puede cambiar estado:
   - pending → confirmed
   - confirmed → preparing
   - preparing → ready
   - ready → delivered
4. Cada cambio actualiza localStorage
5. Sistema puede notificar al cliente

### Flujo de Cambio de Suscripción

1. Restaurant owner accede a "Suscripción"
2. Ve plan actual y opciones disponibles
3. Selecciona nuevo plan
4. Sistema verifica límites:
   - Productos actuales vs límite del plan
   - Categorías actuales vs límite del plan
5. Si cumple límites, actualiza suscripción
6. Actualiza fecha de inicio y fin
7. Desbloquea/bloquea features según plan

---

## Notas Importantes

### Limitaciones Actuales

1. **Persistencia**: Usa localStorage (no es una base de datos real)
2. **Autenticación**: Contraseñas en texto plano (no seguro para producción)
3. **Imágenes**: Solo URLs, no hay upload de archivos
4. **Notificaciones**: Simuladas, no envía emails/SMS reales
5. **Pagos**: No hay integración con pasarelas de pago

### Consideraciones para Migrar a Producción

**Para usar base de datos real (Supabase)**:

1. Configurar proyecto en Supabase
2. Crear tablas según las interfaces de `types/index.ts`
3. Reemplazar funciones `loadFromStorage` y `saveToStorage` con queries de Supabase
4. Implementar Row Level Security (RLS)
5. Migrar lógica de autenticación a Supabase Auth

**Para agregar autenticación real**:
- Usar Supabase Auth o Firebase Auth
- Hash de contraseñas con bcrypt
- JWT tokens para sesiones
- Refresh tokens

**Para agregar pagos**:
- Integrar Stripe o PayPal
- Webhooks para actualizar suscripciones
- Gestión de invoices

### Buenas Prácticas

1. **Siempre usar TypeScript**: Define tipos para todos los datos
2. **Contextos ligeros**: No almacenar demasiado estado en contextos
3. **Componentes pequeños**: Cada componente una responsabilidad
4. **Reutilización**: Usa componentes UI genéricos
5. **Traducciones**: Todos los textos deben pasar por `t()`
6. **Loading states**: Siempre mostrar feedback al usuario
7. **Error handling**: Validar datos antes de guardar
8. **Consistencia**: Seguir patrones establecidos

---

## Contacto y Soporte

Para preguntas sobre la estructura o cómo editar la aplicación, revisar este documento primero. Si necesitas agregar funcionalidades complejas, considera:

1. Mantener la estructura modular
2. Seguir los patrones existentes
3. Documentar cambios importantes
4. Probar en múltiples navegadores
5. Verificar responsive design

---

**Última actualización**: Octubre 2025
**Versión**: 0.0.0
