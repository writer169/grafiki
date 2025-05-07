import { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Мониторинг датчиков температуры' }: LayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Удаляем куки, устанавливая пустое значение и срок действия в прошлом
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Перенаправляем на страницу входа
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Система мониторинга датчиков температуры" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <header className="bg-blue-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">{title}</h1>
            {router.pathname !== '/login' && (
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
              >
                Выйти
              </button>
            )}
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-6">
          {children}
        </main>
        
        <footer className="bg-gray-100 py-4 border-t">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Мониторинг датчиков температуры
          </div>
        </footer>
      </div>
    </>
  );
}