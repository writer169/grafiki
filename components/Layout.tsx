import { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Мониторинг датчиков температуры' }: LayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
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
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-medium">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold">Мониторинг датчиков</h1>
            </div>
            
            {/* Кнопка выхода - показываем только если не на странице логина */}
            {router.pathname !== '/login' && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white bg-opacity-10 hover:bg-opacity-20 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Выход</span>
              </button>
            )}
          </div>
        </header>
        
        <main className="flex-grow animate-fade-in">
          {children}
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span>writer169</span>
              <span>&copy;</span>
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}