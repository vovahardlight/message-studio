'use client';

export default function StickyMobileBar({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const whatsappNumber = '34600000000'; // Номер мастера в Испании
  const message = isEs
    ? encodeURIComponent('Hola! Me gustaría consultar disponibilidad para un masaje...')
    : encodeURIComponent('Hello! I would like to check availability for a massage session...');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-bg/90 border-t border-dark-border backdrop-blur-lg px-fib-3 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex gap-3">
      {/* WhatsApp прямой диалог */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex items-center justify-center w-12 h-12 bg-dark-surface border border-dark-border rounded-full text-candle-glow active:scale-95 transition-transform"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
        </svg>
      </a>

      {/* Быстрая запись во Fresha */}
      <a
        href={`https://www.fresha.com/book-now/vuestra-url?hl=${isEs ? 'es' : 'en'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center bg-candle-glow text-dark-bg font-medium rounded-full text-sm tracking-wide shadow-lg active:scale-95 transition-transform"
      >
        {isEs ? 'Reservar cita' : 'Book Appointment'}
      </a>
    </div>
  );
}