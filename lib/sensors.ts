import axios from 'axios';
import { TuyaResponse, NarodmonResponse, SensorData } from '@/models/SensorData';

// Карта соответствия ID датчиков и их человекочитаемых имен
const sensorNames: Record<string, string> = {};

// Инициализация карты имен датчиков из переменных окружения
export function initSensorNames() {
  if (!process.env.SENSOR_NAMES) {
    throw new Error('SENSOR_NAMES environment variable is not defined');
  }

  const namesList = process.env.SENSOR_NAMES.split(',');
  namesList.forEach(item => {
    const [id, name] = item.split(':');
    if (id && name) {
      sensorNames[id] = name;
    }
  });
}

// Получение данных с датчиков Tuya
export async function fetchTuyaData(): Promise<SensorData[]> {
  if (!process.env.TUYA_API_KEY || !process.env.TUYA_DEVICE_IDS) {
    throw new Error('Tuya API key or device IDs are not defined');
  }

  const deviceIds = process.env.TUYA_DEVICE_IDS;
  const apiKey = process.env.TUYA_API_KEY;

  try {
    // Сначала получаем статус онлайн/оффлайн устройств
    const onlineStatusUrl = `https://secure-apitask.vercel.app/api/tuya?action=request&path=/v2.0/cloud/thing/batch?device_ids=${deviceIds}&method=GET`;
    const onlineStatusResponse = await axios.get<TuyaResponse>(onlineStatusUrl, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    if (!onlineStatusResponse.data.success || !onlineStatusResponse.data.result?.result) {
      throw new Error('Failed to fetch Tuya devices online status');
    }

    const onlineStatusMap = new Map<string, boolean>();
    onlineStatusResponse.data.result.result.forEach(device => {
      if (device.id) {
        onlineStatusMap.set(device.id, device.is_online || false);
      }
    });

    // Теперь получаем значения датчиков
    const dataUrl = `https://secure-apitask.vercel.app/api/tuya?action=request&path=/v1.0/iot-03/devices/status?device_ids=${deviceIds}&method=GET`;
    const dataResponse = await axios.get<TuyaResponse>(dataUrl, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    if (!dataResponse.data.success || !dataResponse.data.result?.result) {
      throw new Error('Failed to fetch Tuya devices data');
    }

    const result: SensorData[] = [];
    const now = new Date();

    dataResponse.data.result.result.forEach(device => {
      if (!device.status) return;

      const isOnline = onlineStatusMap.get(device.id) || false;
      const temperatureStatus = device.status.find(s => s.code === 'va_temperature');

      const sensorId = sensorNames[device.id] || device.id;

      result.push({
        sensor_id: sensorId,
        timestamp: now,
        value: temperatureStatus ? temperatureStatus.value / 10 : null,
        status: isOnline ? 'online' : 'offline'
      });
    });

    return result;
  } catch (error) {
    console.error('Error fetching Tuya data:', error);
    throw error;
  }
}

// Получение данных с датчика Narodmon
export async function fetchNarodmonData(): Promise<SensorData> {
  if (!process.env.NARODMON_KEY || !process.env.UUID_NARODMON) {
    throw new Error('Narodmon API key or UUID are not defined');
  }

  const apiKey = process.env.NARODMON_KEY;
  const uuid = process.env.UUID_NARODMON;
  const sensorId = '37687';

  try {
    const url = `https://api.narodmon.ru?cmd=sensorsValues&sensors=${sensorId}&uuid=${uuid}&api_key=${apiKey}`;
    const response = await axios.get<NarodmonResponse>(url);

    // Логируем весь ответ, чтобы понять его структуру
    console.log('Narodmon response:', response.data);

    // Проверка на корректную структуру
    if (!response.data?.sensors || !Array.isArray(response.data.sensors) || response.data.sensors.length === 0) {
      throw new Error('No valid sensors data received from Narodmon');
    }

    const sensor = response.data.sensors[0];
    const sensorName = sensorNames[sensorId] || 'Город';

    return {
      sensor_id: sensorName,
      timestamp: new Date(sensor.time * 1000),
      value: sensor.value,
      status: 'online'
    };
  } catch (error) {
    console.error('Ошибка при запросе к Narodmon:', error);

    return {
      sensor_id: sensorNames[sensorId] || 'Город',
      timestamp: new Date(),
      value: null,
      status: 'offline'
    };
  }
}