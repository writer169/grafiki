import { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '@/lib/jwt';
import { getSensorDataCollection } from '@/lib/mongodb';
import { DataQueryParams } from '@/models/SensorData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем метод запроса
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Проверяем аутентификацию
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Получаем параметры запроса
    const { start, end, sensors } = req.query as unknown as DataQueryParams;
    
    // Формируем условия запроса
    const query: any = {};
    
    if (start || end) {
      query.timestamp = {};
      if (start) {
        query.timestamp.$gte = new Date(start);
      }
      if (end) {
        query.timestamp.$lte = new Date(end);
      }
    }
    
    if (sensors && Array.isArray(sensors) && sensors.length > 0) {
      query.sensor_id = { $in: sensors };
    }

    // Получаем коллекцию данных датчиков
    const collection = await getSensorDataCollection();
    
    // Выполняем запрос и сортируем по времени
    const data = await collection
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();
    
    // Если запрашиваются последние значения (нет параметров времени)
    if (!start && !end) {
      // Получаем последнее значение для каждого датчика
      const lastValues = await collection
        .aggregate([
          { $sort: { timestamp: -1 } },
          { $group: { _id: "$sensor_id", doc: { $first: "$$ROOT" } } },
          { $replaceRoot: { newRoot: "$doc" } }
        ])
        .toArray();
      
      return res.status(200).json({
        data,
        lastValues
      });
    }
    
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error in data handler:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}