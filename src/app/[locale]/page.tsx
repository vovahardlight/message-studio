'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GsapScrollProvider from '@/components/GsapScrollProvider';

// Регистрируем плагин ScrollTrigger для пиннинга и анимаций скролла
gsap.registerPlugin(ScrollTrigger);

// ==============================================================
// 1. ЖИВОЙ ИНТЕРАКТИВНЫЙ ШЕЙДЕР ТЕПЛОГО МАСЛА (WEBGL CAUSTICS)
// ==============================================================
function LiquidOilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        vec2 mouse = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        float mouseDist = length(uv - mouse);
        float mouseWave = smoothstep(0.7, 0.0, mouseDist) * 0.45;
        
        vec2 p = uv * 3.2;
        float t = u_time * 0.35;
        
        for(float i = 1.0; i <= 4.0; i++) {
          p.x += (0.45 / i) * sin(i * 2.4 * p.y + t + mouseWave * 3.5) + 0.2;
          p.y += (0.45 / i) * cos(i * 2.4 * p.x + t + mouseWave * 3.5) + 0.3;
        }

        float caustic = 0.5 + 0.5 * sin(p.x * 2.2 + p.y * 2.2);
        caustic = pow(caustic, 2.6);
        
        vec3 colorBg = vec3(0.960, 0.945, 0.918);
        vec3 colorShadow = vec3(0.815, 0.745, 0.670);
        vec3 colorGold = vec3(0.850, 0.690, 0.460);
        vec3 colorHighlight = vec3(0.990, 0.940, 0.850);

        float depth = uv.y * 0.4 + 0.5;
        vec3 col = mix(colorBg, colorShadow, depth * 0.55);
        
        col = mix(col, colorGold, caustic * 0.65);
        col += colorHighlight * pow(caustic, 3.5) * 0.55;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const timeUni = gl.getUniformLocation(program, 'u_time');
    const resUni = gl.getUniformLocation(program, 'u_resolution');
    const mouseUni = gl.getUniformLocation(program, 'u_mouse');

    let animationId: number;
    const startTime = performance.now();
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resUni, canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = rect.height - (e.clientY - rect.top);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const currentTime = (performance.now() - startTime) / 1000;
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      gl.uniform1f(timeUni, currentTime);
      gl.uniform2f(mouseUni, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ==============================================================
// 2. ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ==============================================================
export default function SofiaMassagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams.locale || 'es';
  const isEs = locale === 'es';

  // Интерактивность
  const [selectedDuration, setSelectedDuration] = useState<'60' | '90'>('60');
  const [activeRitualFilter, setActiveRitualFilter] = useState<'all' | 'relax' | 'deep' | 'sport'>('all');

  // Рефы для GSAP
  const heroRef = useRef<HTMLElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Модальные окна
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'legal' | 'cookies'>('privacy');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loaderMounted, setLoaderMounted] = useState(true);

  const googleMapsUrl = 'https://www.google.com/maps/place/Sof%C3%ADa+Massage+Madrid/@40.4376018,-3.6748092,17z/data=!4m16!1m9!3m8!1s0xd4229f358646857:0x17446d16b6656203!2sSof%C3%ADa+Massage+Madrid!8m2!3d40.4376018!4d-3.6748092!9m1!1b1!16s%2Fg%2F11npdcvm1_!3m5!1s0xd4229f358646857:0x17446d16b6656203!8m2!3d40.4376018!4d-3.6748092!16s%2Fg%2F11npdcvm1_!18m1!1e1';
  const baseFreshaUrl = 'https://www.fresha.com/book-now/sofia-massage-madrid-b9sthwsj/all-offer?share=true&pId=3108060';

  const openBooking = (customUrl?: string) => {
    const url = customUrl || baseFreshaUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openLegal = (tab: 'privacy' | 'legal' | 'cookies') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  // ==============================================================
  // 1. АНИМАЦИЯ ПОДЪЕМА МОБИЛЬНОЙ ПАНЕЛИ (ПРОПОРЦИОНАЛЬНО СКРОЛЛУ)
  // ==============================================================
  useEffect(() => {
    const heroEl = heroRef.current;
    const barEl = mobileBarRef.current;

    if (!heroEl || !barEl) return;

    // Изначально прячем плашку ниже экрана на 120%
    gsap.set(barEl, { yPercent: 120, opacity: 0 });

    // Пропорциональный подъем плашки по мере ухода Hero-экрана наверх
    const mobileTrigger = ScrollTrigger.create({
      trigger: heroEl,
      start: 'bottom 85%', // как только низ Hero подходит к выходу
      end: 'bottom 40%',   // пропорциональное раскрытие
      scrub: 0.6,          // сглаженный пропорциональный скраб
      animation: gsap.to(barEl, {
        yPercent: 0,
        opacity: 1,
        ease: 'power2.out',
      }),
    });

    return () => {
      mobileTrigger.kill();
    };
  }, []);

  // ==============================================================
  // 2. НАСТОЯЩИЙ GSAP SCROLLTRIGGER ПИННИНГ ФУТЕРА (CURTAIN REVEAL)
  // ==============================================================
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const getOverlap = () => Math.min(window.innerHeight, footer.offsetHeight);

    const adjustFooterOverlap = () => {
      if (footer) {
        footer.style.marginTop = `-${getOverlap()}px`;
      }
    };

    adjustFooterOverlap();

    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: () => `top ${window.innerHeight - getOverlap()}`,
      end: () => `+=${getOverlap()}`,
      pin: true,
      anticipatePin: 1,
    });

    const handleResize = () => {
      adjustFooterOverlap();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      trigger.kill();
      if (footer) footer.style.marginTop = '0px';
    };
  }, [locale]);

  // ==============================================================
  // 3. ВСТУПИТЕЛЬНАЯ АНИМАЦИЯ GSAP TIMELINE
  // ==============================================================
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setLoaderMounted(false);
      },
    });

    tl.to('.loader-progress', {
      width: '100%',
      duration: 0.85,
      ease: 'power2.inOut',
    })
    .to('.loader-content', {
      opacity: 0,
      y: -15,
      duration: 0.4,
      ease: 'power2.in',
    })
    .to('.loader-curtain', {
      yPercent: -100,
      duration: 1.1,
      ease: 'expo.inOut',
    })
    .fromTo('.site-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
    .fromTo('.hero-tag', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .fromTo('.hero-title-line', { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
    .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .fromTo('.hero-cta-btn', { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.4');

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, []);

  const massages = [
    {
      id: 'relax',
      name: 'RELAX',
      tag: isEs ? 'Mente & Calma' : 'Mind & Calm',
      desc: isEs
        ? 'Relajación profunda, movimientos fluidos y un ritmo diseñado para ayudarte a desconectar del estrés diario.'
        : 'Deep relaxation, flowing movements and a rhythm designed to help you disconnect from everyday stress.',
      prices: { '60': '60€', '90': '90€' },
    },
    {
      id: 'deep',
      name: 'DEEP',
      tag: isEs ? 'Tensión & Espalda' : 'Tension & Back',
      desc: isEs
        ? 'Trabajo corporal enfocado en tensión muscular, tejido fascial y zonas de sobrecarga.'
        : 'Focused bodywork for muscular tension, fascial work and areas of overload.',
      prices: { '60': '65€', '90': '95€' },
    },
    {
      id: 'sport',
      name: 'SPORT',
      tag: isEs ? 'Músculo & Movilidad' : 'Muscle & Mobility',
      desc: isEs
        ? 'Masaje orientado a recuperación, movilidad y descarga muscular después de actividad física.'
        : 'Massage focused on recovery, mobility and muscular release after physical activity.',
      prices: { '60': '65€', '90': '95€' },
    },
  ];

  const reviews = [
    {
      author: 'Carlos M.',
      rating: 5,
      date: isEs ? 'Hace 2 semanas' : '2 weeks ago',
      text: isEs
        ? 'Una experiencia impecable. El masaje Deep alivió una contractura lumbar que llevaba arrastrando meses. El estudio es sumamente tranquilo y cuidado.'
        : 'Flawless experience. The Deep session completely released chronic lower back tightness. The private studio is serene and spotless.',
    },
    {
      author: 'Sophie L.',
      rating: 5,
      date: isEs ? 'Hace 1 mes' : '1 month ago',
      text: isEs
        ? 'El mejor masaje que he recibido en Madrid. Sofia es una profesional atenta, sabe escuchar el cuerpo y la atmósfera te permite desconectar de verdad.'
        : 'Easily the best massage in Madrid. Sofia works with genuine intention and precision. You can truly disconnect in complete peace.',
    },
    {
      author: 'David R.',
      rating: 5,
      date: isEs ? 'Hace 3 semanas' : '3 weeks ago',
      text: isEs
        ? 'Trato exquisito, discreción absoluta y máxima higiene. La ducha disponible antes y después del masaje marca la diferencia.'
        : 'Exquisite attention, absolute discretion, and highest hygiene standards. Having a shower available makes the whole visit seamless.',
    },
  ];

  const faqs = [
    {
      q: isEs ? '¿Dónde está el estudio?' : 'Where is the studio located?',
      a: isEs
        ? 'El estudio está situado en Madrid, Barrio de Salamanca (C. de Coslada, 28028). Para garantizar la privacidad absoluta de cada sesión, el número exacto y piso se facilita al confirmar la reserva.'
        : 'The studio is located in Madrid, Salamanca district (C. de Coslada, 28028). To ensure utmost discretion for all guests, the exact building and door number are provided upon booking confirmation.',
    },
    {
      q: isEs ? '¿Necesito llevar algo?' : 'Do I need to bring anything?',
      a: isEs
        ? 'No necesitas traer nada. Dispones de toallas limpias, sábanas orgánicas y ducha privada completa. Durante el masaje puedes permanecer en ropa interior o sin ella, según tu comodidad. Las zonas íntimas permanecen siempre cubiertas.'
        : 'No need to bring anything. Clean towels, organic linens, and a full private shower are provided. You may wear undergarments or remain undressed based on your comfort. Intimate areas remain draped at all times.',
    },
    {
      q: isEs ? '¿Puedo elegir la intensidad?' : 'Can I choose the pressure intensity?',
      a: isEs
        ? 'Sí. La intensidad y el ritmo se adaptan en todo momento a tus preferencias y a las necesidades específicas de tu cuerpo.'
        : 'Yes. Pressure depth and rhythm are tailored at all times to your comfort level and body requirements.',
    },
    {
      q: isEs ? '¿El masaje es personalizado?' : 'Is the session personalized?',
      a: isEs
        ? 'Sí. Antes de comenzar dedicamos unos minutos a comentar tus necesidades, las zonas con mayor sobrecarga и el enfoque deseado.'
        : 'Yes. Before beginning, we briefly discuss your focus areas, accumulated stress, and specific preferences.',
    },
    {
      q: isEs ? '¿Necesito reservar con antelación?' : 'Do I need to book in advance?',
      a: isEs
        ? 'Sí. Las sesiones son únicamente con cita previa confirmada para asegurar que el espacio esté exclusivamente reservado para ti.'
        : 'Yes. Sessions are strictly by advance appointment to guarantee you have the private studio entirely to yourself.',
    },
    {
      q: isEs ? '¿Puedo reservar и comunicarme en inglés?' : 'Can I book and communicate in English?',
      a: isEs
        ? 'Sí. Las sesiones, la consulta и toda la comunicación están disponibles con total fluidez tanto en español как en inglés.'
        : 'Yes. Sessions, consultation, and all communications are fully available in Spanish and English.',
    },
  ];

  return (
    <div className="bg-[#2B2521] text-[#2B2521] min-h-screen selection:bg-[#A88B74]/30 font-sans antialiased relative">
      
      {/* 1. ПРЕЛОАДЕР */}
      {loaderMounted && (
        <div className="loader-curtain fixed inset-0 z-50 bg-[#2B2521] text-[#F5F1EA] flex flex-col items-center justify-center pointer-events-auto">
          <div className="loader-content flex flex-col items-center max-w-sm px-6 text-center">
            <span className="text-[11px] uppercase font-mono tracking-[0.35em] text-[#A88B74] block mb-3 font-medium">
              Madrid · Barrio de Salamanca
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-wider uppercase mb-5 text-[#FAF7F2]">
              Sofia Massage
            </h2>
            <div className="w-48 h-[1.5px] bg-white/10 overflow-hidden rounded-full mb-3">
              <div className="loader-progress w-0 h-full bg-[#A88B74]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D9CBBE]/80 font-mono">
              Private Sanctuary
            </span>
          </div>
        </div>
      )}

      {/* 2. ФИКСИРОВАННАЯ ШАПКА */}
      <header className="site-header fixed top-0 left-0 right-0 z-40 bg-[#F5F1EA]/95 backdrop-blur-md border-b border-[#2B2521]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="group">
            <span className="font-serif text-lg sm:text-xl tracking-[0.15em] text-[#2B2521] font-semibold block uppercase">
              Sofia Massage
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#5C5148] uppercase font-sans font-medium block">
              Madrid · Barrio de Salamanca
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-[#5C5148] font-semibold">
            {[
              { href: '#massages', label: isEs ? 'Masajes' : 'Massages' },
              { href: '#about', label: isEs ? 'Sobre Mí' : 'About' },
              { href: '#studio', label: isEs ? 'El Estudio' : 'Studio' },
              { href: '#reviews', label: isEs ? 'Opiniones' : 'Reviews' },
              { href: '#faq', label: 'FAQ' },
              { href: '#location', label: isEs ? 'Ubicación' : 'Location' },
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="relative py-1 transition-colors duration-300 hover:text-[#2B2521] group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#A88B74] origin-left scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs border border-[#2B2521]/20 px-3.5 py-1.5 rounded-full bg-white/70 shadow-sm">
              <Link href="/" className={`${isEs ? 'text-[#2B2521] font-bold' : 'text-[#5C5148]'}`}>ES</Link>
              <span className="text-[#2B2521]/30">|</span>
              <Link href="/en" className={`${!isEs ? 'text-[#2B2521] font-bold' : 'text-[#5C5148]'}`}>EN</Link>
            </div>

            <button
              onClick={() => openBooking()}
              className="group relative hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#A88B74] text-[#FAF7F2] text-[11px] uppercase tracking-[0.18em] font-semibold overflow-hidden shadow-[0_4px_14px_rgba(168,139,116,0.35)] hover:bg-[#967963] hover:shadow-[0_6px_20px_rgba(168,139,116,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
            >
              <span>{isEs ? 'Reservar' : 'Book Now'}</span>
              <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 3. ОСНОВНОЙ КОНТЕНТ ВНУТРИ GSAP                                */}
      {/* ============================================================== */}
      <GsapScrollProvider>
        
        {/* АРХИТЕКТУРНАЯ ШТОРКА (Hero -> Карта) */}
        <div className="relative z-10 bg-[#F5F1EA] shadow-[0_50px_110px_rgba(43,37,33,0.6)] border-b border-[#2B2521]/20">
          
          {/* HERO СЕКЦИЯ (С РЕФОМ ДЛЯ ТРИГГЕРА МОБИЛЬНОЙ ПАНЕЛИ) */}
          <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-[#2B2521]/10 bg-[#F5F1EA]">
            <div className="absolute inset-0 pointer-events-none select-none">
              <img
                src="/Le2Ov.jpg"
                alt="Sofia Massage Madrid Sanctuary"
                className="w-full h-full object-cover object-right"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5F1EA] via-[#F5F1EA]/60 to-transparent/10" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 md:py-36 w-full">
              <div className="max-w-xl text-left">
                <div className="hero-tag inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-[#2B2521]/15 backdrop-blur-md shadow-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#A88B74] animate-pulse" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#5C5148] font-mono font-semibold">
                    {isEs ? 'Estudio Privado · Salamanca, Madrid' : 'Private Sanctuary · Salamanca, Madrid'}
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.6rem] font-light text-[#2B2521] leading-[1.05] tracking-tight mb-6">
                  <span className="hero-title-line block">
                    {isEs ? 'Bienestar corporal' : 'Return to Stillness.'}
                  </span>
                  <span className="hero-title-line block italic font-normal text-[#2B2521]">
                    {isEs ? 'en un entorno sereno' : 'under mindful care.'}
                  </span>
                </h1>

                <p className="hero-desc text-[#3E352E] text-base sm:text-lg font-normal leading-relaxed mb-10 max-w-md">
                  {isEs
                    ? 'Sesiones de masaje adaptadas a ti en un estudio independiente en C. de Coslada, Madrid. Discreción, atención pausada и máxima comodidad.'
                    : 'Personalised massage sessions tailored to your individual needs in C. de Coslada, Madrid. A quiet sanctuary focused on genuine restorative care.'}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={() => openBooking()}
                    className="hero-cta-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#A88B74] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] font-semibold overflow-hidden shadow-[0_8px_24px_-4px_rgba(168,139,116,0.42)] hover:bg-[#967963] hover:shadow-[0_14px_30px_-4px_rgba(168,139,116,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
                  >
                    <span className="relative z-10">{isEs ? 'RESERVAR SESIÓN' : 'BOOK A SESSION'}</span>
                    <span className="relative z-10 text-sm transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
                  </button>

                  <a
                    href="#massages"
                    className="hero-cta-btn group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/80 border border-[#2B2521]/15 text-[#2B2521] text-xs uppercase tracking-[0.2em] font-semibold hover:border-[#A88B74] hover:bg-white hover:text-[#A88B74] transition-all duration-300 shadow-sm"
                  >
                    <span>{isEs ? 'VER MASAJES' : 'EXPLORE PROGRAMS'}</span>
                    <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 8. SIGNATURE MASSAGES */}
          <section id="massages" className="py-24 px-6 max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12 gsap-reveal">
              <span className="text-xs uppercase tracking-[0.25em] text-[#5C5148] block mb-2 font-mono font-semibold">
                Sofia Signature
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#2B2521]">
                {isEs ? 'Encuentra tu experiencia' : 'Find your experience'}
              </h2>
            </div>

            {/* МИНИ-НАВИГАТОР */}
            <div className="max-w-3xl mx-auto mb-10 p-5 rounded-3xl bg-white border border-[#2B2521]/15 shadow-sm gsap-reveal">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase font-mono tracking-wider text-[#A88B74] font-bold">
                  ✦ {isEs ? '¿Qué necesita tu cuerpo hoy?' : 'What does your body need today?'}
                </span>
                {activeRitualFilter !== 'all' && (
                  <button
                    onClick={() => setActiveRitualFilter('all')}
                    className="text-[10px] uppercase font-mono tracking-wider text-[#5C5148] hover:text-[#2B2521] underline"
                  >
                    {isEs ? 'Ver todos' : 'Show all'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'relax',
                    label: isEs ? 'Estrés mental y desconexión' : 'Mental stress & disconnect',
                    icon: '💆‍♀️',
                  },
                  {
                    id: 'deep',
                    label: isEs ? 'Contracturas y dolor de espalda' : 'Knots & back tension',
                    icon: '⚡',
                  },
                  {
                    id: 'sport',
                    label: isEs ? 'Descarga muscular post-entreno' : 'Muscle recovery & workout',
                    icon: '🏃',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveRitualFilter(activeRitualFilter === item.id ? 'all' : (item.id as any))}
                    className={`px-3.5 py-3 rounded-2xl text-left text-xs transition-all duration-300 flex items-center gap-2.5 border ${
                      activeRitualFilter === item.id
                        ? 'bg-[#A88B74] text-[#FAF7F2] border-[#A88B74] shadow-md font-semibold'
                        : 'bg-[#F5F1EA]/60 text-[#3E352E] border-[#2B2521]/10 hover:border-[#A88B74]/50 hover:bg-white'
                    }`}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="leading-snug">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ПЕРЕКЛЮЧАТЕЛЬ 60 / 90 МИН */}
            <div className="flex justify-center mb-12 gsap-reveal">
              <div className="inline-flex p-1.5 rounded-full bg-white border border-[#2B2521]/15 shadow-sm">
                <button
                  onClick={() => setSelectedDuration('60')}
                  className={`px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
                    selectedDuration === '60'
                      ? 'bg-[#2B2521] text-[#FAF7F2] font-bold shadow-md'
                      : 'text-[#5C5148] hover:text-[#2B2521]'
                  }`}
                >
                  60 {isEs ? 'Minutos' : 'Minutes'}
                </button>
                <button
                  onClick={() => setSelectedDuration('90')}
                  className={`px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
                    selectedDuration === '90'
                      ? 'bg-[#2B2521] text-[#FAF7F2] font-bold shadow-md'
                      : 'text-[#5C5148] hover:text-[#2B2521]'
                  }`}
                >
                  90 {isEs ? 'Minutos' : 'Minutes'}
                </button>
              </div>
            </div>

            {/* Карточки */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gsap-stagger-group">
              {massages.map((item) => {
                const isHighlighted = activeRitualFilter === item.id;
                const isDimmed = activeRitualFilter !== 'all' && !isHighlighted;
                const currentPrice = item.prices[selectedDuration];

                return (
                  <div
                    key={item.id}
                    className={`gsap-stagger-item relative p-8 sm:p-10 rounded-3xl bg-white border transition-all duration-500 flex flex-col justify-between ${
                      isHighlighted
                        ? 'border-[#A88B74] shadow-[0_16px_40px_rgba(168,139,116,0.28)] ring-2 ring-[#A88B74] -translate-y-2'
                        : isDimmed
                        ? 'border-[#2B2521]/10 opacity-55 hover:opacity-100 shadow-sm'
                        : 'border-[#2B2521]/15 hover:border-[#A88B74] shadow-sm hover:shadow-xl'
                    }`}
                  >
                    {isHighlighted && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#A88B74] text-[#FAF7F2] text-[10px] font-mono uppercase tracking-widest font-bold rounded-full shadow-sm">
                        {isEs ? '✨ Recomendado para ti' : '✨ Recommended for you'}
                      </span>
                    )}

                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="font-serif text-3xl text-[#2B2521] font-normal tracking-wide">
                          {item.name}
                        </h3>
                        <span className="text-[11px] uppercase font-mono text-[#A88B74] font-semibold">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[#3E352E] text-[15px] leading-relaxed mb-8 font-normal min-h-[75px]">
                        {item.desc}
                      </p>
                    </div>

                    <div>
                      <div className="border-t border-[#2B2521]/10 pt-6 mb-8 flex justify-between items-center text-sm font-medium text-[#2B2521]">
                        <span className="font-mono text-xs text-[#5C5148]">
                          {selectedDuration} {isEs ? 'minutos' : 'minutes'}
                        </span>
                        <span className="font-mono text-2xl font-bold text-[#2B2521] transition-all duration-300">
                          {currentPrice}
                        </span>
                      </div>

                      <button
                        onClick={() => openBooking()}
                        className="w-full group relative inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#A88B74] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] font-semibold overflow-hidden shadow-[0_4px_14px_rgba(168,139,116,0.3)] hover:bg-[#967963] hover:shadow-[0_8px_20px_rgba(168,139,116,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
                      >
                        <span className="relative z-10">{isEs ? 'RESERVAR' : 'BOOK NOW'}</span>
                        <span className="relative z-10 inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 9. ABOUT SOFIA + WEBGL */}
          <section id="about" className="relative py-28 px-6 border-y border-[#2B2521]/15 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <LiquidOilCanvas />
              <div className="absolute inset-0 bg-gradient-to-b from-[#F5F1EA]/60 via-transparent to-[#F5F1EA]/60 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-5 gsap-reveal">
                <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-[#D9CBBE] border border-[#2B2521]/15 group">
                  <img
                    src="/sofia.jpg"
                    alt="Sofia — Quiromasajista Profesional en Madrid"
                    className="w-full h-full object-cover object-[center_top] group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B2521]/80 via-transparent to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-6 left-6 z-20 text-[#F5F1EA]">
                    <span className="font-serif text-2xl block font-normal">Sofia</span>
                    <span className="text-xs uppercase tracking-widest text-[#F5F1EA]/90 font-mono font-medium">
                      Quiromasajista Profesional · Madrid
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 gsap-reveal">
                <div className="p-8 sm:p-12 rounded-3xl bg-white/85 backdrop-blur-md border border-[#2B2521]/15 shadow-[0_15px_40px_rgba(43,37,33,0.06)]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#5C5148] block mb-3 font-mono font-semibold">
                    {isEs ? 'Sobre Mí' : 'About Sofia'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#2B2521] mb-8 leading-tight">
                    {isEs ? 'Conoce a Sofia' : 'Meet Sofia'}
                  </h2>
                  
                  <div className="space-y-5 text-[#2B2521] text-base sm:text-lg font-normal leading-relaxed">
                    <p>
                      {isEs
                        ? 'Soy Sofia, masajista especializada en crear sesiones personalizadas de masaje y bienestar corporal.'
                        : 'I’m Sofia, a massage therapist focused on creating personalised massage and body-wellness sessions.'}
                    </p>
                    <p>
                      {isEs
                        ? 'Mi enfoque combina diferentes técnicas de masaje para adaptarse a las necesidades de cada persona.'
                        : 'My approach combines different massage techniques to adapt each session to the individual.'}
                    </p>
                    <p>
                      {isEs
                        ? 'Para mí, una buena sesión no consiste simplemente en aplicar presión. Se trata de escuchar el cuerpo, trabajar con atención и crear un espacio donde puedas realmente desconectar.'
                        : 'For me, a great massage is not simply about pressure. It is about listening to the body, working with intention and creating a space where you can truly disconnect.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 10 & 11. THE STUDIO */}
          <section id="studio" className="py-24 px-6 max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-xs uppercase tracking-[0.25em] text-[#5C5148] block mb-2 font-mono font-semibold">
                Madrid · C. de Coslada, 28028
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#2B2521] mb-6">
                {isEs ? 'Tu espacio privado en Madrid' : 'Your private space in Madrid'}
              </h2>
              <div className="space-y-3 text-[#3E352E] font-normal text-base leading-relaxed">
                <p>
                  {isEs
                    ? 'Un estudio privado, tranquilo и cuidado hasta el último detalle en el Barrio de Salamanca. Un espacio pensado para que puedas relajarte, desconectar и disfrutar de tu sesión con total privacidad.'
                    : 'A private, peaceful studio designed with attention to every detail in the Salamanca district. A space created for you to relax, disconnect and enjoy your session in complete privacy.'}
                </p>
                <p className="font-medium text-[#2B2521]">
                  {isEs
                    ? 'Disponemos de ducha и todo lo necesario para que tu experiencia sea cómoda de principio a fin.'
                    : 'A shower and everything you need are available for your comfort before or after your massage.'}
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto mb-14 rounded-3xl overflow-hidden shadow-xl border border-[#2B2521]/15 aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/10] bg-[#D9CBBE]/20 gsap-reveal group">
              <img
                src="/llCLg.jpg"
                alt="Estudio Sofia Massage Madrid"
                className="w-full h-full object-cover object-[center_52%] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gsap-stagger-group">
              {[
                { title: 'PRIVATE', es: 'Estudio privado и tranquilo.', en: 'Private and peaceful studio.' },
                { title: 'PERSONALISED', es: 'Cada sesión se adapta a ti.', en: 'Every session is personalised.' },
                { title: 'PROFESSIONAL', es: 'Atención profesional и cuidadosa.', en: 'Professional and attentive service.' },
                { title: 'DISCREET', es: 'Privacidad y respeto en todo momento.', en: 'Privacy and respect at every step.' },
              ].map((pillar, idx) => (
                <div
                  key={idx}
                  className="gsap-stagger-item p-6 rounded-2xl bg-white border border-[#2B2521]/15 text-center flex flex-col justify-center items-center shadow-sm"
                >
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#A88B74] font-bold block mb-2">
                    {pillar.title}
                  </span>
                  <p className="text-xs text-[#3E352E] font-normal">
                    {isEs ? pillar.es : pillar.en}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 12. REVIEWS */}
          <section id="reviews" className="py-24 px-6 bg-[#2B2521] text-[#F5F1EA]">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-16 gsap-reveal">
                <span className="text-xs uppercase tracking-[0.25em] text-[#D9CBBE] block mb-2 font-mono font-medium">
                  Google Business Profile · 5.0 ★
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F5F1EA]">
                  {isEs ? 'Lo que dicen mis clientes' : 'What my clients say'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gsap-stagger-group mb-12">
                {reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="gsap-stagger-item p-8 rounded-3xl bg-[#362E29] border border-white/10 flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-amber-400 text-sm tracking-widest">★★★★★</div>
                        <span className="text-[10px] uppercase font-mono text-[#D9CBBE] font-medium">
                          Google Review
                        </span>
                      </div>
                      <p className="text-[15px] text-[#F5F1EA] font-normal leading-relaxed mb-6 italic">
                        "{rev.text}"
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs">
                      <span className="font-medium text-[#F5F1EA]">{rev.author}</span>
                      <span className="text-[#D9CBBE]/80">{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center gsap-reveal">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#A88B74] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] font-semibold overflow-hidden shadow-[0_6px_20px_rgba(168,139,116,0.35)] hover:bg-[#967963] hover:shadow-[0_10px_25px_rgba(168,139,116,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span>{isEs ? 'VER TODAS LAS OPINIONES' : 'READ ALL REVIEWS'}</span>
                  <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* 14. FAQ */}
          <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-16 gsap-reveal">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 border border-[#2B2521]/10 backdrop-blur-sm mb-3 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A88B74]" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#5C5148] font-mono font-semibold">
                  FAQ & Guía
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#2B2521] tracking-tight">
                {isEs ? 'Preguntas frecuentes' : 'Frequently asked questions'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5148] mt-3 font-normal max-w-md mx-auto">
                {isEs
                  ? 'Todo lo que necesitas saber antes de tu primera sesión de masaje en nuestro santuario.'
                  : 'Everything you need to know prior to your tailored session in our sanctuary.'}
              </p>
            </div>

            <div className="space-y-3.5 gsap-stagger-group">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                const formattedNumber = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={index}
                    className={`gsap-stagger-item group relative rounded-2xl transition-all duration-300 overflow-hidden bg-white border ${
                      isOpen
                        ? 'border-[#A88B74]/60 shadow-[0_8px_25px_-6px_rgba(168,139,116,0.18)] ring-1 ring-[#A88B74]/30'
                        : 'border-[#2B2521]/10 hover:border-[#A88B74]/40 hover:shadow-[0_6px_20px_-4px_rgba(43,37,33,0.05)] hover:-translate-y-0.5'
                    }`}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 transition-colors"
                    >
                      <div className="flex items-baseline gap-4 sm:gap-6 pr-2">
                        <span className="font-mono text-xs text-[#A88B74] font-semibold tracking-wider select-none shrink-0 transition-colors group-hover:text-[#2B2521]">
                          {formattedNumber}
                        </span>
                        <span className={`font-serif text-lg sm:text-xl font-medium tracking-wide transition-colors duration-300 ${
                          isOpen ? 'text-[#2B2521]' : 'text-[#2B2521]/90 group-hover:text-[#2B2521]'
                        }`}>
                          {faq.q}
                        </span>
                      </div>

                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ease-out ${
                          isOpen
                            ? 'bg-[#A88B74] text-[#FAF7F2] border-[#A88B74] rotate-45 shadow-[0_2px_10px_rgba(168,139,116,0.35)]'
                            : 'bg-[#F5F1EA]/70 text-[#5C5148] border-[#2B2521]/15 group-hover:border-[#A88B74] group-hover:bg-[#A88B74] group-hover:text-[#FAF7F2]'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z" />
                        </svg>
                      </div>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1">
                          <div className="pl-8 sm:pl-10 border-t border-[#2B2521]/5 pt-4 text-[15px] sm:text-base text-[#3E352E] font-normal leading-relaxed">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12 gsap-reveal">
              <p className="text-xs text-[#5C5148] font-normal">
                {isEs ? '¿Tienes alguna otra duda o petición especial?' : 'Have any specific questions or special requests?'}{' '}
                <a
                  href="https://wa.me/34614394539"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#2B2521] underline decoration-[#A88B74] underline-offset-4 hover:text-[#A88B74] transition-colors"
                >
                  {isEs ? 'Escríbeme directamente por WhatsApp ↗' : 'Chat with me directly on WhatsApp ↗'}
                </a>
              </p>
            </div>
          </section>

          {/* 15. ЛОКАЦИЯ И КАРТА */}
          <section id="location" className="py-24 px-6 border-t border-[#2B2521]/10 bg-[#D9CBBE]/20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 gsap-reveal space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#5C5148] block mb-2 font-mono font-semibold">
                    {isEs ? 'Ubicación & Horarios' : 'Location & Hours'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#2B2521]">
                    Barrio de Salamanca
                  </h2>
                  <p className="text-sm font-mono text-[#5C5148] mt-1">C. de Coslada, 28028 Madrid</p>
                </div>

                <p className="text-[#3E352E] text-base leading-relaxed font-normal">
                  {isEs
                    ? 'El estudio está situado en una calle tranquila и residencial del Barrio de Salamanca, con excelente comunicación en transporte público и fácil acceso a parkings.'
                    : 'The studio is nestled in a quiet, distinguished residential street of the Salamanca district, exceptionally well-connected by transport and parking.'}
                </p>

                <div className="p-5 rounded-2xl bg-white border border-[#2B2521]/15 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs uppercase font-mono font-bold tracking-wider text-[#2B2521] pb-1 border-b border-[#2B2521]/10">
                    <span>🕒</span>
                    <span>{isEs ? 'Horario de Sesiones' : 'Opening Hours'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-[#5C5148]">
                      <strong className="block text-[#2B2521] font-semibold">{isEs ? 'Lunes – Jueves:' : 'Mon – Thu:'}</strong>
                      <span>11:00 – 20:00</span>
                    </div>
                    <div className="text-[#5C5148]">
                      <strong className="block text-[#2B2521] font-semibold">{isEs ? 'Viernes – Domingo:' : 'Fri – Sun:'}</strong>
                      <span>12:00 – 20:00</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#5C5148] pt-1 border-t border-[#2B2521]/5 italic">
                    {isEs ? '* Atención exclusiva con cita previa confirmada.' : '* Strictly by advance confirmed appointment.'}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#3E352E]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-sm">🚇</span>
                    <div>
                      <strong className="font-semibold text-[#2B2521]">{isEs ? 'Metro cercano:' : 'Nearby Metro:'}</strong>{' '}
                      <span>Cartagena (L7) · Diego de León (L4, L5, L6) · Av. de América (L4, L6, L7, L9)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-sm">📍</span>
                    <div>
                      <strong className="font-semibold text-[#2B2521]">{isEs ? 'Dirección exacta:' : 'Exact address:'}</strong>{' '}
                      <span>{isEs ? 'C. de Coslada, 28028 Madrid (Piso и puerta facilitados al reservar)' : 'C. de Coslada, 28028 Madrid (Building details provided upon booking)'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#A88B74] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] font-semibold shadow-[0_4px_14px_rgba(168,139,116,0.35)] hover:bg-[#967963] hover:shadow-[0_8px_20px_rgba(168,139,116,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    <span>{isEs ? 'Abrir en Google Maps' : 'Open in Google Maps'}</span>
                    <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">↗</span>
                  </a>
                  <a
                    href="https://wa.me/34614394539"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#2B2521]/20 text-[#2B2521] text-xs uppercase tracking-[0.18em] font-semibold hover:border-[#A88B74] hover:text-[#A88B74] transition-all shadow-sm"
                  >
                    <span>💬 WhatsApp</span>
                    <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 gsap-reveal">
                <div className="rounded-3xl overflow-hidden border border-[#2B2521]/15 shadow-2xl h-[440px] bg-white relative">
                  <iframe
                    title="Sofía Massage Madrid Location"
                    src="https://maps.google.com/maps?q=Calle+de+Coslada,+Salamanca,+28028+Madrid&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

        </div> {/* ЗАКРЫВАЕМ ВЕРХНЮЮ СВЕТЛУЮ ШТОРКУ */}

        {/* ============================================================== */}
        {/* ТЕМНЫЙ ФУТЕР — ПИННИНГ GSAP SCROLLTRIGGER (CURTAIN REVEAL)     */}
        {/* ============================================================== */}
       {/* ============================================================== */}
        {/* ТЕМНЫЙ ФУТЕР — АДАПТИРОВАН ПОД МОБИЛЬНЫЙ ВЬЮПОРТ (CURTAIN)     */}
        {/* ============================================================== */}
        <footer
          ref={footerRef}
          className="relative z-0 bg-[#2B2521] text-[#F5F1EA] pt-8 pb-28 md:py-16 px-5 sm:px-6 flex flex-col justify-between"
        >
          <div className="max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 md:gap-10 pb-6 md:pb-12 border-b border-white/10 text-xs">
            
            {/* Блок бренда (на мобильных занимает всю ширину в 2 колонки) */}
            <div className="col-span-2 md:col-span-5 space-y-1.5 md:space-y-3">
              <span className="font-serif text-xl sm:text-2xl tracking-wider uppercase block font-semibold text-[#F5F1EA]">
                SOFIA MASSAGE MADRID
              </span>
              <p className="text-[#D9CBBE] text-[11px] sm:text-xs">
                {isEs 
                  ? 'Estudio Privado · C. de Coslada, Salamanca, 28028 Madrid' 
                  : 'Private Studio · C. de Coslada, Salamanca, 28028 Madrid'}
              </p>
              <p className="text-[#D9CBBE]/80 text-[10px] sm:text-xs">
                {isEs 
                  ? 'Atención personalizada con cita previa.' 
                  : 'Personalised sessions by advance appointment.'}
              </p>
            </div>

            {/* Колонка навигации (на мобильных стоит слева в компактном виде) */}
            <div className="col-span-1 md:col-span-3 space-y-1 md:space-y-2">
              <span className="text-[10px] md:text-[11px] uppercase font-mono tracking-widest text-[#D9CBBE] font-semibold block mb-1.5 md:mb-3">
                {isEs ? 'Navegación' : 'Navigation'}
              </span>
              <ul className="space-y-1 md:space-y-2 text-[#F5F1EA]/80 font-medium text-[11px] md:text-xs">
                <li><a href="#" className="hover:text-white transition-colors">{isEs ? 'Inicio' : 'Home'}</a></li>
                <li><a href="#massages" className="hover:text-white transition-colors">{isEs ? 'Masajes' : 'Massage'}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{isEs ? 'Sobre Mí' : 'About'}</a></li>
                <li><a href="#studio" className="hover:text-white transition-colors">{isEs ? 'El Estudio' : 'Studio'}</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">{isEs ? 'Opiniones' : 'Reviews'}</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#location" className="hover:text-white transition-colors">{isEs ? 'Ubicación' : 'Location'}</a></li>
              </ul>
            </div>

            {/* Колонка контактов (на мобильных стоит справа рядом с навигацией) */}
            <div className="col-span-1 md:col-span-4 space-y-1 md:space-y-2">
              <span className="text-[10px] md:text-[11px] uppercase font-mono tracking-widest text-[#D9CBBE] font-semibold block mb-1.5 md:mb-3">
                {isEs ? 'Contacto' : 'Direct'}
              </span>
              <ul className="space-y-1.5 md:space-y-2.5 text-[#F5F1EA]/80 font-medium text-[11px] md:text-xs">
                <li>
                  <a href="https://www.instagram.com/sofia_massage_madrid?utm_source=qr&igsh=MXNyZTZtNWE2ZnFweA==" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Instagram ↗
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/34614394539" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp ↗
                  </a>
                </li>
                <li>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Google Maps ↗
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Нижняя строчка копирайта и ссылок */}
          <div className="max-w-6xl mx-auto w-full pt-4 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[11px] md:text-xs text-[#D9CBBE]">
            <p>© Sofia Massage Madrid 2026</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <button onClick={() => openLegal('privacy')} className="hover:text-white transition-colors underline">
                {isEs ? 'Privacidad' : 'Privacy Policy'}
              </button>
              <button onClick={() => openLegal('cookies')} className="hover:text-white transition-colors underline">
                {isEs ? 'Cookies' : 'Cookie Policy'}
              </button>
              <button onClick={() => openLegal('legal')} className="hover:text-white transition-colors underline">
                {isEs ? 'Aviso Legal' : 'Legal Notice'}
              </button>
            </div>
          </div>
        </footer>

      </GsapScrollProvider>

      {/* ============================================================== */}
      {/* 4. МОБИЛЬНАЯ ПАНЕЛЬ С АНИМАЦИЕЙ ПОДЪЕМА ПО СКРОЛЛУ (HERO EXIT) */}
      {/* ============================================================== */}
      <div
        ref={mobileBarRef}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F1EA]/98 border-t border-[#2B2521]/15 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex gap-3 backdrop-blur-lg shadow-lg will-change-transform"
      >
        <a
          href="https://wa.me/34614394539"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full border border-[#2B2521]/20 flex items-center justify-center text-[#2B2521] bg-white active:scale-95 shadow-sm"
          aria-label="WhatsApp"
        >
          💬
        </a>
        <button
          onClick={() => openBooking()}
          className="flex-1 group inline-flex items-center justify-center gap-2 rounded-full bg-[#A88B74] text-[#FAF7F2] font-semibold text-xs uppercase tracking-[0.18em] shadow-[0_4px_14px_rgba(168,139,116,0.4)] active:scale-95 py-3.5"
        >
          <span>{isEs ? 'Reservar Cita' : 'Book Session'}</span>
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 5. ЮРИДИЧЕСКАЯ МОДАЛКА (СНАРУЖИ СКРОЛЛЕРА)                     */}
      {/* ============================================================== */}
      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white border border-[#2B2521]/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2521]/10 bg-[#F5F1EA]">
              <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                <button
                  onClick={() => setLegalTab('privacy')}
                  className={legalTab === 'privacy' ? 'text-[#2B2521] underline' : 'text-[#5C5148]'}
                >
                  {isEs ? 'Privacidad' : 'Privacy Policy'}
                </button>
                <button
                  onClick={() => setLegalTab('cookies')}
                  className={legalTab === 'cookies' ? 'text-[#2B2521] underline' : 'text-[#5C5148]'}
                >
                  {isEs ? 'Cookies' : 'Cookie Policy'}
                </button>
                <button
                  onClick={() => setLegalTab('legal')}
                  className={legalTab === 'legal' ? 'text-[#2B2521] underline' : 'text-[#5C5148]'}
                >
                  {isEs ? 'Aviso Legal' : 'Legal Notice'}
                </button>
              </div>
              <button onClick={() => setLegalModalOpen(false)} className="text-[#2B2521] text-lg font-bold">
                ✕
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto text-sm text-[#3E352E] leading-relaxed space-y-3 font-normal">
              {legalTab === 'privacy' && (
                <>
                  <h3 className="font-serif text-lg text-[#2B2521] font-semibold">
                    {isEs ? 'Política de Privacidad (RGPD)' : 'Privacy Policy (GDPR)'}
                  </h3>
                  <p>
                    {isEs
                      ? 'Responsable: Sofia Massage Madrid (C. de Coslada, Salamanca, 28028 Madrid). Finalidad: Gestión de reservas mediante la plataforma Fresha y atención personalizada vía WhatsApp. Sus datos nunca serán cedidos a terceros.'
                      : 'Data Controller: Sofia Massage Madrid (C. de Coslada, Salamanca, 28028 Madrid). Purpose: Appointment management via Fresha and client care via WhatsApp. Your details are never shared with third parties.'}
                  </p>
                </>
              )}
              {legalTab === 'cookies' && (
                <>
                  <h3 className="font-serif text-lg text-[#2B2521] font-semibold">
                    {isEs ? 'Política de Cookies' : 'Cookie Policy'}
                  </h3>
                  <p>
                    {isEs
                      ? 'Utilizamos cookies analíticas y técnicas conforme a la normativa española de la AEPD para mejorar su experiencia de reserva.'
                      : 'We use technical and aggregated analytics cookies under Spanish AEPD guidelines to ensure optimal booking performance.'}
                  </p>
                </>
              )}
              {legalTab === 'legal' && (
                <>
                  <h3 className="font-serif text-lg text-[#2B2521] font-semibold">
                    {isEs ? 'Aviso Legal (LSSI-CE)' : 'Legal Notice (LSSI-CE)'}
                  </h3>
                  <p>
                    {isEs
                      ? 'Estudio profesional de masajes и bienestar corporal no sanitario con sede en C. de Coslada, Barrio de Salamanca, 28028 Madrid.'
                      : 'Professional non-medical massage and bodywork studio based in C. de Coslada, Barrio de Salamanca, 28028 Madrid.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}