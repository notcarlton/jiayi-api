import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Jiayi Software',
  description: 'Jiayi api routes',
  'og:title': 'Jiayi Software',
  'og:type': 'website',
  'og:url': 'https://jiayi-api.vercel.app/',
  'og:image':
    'https://cdn.discordapp.com/icons/1076188174407176212/c42955c501c842e06248b294a81bd0ab.png',
  'og:description': "API routes for Jiayi's software",
  'theme-color': '#FF0000',
  'twitter:card': 'summary_large_image',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
