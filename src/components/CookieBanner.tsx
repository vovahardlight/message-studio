'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner({ locale }: { locale: string }) {
  const [show, setShow] = useState(false);
  const isEs = locale === 'es';

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_aepd');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent_aepd', 'accepted');
    setShow(false);
    // Здесь безопасно инициализируются GA4 / Meta Pixel
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie_consent_aepd', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-fib-4 left-fib-3 right-fib-3 md:left-auto md:right-fib-4 md:max-w-md z-50 p-fib-3 bg-dark-surface/95 border border-dark-border rounded-2xl shadow-2xl backdrop-blur-md text-xs">
      <p className="text-cream-muted mb-3 leading-relaxed">
        {isEs
          ? 'Utilizamos cookies técnicas y analíticas para asegurar el funcionamiento óptimo del sitio conforme a las directrices de la AEPD en España.'
          : 'We use cookies to guarantee seamless navigation and analyze traffic under EU and Spanish RGPD guidelines.'}
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={rejectCookies}
          className="px-3 py-1.5 border border-dark-border rounded-lg text-cream-muted hover:text-cream-primary"
        >
          {isEs ? 'Rechazar' : 'Reject'}
        </button>
        <button
          onClick={acceptCookies}
          className="px-4 py-1.5 bg-candle-glow text-dark-bg font-medium rounded-lg hover:bg-candle-gold transition-colors"
        >
          {isEs ? 'Aceptar todas' : 'Accept all'}
        </button>
      </div>
    </div>
  );
}