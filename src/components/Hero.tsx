'use client';
import Link from 'next/link';

interface HeroProps {
  locale: string;
}

export default function Hero({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  // Передача параметра языка во Fresha
  const freshaUrl = `https://www.fresha.com/book-now/vuestra-url?hl=${isEs ? 'es' : 'en'}`;

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-fib-3 md:px-fib-6 overflow-hidden">
      {/* Фоновое мерцание пламени свечи (Аппаратное ускорение GPU) */}
      <div className="absolute inset-0 pointer-events-none candle-ambient-glow animate-candle-flicker" />

      {/* Контейнер по пропорциям золотого сечения */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Селектор языка */}
        <div className="mb-fib-4 inline-flex items-center gap-3 border border-dark-border px-4 py-1.5 rounded-full bg-dark-surface/40 backdrop-blur-md">
          <Link
            href="/"
            className={`text-xs uppercase tracking-widest transition-colors ${
              isEs ? 'text-candle-glow font-semibold' : 'text-cream-muted hover:text-cream-primary'
            }`}
          >
            ES
          </Link>
          <span className="text-dark-border text-xs">|</span>
          <Link
            href="/en"
            className={`text-xs uppercase tracking-widest transition-colors ${
              !isEs ? 'text-candle-glow font-semibold' : 'text-cream-muted hover:text-cream-primary'
            }`}
          >
            EN
          </Link>
        </div>

        {/* Заголовок H1 для SEO */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-cream-primary leading-[1.08] mb-fib-3">
          {isEs ? (
            <>
              El arte del tacto <br />
              <span className="italic font-light text-candle-gold">a la luz de las velas</span>
            </>
          ) : (
            <>
              The art of touch <br />
              <span className="italic font-light text-candle-gold">under candlelight</span>
            </>
          )}
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-cream-muted font-light leading-relaxed mb-fib-5">
          {isEs
            ? 'Un santuario privado de calma y bienestar sensorial en Alicante. Terapias corporales exclusivas sin prisas, diseñadas para sanar el estrés.'
            : 'A private sanctuary of sensory calm in Alicante. Tailored massage rituals designed to dissolve deep muscle tension and restore peace.'}
        </p>

        {/* CTA Кнопка с мягким свечением */}
        <div className="flex flex-col sm:flex-row gap-fib-2 w-full sm:w-auto">
          <a
            href={freshaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-fib-5 py-4 bg-candle-glow text-dark-bg font-medium rounded-full hover:bg-candle-gold transition-all duration-300 shadow-[0_0_28px_rgba(229,152,67,0.3)] hover:shadow-[0_0_40px_rgba(229,152,67,0.5)] active:scale-[0.98]"
          >
            {isEs ? 'Reservar cita en Fresha' : 'Book Session on Fresha'}
          </a>
        </div>
      </div>
    </section>
  );
}