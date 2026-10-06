import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'content.json');

const defaultData = {
  seo: {
    es: {
      title: "Elena Gómez | Masajes Exclusivos y Terapia Corporal en Alicante",
      description: "Santuario privado de masajes a la luz de las velas en el centro de Alicante. Terapias descontracturantes, relajantes y aromaterapia natural sin prisas.",
      keywords: "masajes alicante, quiromasaje alicante, masaje relajante, masaje descontracturante",
      canonical: "https://tudominio.es",
      robots: {
        noIndex: false,
        noFollow: false,
        noArchive: false,
        noSnippet: false,
      },
      og: {
        title: "Elena Gómez Masajes | Santuario Privado en Alicante",
        description: "Rituales de bienestar manual y calma profunda a la luz de las velas. Reserva tu cita previa online.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        type: "website",
      },
      schemaJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HealthAndBeautyBusiness",
        "name": "Elena Gómez Masajes",
        "description": "Estudio privado de masajes y terapias manuales en Alicante",
        "priceRange": "€€",
        "telephone": "+34600000000",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Calle Mayor, 12, 1º Izquierda",
          "addressLocality": "Alicante",
          "postalCode": "03002",
          "addressCountry": "ES"
        }
      }, null, 2),
    },
    en: {
      title: "Elena Gómez | Private Candlelit Massage Studio in Alicante",
      description: "Escape city noise. Private massage sanctuary in central Alicante. Deep tissue release, aromatherapy, and restorative bodywork under warm candlelight.",
      keywords: "massage alicante, deep tissue alicante, private massage studio, relaxing massage spain",
      canonical: "https://tudominio.es/en",
      robots: {
        noIndex: false,
        noFollow: false,
        noArchive: false,
        noSnippet: false,
      },
      og: {
        title: "Elena Gómez Massage | Private Sanctuary in Alicante",
        description: "Restorative manual bodywork rituals under ambient candlelight. Book directly online.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        type: "website",
      },
      schemaJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HealthAndBeautyBusiness",
        "name": "Elena Gómez Massage Studio",
        "description": "Private massage and wellness therapy sanctuary in Alicante",
        "priceRange": "€€",
        "telephone": "+34600000000",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Calle Mayor, 12, 1st Floor",
          "addressLocality": "Alicante",
          "postalCode": "03002",
          "addressCountry": "ES"
        }
      }, null, 2),
    },
  },
  integrations: {
    gscVerification: "",
    gtmId: "",
    ga4Id: "",
    metaPixelId: "",
    customHeadCode: "",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://tudominio.es/sitemap.xml",
  },
  contacts: {
    phone: "+34 600 000 000",
    whatsapp: "34600000000",
    address: "Calle Mayor, 12, 1º Izquierda, 03002 Alicante",
    hours: "Lunes a Sábado: 10:00 – 20:00",
  },
  services: [
    {
      id: 1,
      titleEs: "Ritual Relajante con Aromaterapia",
      titleEn: "Relaxing Aromatherapy Ritual",
      duration: "60 / 90 min",
      price: "65€ / 90€",
      descEs: "Pases envolventes y lentos con aceites botánicos templados bajo suave luz de velas.",
      descEn: "Slow enveloping strokes using warmed organic botanicals under ambient candlelight.",
      freshaLink: "https://www.fresha.com/book-now/vuestra-url",
    },
    {
      id: 2,
      titleEs: "Terapia Descontracturante Profunda",
      titleEn: "Deep Tissue & Tension Release",
      duration: "60 / 90 min",
      price: "70€ / 95€",
      descEs: "Trabajo focalizado en contracturas crónicas de espalda, escápulas y cuello.",
      descEn: "Focused therapeutic pressure relieving back, scapular, and neck pain.",
      freshaLink: "https://www.fresha.com/book-now/vuestra-url",
    },
  ],
};

function getOrInitData() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const content = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(content);
    // Мерджим со структурой по умолчанию, чтобы старые файлы не крашились
    return { ...defaultData, ...parsed, seo: { ...defaultData.seo, ...(parsed.seo || {}) } };
  } catch (e) {
    return defaultData;
  }
}

export async function GET() {
  return NextResponse.json(getOrInitData());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}