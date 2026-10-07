'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PremiumAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'seo-es' | 'seo-en' | 'technical' | 'services' | 'contacts'>('seo-es');
  const [serpView, setSerpView] = useState<'desktop' | 'mobile'>('desktop');
  const [data, setData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.seo) setData(json);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Горячая клавиша Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isAuthenticated) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, data]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('Неверный пароль!');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage({ text: 'Публикация изменений...', type: '' });
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setHasUnsavedChanges(false);
        setStatusMessage({ text: 'Все изменения успешно опубликованы в продакшн', type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
      } else {
        setStatusMessage({ text: 'Ошибка сохранения на сервере', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Сетевая ошибка при сохранении', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSeo = (lang: 'es' | 'en', field: string, value: any) => {
    setHasUnsavedChanges(true);
    setData({
      ...data,
      seo: {
        ...data.seo,
        [lang]: {
          ...data.seo[lang],
          [field]: value,
        },
      },
    });
  };

  const updateRobots = (lang: 'es' | 'en', field: string, value: boolean) => {
    setHasUnsavedChanges(true);
    setData({
      ...data,
      seo: {
        ...data.seo,
        [lang]: {
          ...data.seo[lang],
          robots: {
            ...data.seo[lang].robots,
            [field]: value,
          },
        },
      },
    });
  };

  const updateSchema = (lang: 'es' | 'en', rawJson: string) => {
    setHasUnsavedChanges(true);
    try {
      JSON.parse(rawJson);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
    updateSeo(lang, 'schemaJson', rawJson);
  };

  // Добавление новой услуги под формат сайта
  const handleAddService = () => {
    setHasUnsavedChanges(true);
    const newService = {
      id: `service-${Date.now()}`,
      name: 'NUEVO RITUAL',
      tag: 'Bienestar Corporal',
      descEs: 'Descripción del tratamiento y beneficios musculares...',
      descEn: 'Treatment ritual description and physiological benefits...',
      prices: {
        '60': '65€',
        '90': '95€',
      },
      freshaLink: 'https://www.fresha.com/book-now/sofia-massage-madrid-b9sthwsj/all-offer?share=true&pId=3108060',
    };
    setData({ ...data, services: [...(data.services || []), newService] });
  };

  const handleDeleteService = (id: string | number) => {
    if (confirm('Удалить эту услугу из прайс-листа сайта?')) {
      setHasUnsavedChanges(true);
      setData({ ...data, services: data.services.filter((s: any) => s.id !== id) });
    }
  };

  // Экран логина
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center p-6 text-[#EDE6DE]">
        <div className="w-full max-w-md p-10 bg-[#12110F] border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A88B74] to-transparent opacity-60" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1816] border border-[#A88B74]/30 flex items-center justify-center text-[#A88B74] mb-4 shadow-[0_0_24px_rgba(168,139,116,0.15)]">
              <span className="font-serif font-bold text-lg">SM</span>
            </div>
            <h1 className="font-serif text-2xl text-center font-normal">Sofia Massage Madrid</h1>
            <p className="text-xs text-[#A89F91] mt-1 font-mono">Консоль управления SEO & Контентом</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#A89F91] font-mono mb-2">Ключ доступа</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full px-4 py-3 bg-[#0A0908] border border-white/[0.1] rounded-xl text-sm font-mono text-[#EDE6DE] focus:border-[#A88B74] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#A88B74] text-[#FAF7F2] font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-[#967963] transition-all duration-300 shadow-md"
            >
              Войти в консоль
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data || !data.seo) {
    return <div className="min-h-screen bg-[#0A0908] flex items-center justify-center text-[#A89F91] font-mono text-xs">Загрузка модулей...</div>;
  }

  const currentLang = activeTab === 'seo-en' ? 'en' : 'es';
  const currentSeo = data.seo[currentLang];

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#EDE6DE] flex font-sans">
      
      {/* ============================================================== */}
      {/* БОКОВОЕ МЕНЮ (SIDEBAR)                                         */}
      {/* ============================================================== */}
      <aside className="w-72 border-r border-white/[0.08] bg-[#100F0D] flex flex-col justify-between p-6 shrink-0 select-none">
        <div>
          {/* Профиль студии */}
          <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A88B74]/20 to-[#1A1816] border border-[#A88B74]/40 flex items-center justify-center text-[#A88B74] font-serif font-bold text-base shadow-sm">
              SM
            </div>
            <div>
              <div className="text-sm font-medium tracking-tight">Sofia Massage</div>
              <div className="text-[11px] text-[#A89F91] font-mono flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(160,230,150,0.5)]" />
                <span>Madrid · Salamanca</span>
              </div>
            </div>
          </div>

          {/* Навигационные вкладки */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#A89F91]/50 px-3 block mb-2">
                Поисковая Оптимизация
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('seo-es')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'seo-es' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold shadow-md' : 'text-[#A89F91] hover:text-[#EDE6DE] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-sm">🇪🇸</span> SEO Испанский (ES)
                  </span>
                  <span className="font-mono text-[10px] opacity-60">/</span>
                </button>

                <button
                  onClick={() => setActiveTab('seo-en')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'seo-en' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold shadow-md' : 'text-[#A89F91] hover:text-[#EDE6DE] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-sm">🇬🇧</span> SEO Английский (EN)
                  </span>
                  <span className="font-mono text-[10px] opacity-60">/en</span>
                </button>

                <button
                  onClick={() => setActiveTab('technical')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'technical' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold shadow-md' : 'text-[#A89F91] hover:text-[#EDE6DE] hover:bg-white/[0.04]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  <span>Теги, GTM & Robots.txt</span>
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#A89F91]/50 px-3 block mb-2">
                Контент и Запись
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'services' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold shadow-md' : 'text-[#A89F91] hover:text-[#EDE6DE] hover:bg-white/[0.04]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Услуги (60/90 мин)</span>
                </button>

                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'contacts' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold shadow-md' : 'text-[#A89F91] hover:text-[#EDE6DE] hover:bg-white/[0.04]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>Локация, Часы & Сети</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Футер меню */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#A89F91] hover:text-[#EDE6DE] hover:bg-white/[0.04] transition-all"
          >
            <span>Открыть сайт</span>
            <span className="font-mono text-xs">↗</span>
          </Link>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full text-left px-3.5 py-2 rounded-xl text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
          >
            Выйти из консоли
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* РАБОЧАЯ ОБЛАСТЬ (MAIN CONTENT)                                 */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Верхняя шапка */}
        <header className="sticky top-0 z-30 bg-[#0A0908]/90 backdrop-blur-xl border-b border-white/[0.08] px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A89F91] font-mono">Консоль</span>
            <span className="text-white/20">/</span>
            <span className="text-xs font-medium text-[#EDE6DE] capitalize">
              {activeTab === 'seo-es' ? 'SEO на Испанском' : activeTab === 'seo-en' ? 'SEO на Английском' : activeTab === 'services' ? 'Прайс-лист' : activeTab === 'technical' ? 'Интеграции' : 'Контакты'}
            </span>
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Несохраненные правки
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {statusMessage.text && (
              <span className={`text-xs font-mono flex items-center gap-1.5 ${statusMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {statusMessage.text}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#A88B74] text-[#FAF7F2] text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-[#967963] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Сохранение...' : 'Опубликовать (Cmd+S)'}
            </button>
          </div>
        </header>

        {/* Тело дашборда */}
        <div className="p-8 max-w-5xl w-full mx-auto space-y-8">

          {/* ========================================================== */}
          {/* ВКЛАДКА: SEO (ES или EN)                                    */}
          {/* ========================================================== */}
          {(activeTab === 'seo-es' || activeTab === 'seo-en') && (
            <div className="space-y-8">
              
              {/* 1. Google SERP Simulator */}
              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-xs uppercase font-mono tracking-wider text-[#A88B74] font-semibold">Google SERP Simulator</h3>
                    <p className="text-[11px] text-[#A89F91] mt-0.5">Предпросмотр сниппета в выдаче Google в Мадриде</p>
                  </div>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs">
                    <button
                      onClick={() => setSerpView('desktop')}
                      className={`px-3 py-1 rounded-lg transition-all ${serpView === 'desktop' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold' : 'text-[#A89F91]'}`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setSerpView('mobile')}
                      className={`px-3 py-1 rounded-lg transition-all ${serpView === 'mobile' ? 'bg-[#A88B74] text-[#FAF7F2] font-bold' : 'text-[#A89F91]'}`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl bg-white text-black font-sans ${serpView === 'mobile' ? 'max-w-sm border border-neutral-300' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px]">🌿</div>
                    <span className="text-xs text-[#202124] truncate">
                      sofiamassagemadrid.es {currentLang === 'en' ? '› en' : ''}
                    </span>
                  </div>
                  <div className="text-[#1a0dab] text-lg font-normal cursor-pointer leading-snug line-clamp-1 hover:underline">
                    {currentSeo.title || 'Укажите Meta Title'}
                  </div>
                  <div className="text-[#4d5156] text-xs mt-1 leading-relaxed line-clamp-2">
                    {currentSeo.description || 'Укажите Meta Description.'}
                  </div>
                </div>
              </div>

              {/* 2. Поля Meta-тегов */}
              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-6">
                <h3 className="text-xs uppercase font-mono tracking-wider text-[#EDE6DE] flex items-center justify-between">
                  <span>Основные мета-теги</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#A88B74] font-mono border border-white/[0.08]">
                    {currentLang.toUpperCase()}
                  </span>
                </h3>

                {/* Title */}
                <div>
                  <div className="flex justify-between items-baseline mb-2 text-xs">
                    <label className="text-[#EDE6DE] font-medium">Meta Title</label>
                    <span className={`font-mono text-[11px] ${
                      currentSeo.title?.length > 60 ? 'text-amber-400 font-bold' : currentSeo.title?.length < 35 ? 'text-neutral-500' : 'text-emerald-400'
                    }`}>
                      {currentSeo.title?.length || 0} / 60 знаков {currentSeo.title?.length > 60 && '⚠️ (Google обрежет)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentSeo.title || ''}
                    onChange={(e) => updateSeo(currentLang, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-sm focus:border-[#A88B74] focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-baseline mb-2 text-xs">
                    <label className="text-[#EDE6DE] font-medium">Meta Description</label>
                    <span className={`font-mono text-[11px] ${
                      currentSeo.description?.length > 160 ? 'text-amber-400 font-bold' : currentSeo.description?.length < 110 ? 'text-neutral-500' : 'text-emerald-400'
                    }`}>
                      {currentSeo.description?.length || 0} / 160 знаков
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentSeo.description || ''}
                    onChange={(e) => updateSeo(currentLang, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-sm focus:border-[#A88B74] focus:outline-none transition-colors leading-relaxed"
                  />
                </div>

                {/* Canonical & Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EDE6DE] mb-1.5">Canonical URL</label>
                    <input
                      type="text"
                      value={currentSeo.canonical || ''}
                      onChange={(e) => updateSeo(currentLang, 'canonical', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-[#A89F91] focus:border-[#A88B74] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#EDE6DE] mb-1.5">Ключевые слова (Keywords)</label>
                    <input
                      type="text"
                      value={currentSeo.keywords || ''}
                      onChange={(e) => updateSeo(currentLang, 'keywords', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#A89F91] focus:border-[#A88B74] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Директивы роботов */}
              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-4">
                <h3 className="text-xs uppercase font-mono tracking-wider text-[#EDE6DE]">Директивы индексации (Meta Robots)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'noIndex', label: 'noindex', desc: 'Запретить Google индексировать страницу' },
                    { key: 'noFollow', label: 'nofollow', desc: 'Запретить краулеру переходить по ссылкам' },
                    { key: 'noArchive', label: 'noarchive', desc: 'Не сохранять кэшированную копию' },
                    { key: 'noSnippet', label: 'nosnippet', desc: 'Не выводить текстовый сниппет в выдаче' },
                  ].map((directive) => (
                    <label key={directive.key} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0908] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
                      <div>
                        <div className="text-xs font-medium font-mono text-[#EDE6DE]">{directive.label}</div>
                        <div className="text-[10px] text-[#A89F91] mt-0.5">{directive.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={currentSeo.robots?.[directive.key] || false}
                        onChange={(e) => updateRobots(currentLang, directive.key, e.target.checked)}
                        className="w-4 h-4 accent-[#A88B74]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Open Graph & WhatsApp Simulator */}
              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-6">
                <h3 className="text-xs uppercase font-mono tracking-wider text-[#EDE6DE]">
                  Open Graph (Превью ссылки в WhatsApp / Соцсетях)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5">OG:Title</label>
                      <input
                        type="text"
                        value={currentSeo.og?.title || ''}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          setData({ ...data, seo: { ...data.seo, [currentLang]: { ...currentSeo, og: { ...currentSeo.og, title: e.target.value } } } });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">OG:Description</label>
                      <textarea
                        rows={2}
                        value={currentSeo.og?.description || ''}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          setData({ ...data, seo: { ...data.seo, [currentLang]: { ...currentSeo, og: { ...currentSeo.og, description: e.target.value } } } });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">OG:Image URL</label>
                      <input
                        type="text"
                        value={currentSeo.og?.image || ''}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          setData({ ...data, seo: { ...data.seo, [currentLang]: { ...currentSeo, og: { ...currentSeo.og, image: e.target.value } } } });
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-[#A89F91]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-mono text-[#A89F91] mb-2">Как ссылка выглядит в WhatsApp:</div>
                    <div className="rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0A0908] shadow-2xl max-w-sm">
                      <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${currentSeo.og?.image})` }} />
                      <div className="p-3.5 bg-[#171513]">
                        <div className="text-[10px] text-[#A88B74] uppercase font-mono tracking-wider">sofiamassagemadrid.es</div>
                        <div className="text-xs font-semibold text-[#EDE6DE] truncate mt-0.5">{currentSeo.og?.title}</div>
                        <div className="text-[11px] text-[#A89F91] line-clamp-2 mt-1 leading-snug">{currentSeo.og?.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Schema.org JSON-LD */}
              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-[#EDE6DE]">Микроразметка Schema.org (JSON-LD)</h3>
                  {jsonError ? (
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      Ошибка синтаксиса JSON!
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ✓ JSON валиден
                    </span>
                  )}
                </div>
                <textarea
                  rows={8}
                  value={currentSeo.schemaJson || ''}
                  onChange={(e) => updateSchema(currentLang, e.target.value)}
                  className="w-full p-4 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-emerald-400 leading-relaxed focus:border-[#A88B74] outline-none"
                />
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* ВКЛАДКА: УСЛУГИ И ЦЕНЫ (ПОЛНАЯ СИНХРОНИЗАЦИЯ 60/90 МИН)    */}
          {/* ========================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h2 className="text-base font-serif text-[#EDE6DE]">Прайс-лист и Ритуалы</h2>
                  <p className="text-xs text-[#A89F91] mt-0.5">Управление ценами (60 и 90 мин), описаниями и ссылками Fresha</p>
                </div>
                <button
                  onClick={handleAddService}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-[#EDE6DE] border border-white/[0.1] transition-all"
                >
                  <span>+ Добавить массаж</span>
                </button>
              </div>

              <div className="space-y-5">
                {(data.services || []).map((service: any, index: number) => (
                  <div key={service.id} className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-4 relative group">
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="absolute top-6 right-6 text-xs text-rose-400/60 hover:text-rose-400 transition-colors"
                      title="Удалить процедуру"
                    >
                      Удалить ✕
                    </button>

                    {/* Название, Тег и Цены 60/90 мин */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pr-16">
                      <div className="md:col-span-4">
                        <label className="block text-[10px] uppercase font-mono text-[#A88B74] mb-1 font-semibold">Название ритуала (ES)</label>
                        <input
                          type="text"
                          value={service.name || service.titleEs || ''}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const updated = [...data.services];
                            updated[index].name = e.target.value;
                            updated[index].titleEs = e.target.value;
                            setData({ ...data, services: updated });
                          }}
                          className="w-full px-3.5 py-2 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-serif text-lg text-[#EDE6DE]"
                        />
                      </div>
                      
                      <div className="md:col-span-4">
                        <label className="block text-[10px] uppercase font-mono text-[#A88B74] mb-1 font-semibold">Подзаголовок / Тег (напр. Mente & Calma)</label>
                        <input
                          type="text"
                          value={service.tag || ''}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const updated = [...data.services];
                            updated[index].tag = e.target.value;
                            setData({ ...data, services: updated });
                          }}
                          className="w-full px-3.5 py-2 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-mono text-[#D9CBBE] mb-1 font-bold">Цена 60 мин</label>
                        <input
                          type="text"
                          value={service.prices?.['60'] || '60€'}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const updated = [...data.services];
                            if (!updated[index].prices) updated[index].prices = {};
                            updated[index].prices['60'] = e.target.value;
                            setData({ ...data, services: updated });
                          }}
                          className="w-full px-3.5 py-2 bg-[#0A0908] border border-[#A88B74]/50 rounded-xl text-xs font-mono font-bold text-[#A88B74]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-mono text-[#D9CBBE] mb-1 font-bold">Цена 90 мин</label>
                        <input
                          type="text"
                          value={service.prices?.['90'] || '90€'}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const updated = [...data.services];
                            if (!updated[index].prices) updated[index].prices = {};
                            updated[index].prices['90'] = e.target.value;
                            setData({ ...data, services: updated });
                          }}
                          className="w-full px-3.5 py-2 bg-[#0A0908] border border-[#A88B74]/50 rounded-xl text-xs font-mono font-bold text-[#A88B74]"
                        />
                      </div>
                    </div>

                    {/* Описания на двух языках (ES / EN) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-[#A89F91] mb-1">Описание (Испанский ES)</label>
                        <textarea
                          rows={3}
                          value={service.descEs || service.desc || ''}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const updated = [...data.services];
                            updated[index].descEs = e.target.value;
                            updated[index].desc = e.target.value;
                            setData({ ...data, services: updated });
                          }}
                          className="w-full px-3.5 py-2 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE] leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-[#A89F91] mb-1">Описание (Английский EN)</label>
                        <textarea
                          rows={3}
                          value={service.descEn || ''}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const updated = [...data.services];
                            updated[index].descEn = e.target.value;
                            setData({ ...data, services: updated });
                          }}
                          className="w-full px-3.5 py-2 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE] leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Ссылка Fresha */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-[#A89F91] mb-1">Прямая ссылка бронирования Fresha</label>
                      <input
                        type="text"
                        value={service.freshaLink || ''}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          const updated = [...data.services];
                          updated[index].freshaLink = e.target.value;
                          setData({ ...data, services: updated });
                        }}
                        className="w-full px-3.5 py-2 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-[#A89F91]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* ВКЛАДКА: ТЕХНИЧЕСКИЕ ИНТЕГРАЦИИ & ROBOTS.TXT               */}
          {/* ========================================================== */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-4">
                <h3 className="text-xs uppercase font-mono tracking-wider text-[#EDE6DE]">Верификация поисковиков & Трекеры</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Google Search Console Tag</label>
                    <input
                      type="text"
                      placeholder="google-site-verification=XXXXX"
                      value={data.integrations?.gscVerification || ''}
                      onChange={(e) => {
                        setHasUnsavedChanges(true);
                        setData({ ...data, integrations: { ...data.integrations, gscVerification: e.target.value } });
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Google Tag Manager ID</label>
                    <input
                      type="text"
                      placeholder="GTM-XXXXXXX"
                      value={data.integrations?.gtmId || ''}
                      onChange={(e) => {
                        setHasUnsavedChanges(true);
                        setData({ ...data, integrations: { ...data.integrations, gtmId: e.target.value } });
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-[#EDE6DE]">Файл Robots.txt</h3>
                <textarea
                  rows={6}
                  value={data.integrations?.robotsTxt || ''}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setData({ ...data, integrations: { ...data.integrations, robotsTxt: e.target.value } });
                  }}
                  className="w-full p-4 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-amber-200/90 leading-relaxed outline-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* ВКЛАДКА: КОНТАКТЫ, ЛОКАЦИЯ И РАСПИСАНИЕ МАДРИД             */}
          {/* ========================================================== */}
          {activeTab === 'contacts' && (
            <div className="p-6 rounded-2xl bg-[#12110F] border border-white/[0.08] space-y-5">
              <h2 className="text-base font-serif text-[#EDE6DE]">Контактные данные и Локация (Мадрид)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A89F91] mb-1.5">WhatsApp студии (с кодом Испании 34...)</label>
                  <input
                    type="text"
                    value={data.contacts?.whatsapp || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setData({ ...data, contacts: { ...data.contacts, whatsapp: e.target.value } });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A89F91] mb-1.5">Телефон для звонков</label>
                  <input
                    type="text"
                    value={data.contacts?.phone || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setData({ ...data, contacts: { ...data.contacts, phone: e.target.value } });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A89F91] mb-1.5">Точный адрес студии (Barrio de Salamanca, Madrid)</label>
                <input
                  type="text"
                  value={data.contacts?.address || ''}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setData({ ...data, contacts: { ...data.contacts, address: e.target.value } });
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A89F91] mb-1.5">Часы работы студии</label>
                <input
                  type="text"
                  value={data.contacts?.hours || 'Lunes a Jueves: 11:00 – 20:00 | Viernes a Domingo: 12:00 – 20:00'}
                  onChange={(e) => {
                    setHasUnsavedChanges(true);
                    setData({ ...data, contacts: { ...data.contacts, hours: e.target.value } });
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs text-[#EDE6DE]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-[#A89F91] mb-1.5">Ссылка на профиль Instagram</label>
                  <input
                    type="text"
                    value={data.contacts?.instagram || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setData({ ...data, contacts: { ...data.contacts, instagram: e.target.value } });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-[#A89F91]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A89F91] mb-1.5">Ссылка на точку в Google Maps</label>
                  <input
                    type="text"
                    value={data.contacts?.googleMapsUrl || ''}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setData({ ...data, contacts: { ...data.contacts, googleMapsUrl: e.target.value } });
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-white/[0.1] rounded-xl text-xs font-mono text-[#A89F91]"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}