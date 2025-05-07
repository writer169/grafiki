// lib/mongodb.ts

import { MongoClient, Collection, Db } from 'mongodb';
import { SensorData, ErrorLog } from '@/models/SensorData'; // Убедитесь, что путь к моделям корректен

// Проверка наличия URI для MongoDB в переменных окружения
if (!process.env.MONGODB_URI) {
  throw new Error('Пожалуйста, определите переменную окружения MONGODB_URI');
}

const uri: string = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Для базы данных, ее имя должно быть в MONGODB_URI (например, mongodb://localhost:27017/myAppDatabase)
// Если имя БД не указано в URI, MongoDB будет использовать БД 'test' по умолчанию в некоторых случаях,
// или драйвер может потребовать явного указания.
// Для большей ясности можно также извлекать имя БД из отдельной переменной окружения, если URI его не содержит.
const dbName = process.env.MONGODB_DB_NAME; // Например, 'myAppDatabase'

// В режиме разработки используем глобальную переменную для кэширования соединения
// Это предотвращает создание множества соединений при горячей перезагрузке Next.js
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore global._mongoClientPromise может быть не определен глобально с точки зрения TypeScript
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // В производственном режиме лучше создавать новое соединение при каждом инстанцировании модуля,
  // или управлять пулом соединений более сложным образом, если это необходимо.
  // Для serverless функций, обычно создают соединение один раз при "холодном старте" функции.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Функция для получения подключения к базе данных
async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  // Если dbName определен в .env, используем его, иначе драйвер использует БД из URI
  // или БД по умолчанию (часто 'test', если в URI нет).
  // Поскольку ошибка была 'test.sensor_data', скорее всего, 'test' является целевой БД.
  return connectedClient.db(dbName); // Если dbName не задан, он возьмет из URI или 'test'
}

// Функция для получения коллекции данных датчиков
export async function getSensorDataCollection(): Promise<Collection<SensorData>> {
  const db = await getDb();
  const collection = db.collection<SensorData>('sensor_data');

  // Пытаемся создать индекс.
  // MongoDB создаст коллекцию 'sensor_data', если она еще не существует, при создании индекса.
  // Если индекс уже существует с такой же конфигурацией, команда не вызовет ошибки.
  try {
    // Индекс для ускорения запросов по временному диапазону и конкретному датчику
    await collection.createIndex({ timestamp: 1, sensor_id: 1 }, { name: 'timestamp_sensor_id_idx' });
    // Можно добавить и другие индексы, если необходимо, например, только по timestamp:
    // await collection.createIndex({ timestamp: -1 }, { name: 'timestamp_desc_idx' });
    console.log("Индекс для 'sensor_data' успешно проверен/создан.");
  } catch (error) {
    console.error("Ошибка при создании индекса для 'sensor_data':", error);
    // В зависимости от критичности индекса, можно решить, следует ли выбрасывать ошибку дальше.
    // Обычно, приложение может работать и без индекса, но с меньшей производительностью запросов.
  }

  return collection;
}

// Функция для получения коллекции логов ошибок
export async function getErrorLogCollection(): Promise<Collection<ErrorLog>> {
  const db = await getDb();
  const collection = db.collection<ErrorLog>('error_logs');

  // Рекомендуется создавать индекс для коллекции логов, например, по временной метке,
  // для быстрого поиска и сортировки свежих ошибок.
  try {
    await collection.createIndex({ timestamp: -1 }, { name: 'timestamp_desc_error_idx' }); // Индекс для сортировки по убыванию timestamp
    console.log("Индекс для 'error_logs' успешно проверен/создан.");
  } catch (error) {
    console.error("Ошибка при создании индекса для 'error_logs':", error);
  }

  return collection;
}

// Экспортируем промис клиента MongoClient.
// Это может быть полезно, если вам нужен прямой доступ к клиенту для более сложных операций,
// таких как транзакции или работа с несколькими базами данных.
export default clientPromise;
