import { NextApiRequest, NextApiResponse } from 'next';
import { createToken } from '@/lib/jwt';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body;

    // Проверяем наличие пароля в запросе
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Проверяем пароль
    if (password !== process.env.APP_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Создаем JWT токен
    const token = createToken();

    // Устанавливаем токен в cookie
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      path: '/'
    });

    // Отправляем ответ с установленной cookie
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('Error in auth handler:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}