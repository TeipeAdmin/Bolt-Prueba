import React, { useEffect } from 'react';
import { Phone, PhoneOff, Utensils } from 'lucide-react';
import { useElevenLabsConversation } from '../../hooks/useElevenLabsConversation';
import { useToast } from '../../hooks/useToast';

interface VoiceAssistantWidgetProps {
  agentId: string;
  restaurantLogoUrl?: string;
  restaurantName: string;
  primaryColor: string;
  isMobile?: boolean;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  agentId,
  restaurantLogoUrl,
  restaurantName,
  primaryColor,
  isMobile = false,
}) => {
  const { showToast } = useToast();
  const { status, isActive, toggleConversation } = useElevenLabsConversation({
    agentId,
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  const isLoading = status === 'connecting';
  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';

  return (
    <div
      className={`fixed z-[60] ${
        isMobile ? 'right-4 bottom-4' : 'right-8 bottom-8'
      }`}
    >
      <div
        className="flex items-center gap-3 transition-all duration-300"
        style={{
          filter: isActive ? 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
        }}
      >
        {/* Logo del Restaurante */}
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center bg-white overflow-hidden"
          style={{
            border: `3px solid ${primaryColor}`,
            boxShadow: isActive ? `0 0 0 4px ${primaryColor}33` : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {restaurantLogoUrl ? (
            <img
              src={restaurantLogoUrl}
              alt={restaurantName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Utensils
              className="w-6 h-6"
              style={{ color: primaryColor }}
            />
          )}
        </div>

        {/* Botón de Llamada */}
        <button
          onClick={toggleConversation}
          disabled={isLoading}
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#000000',
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
          }}
          aria-label={isActive ? 'Finalizar llamada' : 'Iniciar llamada'}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isActive ? (
            <PhoneOff className="w-6 h-6 text-white" />
          ) : (
            <Phone className="w-6 h-6 text-white" />
          )}

          {/* Animación de pulso cuando está escuchando */}
          {isListening && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: primaryColor,
                opacity: 0.3,
              }}
            />
          )}

          {/* Animación de ondas cuando está hablando */}
          {isSpeaking && (
            <>
              <span
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  backgroundColor: primaryColor,
                  opacity: 0.4,
                  animationDuration: '1s',
                }}
              />
              <span
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  backgroundColor: primaryColor,
                  opacity: 0.3,
                  animationDuration: '1.5s',
                  animationDelay: '0.5s',
                }}
              />
            </>
          )}
        </button>
      </div>

      {/* Indicador de estado (opcional) */}
      {isActive && (
        <div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{
            backgroundColor: primaryColor,
          }}
        >
          {isLoading && 'Conectando...'}
          {isListening && 'Escuchando...'}
          {isSpeaking && 'Hablando...'}
          {status === 'connected' && !isListening && !isSpeaking && 'Conectado'}
        </div>
      )}
    </div>
  );
};
