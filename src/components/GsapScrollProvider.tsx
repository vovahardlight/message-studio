'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Регистрируем официальные плагины GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function GsapScrollProvider({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. Инициализируем GSAP ScrollSmoother
      ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.6, // Мягкий инерционный ход на десктопах
        effects: true, // Поддержка data-speed для параллакса
        smoothTouch: false, // ➔ ОТКЛЮЧАЕТ сглаживание на тач-экранах (нативный отзывчивый скролл на телефонах)
        normalizeScroll: false, // Не блокирует системные жесты
        ignoreMobileResize: true, // Предотвращает прыжки при сворачивании адресной строки на смартфонах
      });

      // 2. Анимация появления одиночных блоков на 70% высоты экрана
      const revealElements = gsap.utils.toArray<HTMLElement>('.gsap-reveal');
      revealElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 45 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 70%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });

      // 3. Каскадная анимация (stagger) для карточек услуг, галереи и FAQ
      const staggerContainers = gsap.utils.toArray<HTMLElement>('.gsap-stagger-group');
      staggerContainers.forEach((group) => {
        const cards = group.querySelectorAll('.gsap-stagger-item');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 70%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });

    });

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapperRef} className="w-full overflow-hidden min-h-screen">
      <div id="smooth-content" ref={contentRef} className="w-full">
        {children}
      </div>
    </div>
  );
}