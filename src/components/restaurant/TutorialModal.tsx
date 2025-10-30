import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Home, ShoppingBag, Grid3x3, Users, BarChart3, Settings, CreditCard, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  tips: string[];
  imagePlaceholder: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard',
    title: 'Panel Principal',
    icon: Home,
    description: 'Tu centro de control para monitorear el negocio en tiempo real',
    features: [
      'Visualiza estadísticas clave: ventas del día, pedidos activos y productos más vendidos',
      'Monitorea el rendimiento de tu restaurante con métricas actualizadas',
      'Accede rápidamente a pedidos pendientes y recientes',
      'Vista general de ingresos y comparativas con períodos anteriores'
    ],
    tips: [
      'Revisa el dashboard cada mañana para planificar tu día',
      'Identifica tendencias en las estadísticas para tomar mejores decisiones',
      'Los pedidos pendientes requieren atención inmediata'
    ],
    imagePlaceholder: 'Panel con gráficos de ventas, estadísticas de pedidos y resumen del día'
  },
  {
    id: 'orders',
    title: 'Gestión de Pedidos',
    icon: ShoppingBag,
    description: 'Administra todos los pedidos de tus clientes de forma eficiente',
    features: [
      'Visualiza pedidos en tiempo real (pendientes, en preparación, listos)',
      'Actualiza el estado de cada pedido con un clic',
      'Filtra pedidos por estado, tipo (delivery, pickup, mesa) y fecha',
      'Ve detalles completos: cliente, productos, dirección, notas especiales',
      'Busca pedidos por número o nombre de cliente',
      'Cancela pedidos con confirmación de seguridad'
    ],
    tips: [
      'Mantén los estados actualizados para que los clientes sepan el progreso',
      'Usa los filtros para organizar pedidos por prioridad',
      'Revisa las notas especiales antes de preparar',
      'Los pedidos de delivery tienen prioridad por tiempo de entrega'
    ],
    imagePlaceholder: 'Lista de pedidos con estados (pendiente, preparando, listo), detalles de cliente y productos'
  },
  {
    id: 'menu',
    title: 'Menú y Productos',
    icon: Grid3x3,
    description: 'Crea y administra tu catálogo completo de productos',
    features: [
      'Agrega productos con múltiples variaciones (tamaños, sabores, etc.)',
      'Sube imágenes atractivas para cada producto',
      'Asigna productos a categorías para organizar tu menú',
      'Activa/desactiva productos según disponibilidad',
      'Edita precios y descripciones en cualquier momento',
      'Marca productos como destacados para promocionarlos',
      'Gestiona ingredientes opcionales y complementos'
    ],
    tips: [
      'Usa fotos de alta calidad para aumentar ventas',
      'Actualiza disponibilidad cuando se agoten ingredientes',
      'Crea descripciones atractivas y detalladas',
      'Revisa precios regularmente según costos',
      'Los productos destacados aparecen primero en el menú público'
    ],
    imagePlaceholder: 'Formulario de creación de producto con campos para nombre, precio, categoría, imagen y variaciones'
  },
  {
    id: 'categories',
    title: 'Categorías',
    icon: Grid3x3,
    description: 'Organiza tu menú en categorías lógicas y fáciles de navegar',
    features: [
      'Crea categorías personalizadas (Entradas, Platos Fuertes, Bebidas, etc.)',
      'Asigna colores distintivos a cada categoría',
      'Organiza el orden de aparición en el menú',
      'Activa o desactiva categorías completas',
      'Ve la cantidad de productos por categoría',
      'Edita nombres y descripciones cuando quieras'
    ],
    tips: [
      'Usa nombres claros y descriptivos para las categorías',
      'El orden de las categorías afecta la experiencia del cliente',
      'Agrupa productos similares para facilitar la navegación',
      'Considera categorías especiales para promociones'
    ],
    imagePlaceholder: 'Lista de categorías con colores, cantidad de productos y controles de activación'
  },
  {
    id: 'customers',
    title: 'Base de Clientes',
    icon: Users,
    description: 'Administra la información de tus clientes y su historial',
    features: [
      'Registro automático de clientes al hacer pedidos',
      'Ve el historial completo de pedidos por cliente',
      'Accede a datos de contacto (teléfono, email, dirección)',
      'Identifica clientes frecuentes y su gasto total',
      'Busca clientes por nombre, teléfono o email',
      'Exporta la base de datos de clientes'
    ],
    tips: [
      'Usa la información para programas de fidelización',
      'Identifica a tus mejores clientes',
      'Mantén actualizado el contacto para promociones',
      'Respeta la privacidad y protege los datos personales'
    ],
    imagePlaceholder: 'Tabla de clientes con nombre, contacto, pedidos totales y última compra'
  },
  {
    id: 'analytics',
    title: 'Estadísticas y Reportes',
    icon: BarChart3,
    description: 'Analiza el rendimiento de tu negocio con datos detallados',
    features: [
      'Visualiza ingresos totales y ticket promedio',
      'Analiza productos más vendidos y rentables',
      'Revisa ventas por categoría y período',
      'Ve distribución de pedidos por tipo (delivery, pickup, mesa)',
      'Compara rendimiento entre diferentes períodos',
      'Filtra datos por fecha, categoría y tipo de pedido',
      'Exporta reportes completos a CSV para análisis externo'
    ],
    tips: [
      'Exporta reportes mensuales para contabilidad',
      'Identifica productos de baja rotación',
      'Usa los datos para ajustar precios y promociones',
      'Analiza patrones de venta por día de la semana',
      'Los reportes CSV incluyen detalles completos de ventas'
    ],
    imagePlaceholder: 'Gráficos de ventas, productos más vendidos, ingresos por período y opciones de filtrado'
  },
  {
    id: 'settings',
    title: 'Configuración',
    icon: Settings,
    description: 'Personaliza tu restaurante y ajusta preferencias operativas',
    features: [
      'Actualiza información básica (nombre, dirección, teléfono)',
      'Configura horarios de atención',
      'Personaliza colores y temas de tu menú público',
      'Ajusta configuración de delivery (costos, zonas)',
      'Habilita o deshabilita opciones (pedidos en mesa, delivery)',
      'Configura tiempo de preparación estimado',
      'Sube tu logo y personaliza la marca'
    ],
    tips: [
      'Mantén actualizada la información de contacto',
      'Personaliza colores según tu marca',
      'Revisa costos de delivery regularmente',
      'Desactiva delivery si no puedes atender',
      'El tiempo de preparación afecta expectativas del cliente'
    ],
    imagePlaceholder: 'Panel de configuración con pestañas para información general, horarios, delivery y personalización'
  },
  {
    id: 'subscription',
    title: 'Suscripción',
    icon: CreditCard,
    description: 'Gestiona tu plan y mantén activo tu servicio',
    features: [
      'Visualiza tu plan actual y fecha de vencimiento',
      'Activa o desactiva la renovación automática',
      'Ve el historial de pagos y facturas',
      'Compara planes disponibles y sus características',
      'Cambia de plan según las necesidades de tu negocio',
      'Recibe notificaciones antes del vencimiento'
    ],
    tips: [
      'Activa renovación automática para evitar interrupciones',
      'Revisa tu plan si tu negocio está creciendo',
      'Mantén actualizada tu información de pago',
      'Contacta soporte si tienes problemas con la suscripción'
    ],
    imagePlaceholder: 'Panel de suscripción con plan activo, fecha de renovación y opciones de gestión'
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute -top-2 right-0 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
              <p className="text-sm text-gray-500">Paso {currentStep + 1} de {tutorialSteps.length}</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-gray-700 mb-6 text-lg">{step.description}</p>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 mb-6 border border-gray-200 min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 italic max-w-md">{step.imagePlaceholder}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Funcionalidades Principales
              </h3>
              <ul className="space-y-2">
                {step.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                💡 Consejos Útiles
              </h3>
              <ul className="space-y-2">
                {step.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-amber-900">
                    <span className="text-amber-600 font-bold mt-0.5">→</span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Finalizar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
