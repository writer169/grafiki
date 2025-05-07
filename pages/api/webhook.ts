import { NextApiRequest, NextApiResponse } from 'next';
import { getSensorDataCollection, getErrorLogCollection } from '@/lib/mongodb';
import { fetchTuyaData, fetchNarodmonData, initSensorNames } from '@/lib/sensors';
import { SensorData } from '@/models/SensorData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Проверяем API ключ
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.WEBHOOK_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Инициализируем имена датчиков
    initSensorNames();
    
    // Получаем коллекции для данных и логов
    const sensorDataCollection = await getSensorDataCollection();
    const errorLogCollection = await getErrorLogCollection();
    
    // Массив для всех данных датчиков
    const allSensorData: SensorData[] = [];
    
    // Получаем данные с датчиков Tuya
    try {
      const tuyaData = await fetchTuyaData();
      allSensorData.push(...tuyaData);
    } catch (error: any) {
      // Логируем ошибку
      await errorLogCollection.insertOne({
        timestamp: new Date(),
        source: 'Tuya API',
        message: error.message || 'Unknown error',
        details: error
      });
    }
    
    // Получаем данные с датчика Narodmon
    try {
      const narodmonData = await fetchNarodmonData();
      allSensorData.push(narodmonData);
    } catch (error: any) {
      // Логируем ошибку
      await errorLogCollection.insertOne({
        timestamp: new Date(),
        source: 'Narodmon API',
        message: error.message || 'Unknown error',
        details: error
      });
    }
    
    // Если есть данные, сохраняем их в БД
    if (allSensorData.length > 0) {
      await sensorDataCollection.insertMany(allSensorData);
    }
    
    // Возвращаем успешный ответ
    return res.status(200).json({ 
      message: 'Data processed successfully', 
      sensors_count: allSensorData.length 
    });
    
  } catch (error: any) {
    console.error('Error in webhook handler:', error);
    
    // Пытаемся залогировать общую ошибку
    try {
      const errorLogCollection = await getErrorLogCollection();
      await errorLogCollection.insertOne({
        timestamp: new Date(),
        source: 'Webhook Handler',
        message: error.message || 'Unknown error',
        details: error
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}