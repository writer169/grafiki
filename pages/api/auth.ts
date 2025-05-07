import { NextApiRequest, NextApiResponse } from 'next';
import { createToken } from '@/lib/jwt';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Логирование для отладки
  console.log('Получен запрос на авторизацию:', {
    method: req.method,
    body: req.body,
    headers: {
      cookie: req.headers.cookie,
      'content-type': req.headers['content-type']
    }
  });

  try {
    const { password } = req.body;

    // Проверяем наличие пароля в запросе
    if (!password) {
      console.log('Ошибка: пароль не указан');
      return res.status(400).json({ message: 'Password is required' });
    }

    // Проверяем пароль
    if (!process.env.APP_PASSWORD) {
      console.error('Ошибка: переменная окружения APP_PASSWORD не установлена');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    if (password !== process.env.APP_PASSWORD) {
      console.log('Ошибка: введен неверный пароль');
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Создаем JWT токен
    const token = createToken();

    // Устанавливаем токен в cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      path: '/'
    };

    const cookieString = serialize('token', token, cookieOptions);

    // Логирование успешной аутентификации
    console.log('Аутентификация успешна, устанавливаем куки:', cookieString);

    // Отправляем ответ с установленной cookie
    res.setHeader('Set-Cookie', cookieString);
    return res.status(200).json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('Error in auth handler:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}