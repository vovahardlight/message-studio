import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import '@/styles/globals.css';

// 1. ДИНАМИЧЕСКАЯ ГЕНЕРАЦИЯ МЕТА-ТЕГОВ ДЛЯ GOOGLE ИЗ НАШЕЙ CMS
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';

  let seoData: any = null;
  try {
    const filePath = path.join(process.cwd(), 'src/data/content.json');
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(file);
      seoData = isEs ? parsed?.seo?.es : parsed?.seo?.en;
    }
  } catch (e) {
    console.error('Error loading SEO metadata:', e);
  }

  const defaultTitle = isEs
    ? 'Elena Gómez | Masajes Exclusivos y Terapia Corporal en Alicante'
    : 'Elena Gómez | Private Candlelit Massage Studio in Alicante';

  const defaultDesc = isEs
    ? 'Santuario privado de masajes a la luz de las velas en Alicante. Terapias relajantes y descontracturantes.'
    : 'Escape city noise. Private massage sanctuary in central Alicante under warm candlelight.';

  const title = seoData?.title || defaultTitle;
  const description = seoData?.description || defaultDesc;
  const canonical = seoData?.canonical || (isEs ? 'https://tudominio.es' : 'https://tudominio.es/en');

  return {
    title,
    description,
    keywords: seoData?.keywords,
    alternates: {
      canonical,
      languages: {
        es: 'https://tudominio.es',
        en: 'https://tudominio.es/en',
        'x-default': 'https://tudominio.es',
      },
    },
    robots: {
      index: !seoData?.robots?.noIndex,
      follow: !seoData?.robots?.noFollow,
      noarchive: seoData?.robots?.noArchive,
      nosnippet: seoData?.robots?.noSnippet,
    },
    openGraph: {
      title: seoData?.og?.title || title,
      description: seoData?.og?.description || description,
      url: canonical,
      siteName: 'Elena Gómez Masajes',
      images: [
        {
          url: seoData?.og?.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
        },
      ],
      locale: isEs ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

// 2. ГЛАВНЫЙ ЭКСПОРТ МАКЕТА ПО УМОЛЧАНИЮ (DEFAULT EXPORT)
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale === 'es';

  // Читаем Schema.org JSON-LD и верификацию Google из CMS
  let schemaJson = '';
  let gscTag = '';
  try {
    const filePath = path.join(process.cwd(), 'src/data/content.json');
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(file);
      const langSeo = isEs ? parsed?.seo?.es : parsed?.seo?.en;
      schemaJson = langSeo?.schemaJson || '';
      gscTag = parsed?.integrations?.gscVerification || '';
    }
  } catch (e) {
    console.error('Error loading Schema/Integrations:', e);
  }

  return (
    <html lang={locale} className="dark">
      <head>
        {/* Тег подтверждения Google Search Console из админки */}
        {gscTag && <meta name="google-site-verification" content={gscTag} />}

        {/* Структурированные данные Schema.org из админки */}
        {schemaJson && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schemaJson }}
          />
        )}
      </head>
      <body className="bg-[#121110] text-[#EDE6DE] antialiased selection:bg-[#E59843] selection:text-[#121110]">
        {children}
      </body>
    </html>
  );
}