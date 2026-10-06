'use client';

interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  freshaLink: string;
}

interface ServicesListProps {
  services: ServiceItem[];
  locale: string;
}

export default function ServicesList({ services, locale }: ServicesListProps) {
  const isEs = locale === 'es';

  return (
    <section id="services" className="py-fib-6 px-fib-3 md:px-fib-6 max-w-5xl mx-auto">
      <div className="text-center mb-fib-5">
        <span className="text-xs uppercase tracking-[0.2em] text-candle-gold block mb-2">
          {isEs ? 'Carta de Rituales' : 'Treatment Menu'}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-cream-primary font-normal">
          {isEs ? 'Servicios & Tarifas' : 'Rituals & Pricing'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-fib-4">
        {services.map((item) => (
          <div
            key={item.id}
            className="group relative p-fib-4 rounded-2xl bg-dark-surface/60 border border-dark-border hover:border-candle-glow/30 transition-all duration-500 backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-serif text-2xl text-cream-primary font-medium group-hover:text-candle-gold transition-colors">
                  {item.name}
                </h3>
                <span className="font-serif text-2xl text-candle-glow font-semibold pl-4">
                  {item.price} €
                </span>
              </div>

              <div className="text-xs text-cream-muted uppercase tracking-wider mb-3">
                {item.duration} {isEs ? 'minutos' : 'minutes'}
              </div>

              <p className="text-sm text-cream-muted font-light leading-relaxed mb-6">
                {item.description}
              </p>
            </div>

            <a
              href={`${item.freshaLink}?hl=${isEs ? 'es' : 'en'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 text-xs uppercase tracking-wider border border-dark-border rounded-full hover:bg-candle-glow hover:text-dark-bg hover:border-candle-glow transition-all duration-300"
            >
              {isEs ? 'Seleccionar cita' : 'Select Time'}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}