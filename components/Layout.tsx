import { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Мониторинг датчиков температуры' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Система мониторинга датчиков температуры" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-center items-center">
            {/* Удаляем заголовок из шапки как требовалось */}
          </div>
        </header>
        
        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="bg-gray-100 py-3 border-t">
          <div className="container mx-auto px-4 text-center text-gray-400 text-xs">
            writer169 &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </>
  );
}