import { MongoClient, Collection } from 'mongodb';
import { SensorData, ErrorLog } from '@/models/SensorData';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// В режиме разработки используем глобальную переменную, 
// чтобы кэшировать соединение между перезагрузками
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // В продакшне всегда создаем новый клиент
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Функция для получения коллекции данных датчиков
export async function getSensorDataCollection(): Promise<Collection<SensorData>> {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<SensorData>('sensor_data');
  
  // Проверяем наличие индексов, создаем если нет
  const indexExists = await collection.indexExists('timestamp_1_sensor_id_1');
  if (!indexExists) {
    await collection.createIndex({ timestamp: 1, sensor_id: 1 });
  }
  
  return collection;
}

// Функция для получения коллекции логов ошибок
export async function getErrorLogCollection(): Promise<Collection<ErrorLog>> {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<ErrorLog>('error_logs');
}

// Экспортируем клиент для возможности использования в других частях приложения
export default clientPromise;