import { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Логирование входящего запроса на проверку авторизации
    console.log('Проверка авторизации:', {
      headers: {
        cookie: req.headers.cookie
      }
    });

    // Проверяем токен
    const authenticated = await isAuthenticated(req);
    
    if (authenticated) {
      console.log('Проверка аутентификации: пользователь авторизован');
      return res.status(200).json({ authenticated: true });
    } else {
      console.log('Проверка аутентификации: пользователь не авторизован');
      return res.status(401).json({ authenticated: false });
    }
  } catch (error) {
    console.error('Error in verify-auth handler:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}