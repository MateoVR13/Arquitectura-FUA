import './globals.css';
import { Inter } from 'next/font/google';
import ArchitectureBackground from '@/components/ArchitectureBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ArquiLab | Laboratorio Interactivo',
  description: 'Un laboratorio experimental bajo el enfoque Aprender haciendo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ArchitectureBackground />
        {children}
      </body>
    </html>
  );
}
