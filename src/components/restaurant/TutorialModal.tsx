import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Home, ShoppingBag, Grid3x3, Users, BarChart3, Settings, CreditCard, BookOpen } from 'lucide-react';
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
  steps: string[];
  details: string[];
  imagePlaceholder: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'categories',
    title: 'Paso 1: Crear Categorías',
    icon: Grid3x3,
    description: 'Primero debes crear las categorías para organizar tu menú',
    steps: [
      '1. Haz clic en "Categorías" en el menú lateral izquierdo',
      '2. Presiona el botón "+ Nueva Categoría" (esquina superior derecha)',
      '3. En el formulario que aparece, ingresa el nombre de la categoría (ej: "Entradas", "Platos Fuertes", "Bebidas")',
      '4. Ingrese una descripción para la categoría creada',
      '5. Haz clic en "Guardar" para crear la categoría',
      '6. Repite estos pasos para crear todas las categorías que necesites'
    ],
    details: [
      'El nombre debe ser claro y descriptivo para tus clientes',
      'Puedes crear categorías como: Entradas, Platos Principales, Bebidas, Postres, Especialidades, etc.',
      'Una vez creada, puedes activar/desactivar la categoría usando el icono de visualización',
      'Si desactivas una categoría, esta no se mostrará en el menú público',
      'Para editar o eliminar una categoría, usa los iconos de lápiz (editar) o papelera (eliminar) en cada fila'
    ],
    imagePlaceholder: 'Pantalla de Categorías con lista de categorías creadas, cada una con su imagen y botón "Nueva Categoría" en la esquina superior derecha'
  },
  {
    id: 'products',
    title: 'Paso 2: Agregar Productos',
    icon: ShoppingBag,
    description: 'Ahora crea los productos que aparecerán en tu menú',
    steps: [
      '1. Haz clic en "Menú" en el menú lateral izquierdo',
      '2. Presiona el botón "+ Nuevo Producto" en la parte superior',
      '3. Completa los campos requeridos: Nombre del producto (ej: "Pizza Margarita")',
      '4. Escribe una descripción atractiva del producto (ej: "Deliciosa pizza con salsa de tomate, mozzarella fresca y albahaca")',
      '5. Selecciona la categoría a la que pertenece de la lista desplegable',
      '6. Sube una imagen del producto haciendo clic en "Seleccionar Imagen" (opcional pero recomendado)',
      '7. En la sección "Variaciones", agrega al menos una opción: Nombre (ej: "Personal"), Precio (ej: $15000)',
      '8. Puedes agregar más variaciones con "+ Agregar Variación" (ej: "Mediana", "Familiar")',
      '9. Si aplica, agrega ingredientes opcionales con "+ Agregar Ingrediente" especificando nombre y precio adicional',
      '10. Haz clic en "Guardar Producto"'
    ],
    details: [
      'Las variaciones son obligatorias: cada producto debe tener al menos una variación (tamaño, sabor, presentación)',
      'Ejemplo de variaciones: Pizza → Personal, Mediana, Familiar | Bebida → 300ml, 500ml, 1L',
      'Los ingredientes opcionales son adicionales que el cliente puede agregar (ej: Queso extra, Tocino, Aguacate)',
      'Las imágenes aumentan significativamente las ventas',
      'El orden de los productos en la lista se puede cambiar arrastrándolos',
      'Puedes activar/desactivar productos temporalmente sin eliminarlos usando el switch de estado'
    ],
    imagePlaceholder: 'Formulario de creación de producto con campos: nombre, descripción, categoría, imagen, variaciones (nombre/precio) e ingredientes opcionales'
  },
  {
    id: 'menu-config',
    title: 'Paso 3: Configurar tu Menú',
    icon: Settings,
    description: 'Personaliza la apariencia y configuración de tu menú público',
    steps: [
      '1. Haz clic en "Configuración" en el menú lateral',
      '2. En la pestaña "General", completa toda la información de tu restaurante:',
      '   • Nombre del restaurante',
      '   • Teléfono (formato: +57 3001234567) - importante para recibir pedidos por WhatsApp',
      '   • Dirección completa',
      '   • Ciudad',
      '7. En la pestaña "Personalización", ajusta los colores de tu menú:',
      '   • Color primario (color principal de botones y elementos destacados)',
      '   • Color secundario (color de fondo y elementos secundarios)',
      '   • Color de acento (color para elementos importantes)',
      '11. En la pestaña "Delivery", configura si ofreces servicio a domicilio:',
      '   • Activa el switch "Habilitar Delivery"',
      '   • Configura los niveles de precio según el monto del pedido',
      '   • Ejemplo: $0-$20000 = $5000 domicilio | $20000-$50000 = $3000 | Más de $50000 = Gratis',
      '15. En la misma sección, configura si aceptas pedidos para consumir en mesa',
      '16. Establece el tiempo de preparación estimado (ej: "30-45 minutos")',
      '17. Guarda todos los cambios'
    ],
    details: [
      'El teléfono es crucial: todos los pedidos se enviarán automáticamente a ese número por WhatsApp',
      'El formato del teléfono debe incluir el código del país (ej: +57 para Colombia)',
      'Los colores personalizados se aplican inmediatamente en el menú público',
      'El tiempo de preparación aparece al cliente cuando va a hacer un pedido',
      'La configuración de delivery permite establecer diferentes costos según el monto del pedido',
      'Si desactivas el delivery, los clientes solo podrán elegir "Recoger en tienda" o "Mesa"',
      'Prueba diferentes combinaciones de colores para que coincidan con tu marca'
    ],
    imagePlaceholder: 'Panel de Configuración mostrando pestañas: General, Personalización y Delivery con formularios para cada sección'
  },
  {
    id: 'orders-manage',
    title: 'Paso 4: Gestionar Pedidos',
    icon: ShoppingBag,
    description: 'Aprende a recibir y gestionar los pedidos de tus clientes',
    steps: [
      '1. Cuando un cliente hace un pedido, recibirás un mensaje de WhatsApp automáticamente con todos los detalles',
      '2. El pedido también aparecerá en la sección "Pedidos" de la aplicación',
      '3. Para ver los pedidos, haz clic en "Pedidos" en el menú lateral',
      '4. Verás una lista con todos los pedidos. Los estados son:',
      '   • 🟡 Pendiente: Pedido recién recibido, requiere confirmación',
      '   • 🔵 Confirmado: Pedido aceptado',
      '   • 🟠 Preparando: Pedido en cocina',
      '   • 🟢 Listo: Pedido terminado y listo para entregar',
      '   • ✅ Entregado: Pedido completado',
      '   • 🔴 Cancelado: Pedido cancelado',
      '11. Para cambiar el estado de un pedido, haz clic en el botón "Editar" en la tarjeta del pedido',
      '12. Selecciona el nuevo estado del menú desplegable',
      '13. Para ver todos los detalles de un pedido, haz clic en "Ver Detalles"',
      '14. Puedes filtrar pedidos usando los filtros en la parte superior:',
      '   • Por estado (Pendientes, En preparación, etc.)',
      '   • Por tipo (Delivery, Pickup, Mesa)',
      '   • Por rango de fechas',
      '18. Usa la barra de búsqueda para encontrar un pedido específico por número o nombre de cliente',
      '19. Puedes utilizar el icono de mensaje para mantener al tanto a tus clientes sobre el estado del pedido a través de WhatsApp'
    ],
    details: [
      'El mensaje de WhatsApp incluye: número de pedido, datos del cliente, productos, precios y notas especiales',
      'IMPORTANTE: Actualiza el estado del pedido a medida que avanza para mantener informado al cliente',
      'Los pedidos "Pendientes" aparecen destacados en amarillo para llamar tu atención',
      'En los detalles del pedido verás: información del cliente, dirección (si es delivery), lista de productos con variaciones e ingredientes extras, notas especiales del cliente',
      'Si necesitas cancelar un pedido, cambia su estado a "Cancelado" y contacta al cliente para explicar',
      'Los filtros te ayudan a enfocarte en los pedidos que requieren acción inmediata',
      'Mantén organizada tu cocina: primero confirma el pedido, luego marca como "Preparando", después "Listo" y finalmente "Entregado"'
    ],
    imagePlaceholder: 'Pantalla de Pedidos mostrando tarjetas con información de cada pedido: número, cliente, estado, productos y botones de acción'
  },
  {
    id: 'public-menu',
    title: 'Paso 5: Compartir tu Menú',
    icon: Home,
    description: 'Comparte el enlace de tu menú con tus clientes',
    steps: [
      '1. Tu menú público tiene una URL única que puedes compartir',
      '2. La URL tiene el formato: platyo.com/nombre-de-tu-restaurante',
      '3. Para compartir tu menú:',
      '   • Copia la URL de tu navegador cuando estés en la vista de menú público',
      '   • Compártela en redes sociales (Facebook, Instagram, WhatsApp)',
      '   • Agrégala a tu biografía de Instagram',
      '   • Envíala directamente a tus clientes por WhatsApp',
      '   • Imprímela como código QR para colocar en tu local',
      '9. Los clientes pueden:',
      '   • Ver todos tus productos organizados por categorías',
      '   • Agregar productos al carrito',
      '   • Personalizar productos (elegir variación, agregar ingredientes opcionales)',
      '   • Escribir notas especiales por producto',
      '   • Finalizar la compra eligiendo: Recoger en tienda, Delivery, o Mesa',
      '   • Al confirmar el pedido, se abre WhatsApp automáticamente con todos los datos'
    ],
    details: [
      'El menú público se actualiza automáticamente cuando agregas o editas productos',
      'Los clientes ven el menú con los colores que configuraste en personalización',
      'Si un producto está desactivado, no aparecerá en el menú público',
      'Si una categoría está desactivada, no aparecerá en el menú público',
      'Los productos destacados aparecen primero con un distintivo especial. Puedes configurarlos desde el apartado "Promocional"',
      'El carrito de compras se mantiene mientras el cliente navega por el menú',
      'Cuando el cliente confirma el pedido, tú recibes toda la información por WhatsApp',
      'El mensaje incluye resumen completo: productos, variaciones, ingredientes extras, datos de contacto, dirección de entrega si aplica'
    ],
    imagePlaceholder: 'Vista del menú público con categorías en la parte superior, productos con imágenes y precios, y carrito de compras flotante'
  },
  {
    id: 'analytics',
    title: 'Paso 6: Revisar Estadísticas',
    icon: BarChart3,
    description: 'Monitorea el rendimiento de tu negocio con reportes detallados',
    steps: [
      '1. Haz clic en "Estadísticas" en el menú lateral',
      '2. En la parte superior verás las métricas principales:',
      '   • Total de pedidos en el período seleccionado',
      '   • Pedidos completados',
      '   • Ingresos totales',
      '   • Ticket promedio (valor promedio por pedido)',
      '7. Usa los "Filtros Avanzados" para analizar datos específicos:',
      '   • Haz clic en "Filtros Avanzados" en la esquina superior derecha',
      '   • Selecciona un rango de fechas (desde/hasta)',
      '   • Filtra por categoría específica',
      '   • Filtra por tipo de pedido (Delivery, Pickup, Mesa)',
      '   • Filtra por estado del pedido',
      '   • Puedes combinar múltiples filtros',
      '14. Revisa los gráficos que se muestran:',
      '   • Pedidos por Tipo: cuántos pedidos de cada modalidad',
      '   • Pedidos por Mes: tendencia de pedidos a lo largo del tiempo',
      '   • Estados de Pedidos: distribución de estados',
      '   • Productos Más Vendidos: tu top 5 de productos',
      '19. Para exportar los datos, haz clic en "Exportar CSV"',
      '20. Se descargará un archivo Excel con información detallada:',
      '   • Resumen ejecutivo con todas las métricas',
      '   • Distribución por tipo y estado',
      '   • Productos más vendidos',
      '   • Ventas por categoría',
      '   • Ventas por día de la semana',
      '   • Detalle completo de cada pedido',
      '   • Detalle de items vendidos'
    ],
    details: [
      'Los filtros te permiten analizar períodos específicos (ej: ventas del último mes)',
      'El reporte CSV es perfecto para llevar a tu contador o hacer análisis detallados',
      'Usa las estadísticas para identificar tus productos más rentables',
      'Analiza qué días de la semana vendes más para optimizar tu inventario',
      'El ticket promedio te ayuda a evaluar estrategias de upselling',
      'Si ves productos con pocas ventas, considera mejorar su presentación o precio',
      'Las ventas por categoría muestran qué tipo de productos prefieren tus clientes',
      'Revisa las estadísticas semanalmente para tomar decisiones informadas'
    ],
    imagePlaceholder: 'Dashboard de estadísticas con gráficos de barras, métricas clave en tarjetas, filtros avanzados y botón de exportar CSV'
  },
  {
    id: 'customers',
    title: 'Paso 7: Gestión de Clientes',
    icon: Users,
    description: 'Consulta y administra tu base de clientes',
    steps: [
      '1. Haz clic en "Clientes" en el menú lateral',
      '2. Verás una tabla con todos los clientes que han hecho pedidos',
      '3. La información mostrada incluye:',
      '   • Nombre del cliente',
      '   • Teléfono de contacto',
      '   • Email (si lo proporcionó)',
      '   • Total de pedidos realizados',
      '   • Monto total gastado',
      '   • Fecha del último pedido',
      '10. Para buscar un cliente específico, usa la barra de búsqueda en la parte superior',
      '11. Puedes buscar por: nombre, teléfono o email',
      '12. Haz clic en un cliente para ver el detalle completo de su historial de pedidos',
      '13. El número de teléfono será la identificación principal del cliente. Si un cliente ya registrado con un número ingresa un nombre diferente, no se creará un nuevo registro, sino que se actualizará la información asociada a ese número de teléfono.',
      '14. En la vista de detalle verás:',
      '   • Información de contacto completa',
      '   • Direcciones de entrega usadas previamente',
      '   • Lista completa de todos sus pedidos con fechas',
      '   • Productos que más ordena',
      '   • Estadísticas de compra'
    ],
    details: [
      'Los clientes se registran automáticamente cuando hacen su primer pedido',
      'No necesitas crear clientes manualmente. Si necesitas crear clientes de manera masiva, puedes hacerlo importando CSV',
      'La información del cliente se guarda para futuras órdenes',
      'Puedes identificar a tus clientes más frecuentes por el número de pedidos',
      'Usa esta información para crear programas de lealtad o promociones especiales',
      'Los clientes con mayor gasto total son tus clientes VIP. Podrás asignarlos manualmente',
      'Respeta siempre la privacidad de los datos de tus clientes',
      'Puedes exportar la base de datos de clientes para campañas de marketing',
      'Si un cliente solicita eliminar sus datos, puedes hacerlo desde esta sección'
    ],
    imagePlaceholder: 'Tabla de clientes con columnas: nombre, teléfono, email, pedidos totales, gasto total y última compra, con barra de búsqueda'
  },
  {
    id: 'subscription',
    title: 'Paso 8: Gestionar Suscripción',
    icon: CreditCard,
    description: 'Mantén tu cuenta activa y administra tu plan',
    steps: [
      '1. Haz clic en "Suscripción" en el menú lateral',
      '2. En la parte superior verás tu plan actual con:',
      '   • Nombre del plan (Básico, Profesional, Empresarial)',
      '   • Estado (Activo/Inactivo/Vencido)',
      '   • Fecha de inicio',
      '   • Fecha de vencimiento',
      '   • Días restantes',
      '8. Verás el estado de renovación automática:',
      '   • Si está activada, tu plan se renovará automáticamente antes de vencer',
      '   • Si está desactivada, tendrás que renovar manualmente',
      '   • Para cambiar, usa el switch "Renovación Automática"',
      '12. Para ver todos los planes disponibles, revisa la sección "Planes Disponibles"',
      '13. Cada plan muestra:',
      '   • Precio mensual',
      '   • Características incluidas',
      '   • Límites (pedidos, productos, etc.)',
      '17. Para cambiar de plan:',
      '   • Haz clic en "Seleccionar Plan" en el plan que deseas',
      '   • Confirma el cambio',
      '   • El nuevo plan se activa inmediatamente',
      '21. Revisa el historial de pagos en la parte inferior para ver tus transacciones anteriores'
    ],
    details: [
      'IMPORTANTE: Si tu suscripción vence, no podrás recibir nuevos pedidos',
      'Activa la renovación automática para evitar interrupciones en tu servicio',
      'Puedes cambiar de plan en cualquier momento',
      'Al cambiar a un plan superior, pagas la diferencia prorrateada',
      'Al cambiar a un plan inferior, el cambio se efectúa al final del período actual',
      'Si tu negocio está creciendo, considera actualizar a un plan con más capacidad',
      'Todos los planes incluyen soporte técnico'
    ],
    imagePlaceholder: 'Panel de suscripción mostrando plan actual con fecha de vencimiento, switch de renovación automática y tarjetas de planes disponibles'
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
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="xl">
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

          <p className="text-gray-700 mb-6 text-lg font-medium">{step.description}</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-6 border-2 border-blue-200 min-h-[180px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon className="w-10 h-10 text-white" />
              </div>
              <p className="text-gray-700 font-medium max-w-md leading-relaxed">{step.imagePlaceholder}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Instrucciones Paso a Paso
              </h3>
              <ol className="space-y-3">
                {step.steps.map((stepText, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {stepText.match(/^\d+/)?.[0] || index + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{stepText.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                💡 Información Importante
              </h3>
              <ul className="space-y-3">
                {step.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <span className="text-green-600 font-bold mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

<div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
  <button
    onClick={handlePrev}
    disabled={currentStep === 0}
    className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
  >
    <ChevronLeft className="w-5 h-5" />
    Anterior
  </button>

  {/* Oculto en móvil, visible desde md */}
  <div className="hidden md:flex flex-wrap justify-center gap-2 flex-1 min-w-0">
    {tutorialSteps.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentStep(index)}
        className={`h-2.5 rounded-full transition-all ${
          index === currentStep
            ? 'bg-blue-600 w-10'
            : 'bg-gray-300 hover:bg-gray-400 w-2.5'
        }`}
        aria-label={`Ir al paso ${index + 1}`}
      />
    ))}
  </div>

  {currentStep < tutorialSteps.length - 1 ? (
    <button
      onClick={handleNext}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
    >
      Siguiente
      <ChevronRight className="w-5 h-5" />
    </button>
  ) : (
    <button
      onClick={handleClose}
      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-md hover:shadow-lg"
    >
      <BookOpen className="w-5 h-5" />
      Finalizar Tutorial
    </button>
  )}
</div>

      </div>
    </Modal>
  );
};
