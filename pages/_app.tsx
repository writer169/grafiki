import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AppProps } from 'next/app';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const publicPaths = ['/login'];

  useEffect(() => {
    // Проверяем аутентификацию при загрузке и при смене маршрута
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Проверка через API вместо простой проверки куки
        const response = await axios.get('/api/verify-auth', { 
          withCredentials: true 
        });
        
        const isAuthed = response.status === 200;
        setIsAuthenticated(isAuthed);
        
        // Обработка редиректов на основе аутентификации
        if (!isAuthed && !publicPaths.includes(router.pathname)) {
          // Не аутентифицирован и пытается зайти на защищенную страницу
          router.push('/login');
        } else if (isAuthed && publicPaths.includes(router.pathname)) {
          // Аутентифицирован и пытается зайти на страницу входа
          router.push('/');
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        setIsAuthenticated(false);
        
        // Если ошибка аутентификации, перенаправляем на логин
        if (!publicPaths.includes(router.pathname)) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router.pathname]);

  // Если проверка аутентификации еще не завершена, показываем индикатор загрузки
  if (isLoading) {
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