import React, { useEffect, useState } from 'react';

interface AddToCartAnimationProps {
  imageUrl: string;
  startPosition: { x: number; y: number };
  onComplete: () => void;
}

export const AddToCartAnimation: React.FC<AddToCartAnimationProps> = ({
  imageUrl,
  startPosition,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    const cartButton = document.querySelector('[data-cart-button]');
    if (cartButton) {
      cartButton.classList.add('cart-bounce');
      setTimeout(() => {
        cartButton.classList.remove('cart-bounce');
      }, 600);
    }

    const timer = setTimeout(() => {
      onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const cartButton = document.querySelector('[data-cart-button]');
  const cartRect = cartButton?.getBoundingClientRect();

  if (!cartRect) {
    onComplete();
    return null;
  }

  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  return (
    <>
      <style>{`
        @keyframes cart-bounce {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(0.9); }
          75% { transform: scale(1.1); }
        }
        .cart-bounce {
          animation: cart-bounce 0.6s ease;
        }
      `}</style>
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: `${startPosition.x}px`,
          top: `${startPosition.y}px`,
          width: '80px',
          height: '80px',
          transform: isAnimating
            ? `translate(${endX - startPosition.x - 40}px, ${endY - startPosition.y - 40}px) scale(0.2) rotate(360deg)`
            : 'translate(0, 0) scale(1)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: isAnimating ? 0 : 1,
        }}
      >
        <img
          src={imageUrl}
          alt="Product"
          className="w-full h-full object-cover rounded-lg shadow-2xl"
        />
      </div>
    </>
  );
};
