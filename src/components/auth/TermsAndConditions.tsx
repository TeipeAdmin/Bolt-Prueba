import React from 'react';
import { Button } from '../ui/Button';

interface TermsAndConditionsProps {
  onAccept?: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept }) => {
  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none text-gray-700 max-h-[60vh] overflow-y-auto pr-4">
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Aceptación de los Términos</h3>
          <p>
            Al registrarse y utilizar Platyo, usted acepta estar legalmente vinculado por estos Términos y Condiciones.
            Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Descripción del Servicio</h3>
          <p>
            Platyo es una plataforma de gestión para restaurantes que proporciona herramientas para:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestión de menú digital y catálogo de productos</li>
            <li>Sistema de pedidos en línea</li>
            <li>Administración de clientes y órdenes</li>
            <li>Análisis y reportes de ventas</li>
            <li>Gestión de inventario y categorías</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Registro y Cuenta</h3>
          <p>
            Para utilizar Platyo, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mantener la confidencialidad de su contraseña</li>
            <li>Todas las actividades que ocurran bajo su cuenta</li>
            <li>Notificar inmediatamente cualquier uso no autorizado</li>
            <li>Proporcionar información veraz y actualizada</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Suscripciones y Pagos</h3>
          <p>
            Platyo ofrece diferentes planes de suscripción. Al suscribirse, usted acepta:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pagar todas las tarifas asociadas con su plan seleccionado</li>
            <li>Las renovaciones automáticas según la periodicidad del plan</li>
            <li>Que los precios pueden cambiar con previo aviso de 30 días</li>
            <li>La política de reembolso según el plan contratado</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Uso Aceptable</h3>
          <p>
            Al usar Platyo, usted se compromete a NO:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violar leyes o regulaciones aplicables</li>
            <li>Infringir derechos de propiedad intelectual</li>
            <li>Transmitir contenido ofensivo, ilegal o inapropiado</li>
            <li>Intentar acceder sin autorización a sistemas o datos</li>
            <li>Usar el servicio para actividades fraudulentas</li>
            <li>Interferir con el funcionamiento del servicio</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Propiedad Intelectual</h3>
          <p>
            Todo el contenido, características y funcionalidad de Platyo son propiedad exclusiva de la empresa y están
            protegidos por leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
          </p>
          <p className="mt-2">
            Usted conserva todos los derechos sobre el contenido que cargue (menús, productos, imágenes), pero nos otorga
            una licencia para usarlo en la prestación del servicio.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Privacidad y Protección de Datos</h3>
          <p>
            Recopilamos y procesamos datos personales de acuerdo con nuestra Política de Privacidad y cumpliendo con:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ley 1581 de 2012 de Protección de Datos Personales en Colombia</li>
            <li>Decreto 1377 de 2013</li>
            <li>Principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso y seguridad</li>
          </ul>
          <p className="mt-2">
            Sus derechos incluyen: conocer, actualizar, rectificar y suprimir sus datos personales, así como revocar
            la autorización otorgada.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Limitación de Responsabilidad</h3>
          <p>
            Platyo se proporciona "tal cual" y "según disponibilidad". No garantizamos que:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>El servicio será ininterrumpido o libre de errores</li>
            <li>Los resultados obtenidos serán exactos o confiables</li>
            <li>Todos los errores serán corregidos</li>
          </ul>
          <p className="mt-2">
            No seremos responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo
            pérdida de beneficios, datos, uso o buena voluntad.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Indemnización</h3>
          <p>
            Usted acepta indemnizar y mantener indemne a Platyo, sus afiliados, directores, empleados y agentes de
            cualquier reclamación, daño, obligación, pérdida, responsabilidad, costo o deuda que surja de:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Su uso del servicio</li>
            <li>Violación de estos términos</li>
            <li>Violación de derechos de terceros</li>
            <li>Contenido que usted publique o comparta</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Terminación del Servicio</h3>
          <p>
            Podemos suspender o terminar su acceso al servicio inmediatamente, sin previo aviso, por cualquier motivo,
            incluyendo:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violación de estos términos</li>
            <li>Solicitud de autoridades legales</li>
            <li>Discontinuación del servicio</li>
            <li>Actividad fraudulenta o ilegal</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Modificaciones</h3>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en
            vigor inmediatamente después de su publicación. Su uso continuado del servicio constituye su aceptación de
            los términos modificados.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Ley Aplicable y Jurisdicción</h3>
          <p>
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será resuelta en los
            tribunales competentes de Colombia, renunciando expresamente a cualquier otro fuero que pudiera corresponder.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">13. Disposiciones Generales</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Divisibilidad:</strong> Si alguna disposición es considerada inválida, las demás permanecerán vigentes
            </li>
            <li>
              <strong>Renuncia:</strong> La falta de ejercicio de un derecho no constituye renuncia al mismo
            </li>
            <li>
              <strong>Acuerdo Completo:</strong> Estos términos constituyen el acuerdo completo entre las partes
            </li>
            <li>
              <strong>Cesión:</strong> No puede ceder sus derechos sin nuestro consentimiento previo por escrito
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">14. Contacto</h3>
          <p>
            Para preguntas sobre estos términos, puede contactarnos a través de:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: admin@digitalfenixpro.com</li>
            <li>Dentro de la plataforma mediante el sistema de tickets de soporte</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-4 rounded-lg mt-6">
          <p className="text-sm text-gray-600 italic">
            <strong>Última actualización:</strong> Noviembre 2025
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Al hacer clic en "Aceptar" o al usar el servicio, usted reconoce que ha leído, entendido y acepta estar
            legalmente vinculado por estos Términos y Condiciones.
          </p>
        </section>
      </div>

      {onAccept && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onAccept}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
          >
            Aceptar Términos y Condiciones
          </Button>
        </div>
      )}
    </div>
  );
};
