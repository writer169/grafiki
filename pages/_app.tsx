import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AppProps } from 'next/app';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const publicPaths = ['/login'];

  useEffect(() => {
    // Проверяем аутентификацию при загрузке приложения
    const checkAuth = async () => {
      try {
        // Простая проверка куки на клиенте
        const hasToken = document.cookie.includes('token=');
        setIsAuthenticated(hasToken);
        
        // Если не аутентифицирован и пытается зайти на защищенную страницу
        if (!hasToken && !publicPaths.includes(router.pathname)) {
          router.push('/login');
        }
        // Если аутентифицирован и пытается зайти на страницу входа
        else if (hasToken && publicPaths.includes(router.pathname)) {
          router.push('/');
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [router.pathname]);

  // Если проверка аутентификации еще не завершена, показываем индикатор загрузки
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp;