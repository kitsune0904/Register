import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ระบบรับสมัครเรียนออนไลน์ (โควตา ๒๕๗๐) | วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
  description: 'ระบบรับสมัครนักเรียน นักศึกษาใหม่ รอบโควตาพิเศษ ประจำปีการศึกษา ๒๕๗๐ วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ สอศ.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-crimson-600 selection:text-white">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
