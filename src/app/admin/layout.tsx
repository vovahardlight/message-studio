import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elena Gómez • Studio Management Cockpit',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0A0908] text-[#EDE6DE] antialiased selection:bg-[#E59843] selection:text-[#0A0908]">
        {children}
      </body>
    </html>
  );
}