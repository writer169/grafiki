import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import cookie from 'cookie';

// Интерфейс для JWT payload
export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

// Функция для создания JWT токена
export function createToken(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload = {
    sub: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 дней
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
}

// Функция для проверки JWT токена
export function verifyToken(token: string): JwtPayload | null {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Функция для получения токена из cookies запроса
export function getTokenFromRequest(req: NextApiRequest): string | null {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies.token || null;
}

// Middleware для проверки аутентификации
export async function isAuthenticated(req: NextApiRequest): Promise<boolean> {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  
  const payload = verifyToken(token);
  return payload !== null;
}