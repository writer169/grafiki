// Модель для хранения данных датчиков
export interface SensorData {
  sensor_id: string; // "Спальня", "Веранда", "Кухня", "Город"
  timestamp: Date; 
  value: number | null; // null если данных нет
  status: "online" | "offline"; // статус датчика
}

// Модель для хранения логов ошибок
export interface ErrorLog {
  timestamp: Date;
  source: string;
  message: string;
  details?: any;
}

// Интерфейс для запроса данных по API
export interface DataQueryParams {
  start?: Date | string;
  end?: Date | string;
  sensors?: string[];
}

// Интерфейс для ответа Tuya API
export interface TuyaResponse {
  success: boolean;
  result?: {
    result: TuyaDevice[];
  };
  message?: string;
}

export interface TuyaDevice {
  id: string;
  status?: {
    code: string;
    value: number;
  }[];
  is_online?: boolean;
  custom_name?: string;
}

// Интерфейс для ответа Narodmon API
export interface NarodmonResponse {
  sensors: {
    id: number;
    type: number;
    value: number;
    time: number;
  }[];
}