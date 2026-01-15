import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Menu as MenuIcon,
  X,
  Check,
  Smartphone,
  TrendingUp,
  BarChart3,
  Clock,
  Users,
  Receipt,
  ArrowRight,
  Star,
  MessageCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const playerRef = useRef<any>(null);
  const ytContainerId = 'platyo-yt-player';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // YouTube API
  useEffect(() => {
    const videoId = 'bSKNTe1m3QY';

    const createPlayer = () => {
      if (!window.YT || !window.YT.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player(ytContainerId, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
          mute: 1
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.mute();
              e.target.playVideo();
            } catch {}
          }
        }
      });
    };

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      createPlayer();
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;
    try {
      isVideoMuted ? playerRef.current.mute() : playerRef.current.unMute();
    } catch {}
  }, [isVideoMuted]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navButtonClass = isScrolled
    ? 'text-gray-700 hover:text-orange-600'
    : 'text-white hover:text-white/90';

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all ${
          isScrolled ? 'bg-white/80 backdrop-blur shadow' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/PLATYO FAVICON BLANCO.svg" className="w-8 h-8" />
            <span className="text-xl font-bold">Platyo</span>
          </div>

          <div className="hidden md:flex gap-6">
            <button onClick={() => scrollToSection('features')} className={navButtonClass}>
              {t('navFeatures')}
            </button>
            <button onClick={() => scrollToSection('pricing')} className={navButtonClass}>
              {t('navPricing')}
            </button>
            <button onClick={() => scrollToSection('testimonials')} className={navButtonClass}>
              {t('navTestimonials')}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg"
            >
              {t('login')}
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* VIDEO HERO */}
      <section className="relative w-full bg-black pt-16 overflow-hidden">
        <div className="absolute top-24 right-4 z-20">
          <button
            onClick={() => setIsVideoMuted(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 text-white backdrop-blur"
          >
            {isVideoMuted ? <VolumeX /> : <Volume2 />}
            <span className="text-sm">{isVideoMuted ? 'Audio OFF' : 'Audio ON'}</span>
          </button>
        </div>

        <div className="yt-wrapper">
          <div id={ytContainerId} className="yt-player" />
        </div>
      </section>

      {/* HERO TEXT */}
      <section className="pt-24 pb-20 text-center bg-gradient-to-br from-orange-50 to-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('heroTitle')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('heroSubtitle')}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg"
        >
          {t('startFreeTrial')}
        </button>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        {/* … igual que tu versión original … */}
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-gray-50">
        {/* … igual que tu versión original … */}
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20">
        {/* … igual que tu versión original … */}
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10 text-center">
        © 2025 Platyo
      </footer>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/573027099669"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-50"
      >
        <MessageCircle className="text-white" />
      </a>

      {/* STYLES */}
      <style>{`
        .yt-wrapper {
          position: relative;
          width: 100%;
          height: 56.25vw;
          max-height: 100vh;
          background: black;
        }

        @media (min-width: 768px) {
          .yt-wrapper {
            height: 100vh;
          }
        }

        .yt-player iframe {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          pointer-events: none;
        }

        @media (min-width: 768px) {
          .yt-player iframe {
            width: 177.78vh !important;
            height: 56.25vw !important;
          }
        }
      `}</style>
    </div>
  );
};
