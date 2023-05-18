import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jiayi Software API Docs',
  description: 'Jiayi Software API docs',
  openGraph: {
    title: 'Jiayi Software API Docs',
    description: 'API docs for Jiayi Software',
    url: 'https://api.jiayi.software/docs',
    type: 'website',
    images:
      'https://cdn.discordapp.com/icons/1076188174407176212/c42955c501c842e06248b294a81bd0ab.png',
  },
  themeColor: '#FF0000',
  twitter: {
    card: 'summary_large_image',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
