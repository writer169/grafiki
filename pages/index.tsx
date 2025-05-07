import { useState, useEffect } from 'react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { subHours, subDays } from 'date-fns';
import { SensorData } from '@/models/SensorData';
import Layout from '@/components/Layout';
import TemperatureChart from '@/components/TemperatureChart';
import DateRangePicker from '@/components/DateRangePicker';
import SensorCheckboxes from '@/components/SensorCheckboxes';
import SensorsList from '@/components/SensorsList';

// Цвета для датчиков
const SENSOR_COLORS: Record<string, string> = {
  'Спальня': '#e53935',
  'Веранда': '#43a047',
  'Кухня': '#1e88e5',
  'Город': '#f9a825'
};

interface HomeProps {
  initialData: SensorData[];
  lastValues: SensorData[];
}

export default function Home({ initialData, lastValues }: HomeProps) {
  const [startDate, setStartDate] = useState<Date | null>(subHours(new Date(), 24)); // Последние 24 часа по умолчанию
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [sensorData, setSensorData] = useState<SensorData[]>(initialData);
  const [lastSensorValues, setLastSensorValues] = useState<SensorData[]>(lastValues);
  const [availableSensors, setAvailableSensors] = useState<string[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Получаем уникальный список датчиков из данных
  useEffect(() => {
    if (lastSensorValues.length > 0) {
      const sensors = lastSensorValues.map(sensor => sensor.sensor_id);
      setAvailableSensors(sensors);
      setSelectedSensors(sensors); // По умолчанию выбираем все датчики
    }
  }, [lastSensorValues]);

  // Автоматическая загрузка данных при первом открытии страницы
  useEffect(() => {
    // Загружаем последние значения датчиков
    loadLastValues();
  }, []);

  // Эффект для загрузки данных графика после обновления списка выбранных датчиков
  useEffect(() => {
    if (selectedSensors.length > 0 && startDate && endDate) {
      fetchData(startDate, endDate, selectedSensors);
    }
  }, [selectedSensors]);

  // Функция для загрузки последних значений датчиков
  const loadLastValues = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/data');
      setLastSensorValues(response.data.lastValues);
    } catch (error) {
      console.error('Ошибка при получении последних значений датчиков:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения дат
  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end && selectedSensors.length > 0) {
      fetchData(start, end, selectedSensors);
    }
  };

  // Обработчик изменения выбранных датчиков
  const handleSensorChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
  };

  // Получение данных с сервера
  const fetchData = async (start: Date | null, end: Date | null, sensors: string[]) => {
    if (!start || !end || sensors.length === 0) {
      setSensorData([]);
      return;
    }

    setIsLoading(true);

    try {
      // Подготавливаем параметры запроса
      const params = new URLSearchParams();
      params.append('start', start.toISOString());
      params.append('end', end.toISOString());
      sensors.forEach(sensor => params.append('sensors', sensor));

      // Выполняем запрос
      const response = await axios.get(`/api/data?${params.toString()}`);
      setSensorData(response.data.data);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setSensorData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик кнопки обновления данных
  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Получаем последние значения датчиков
      const response = await axios.get('/api/data');
      setLastSensorValues(response.data.lastValues);
      
      // Если есть выбранные датчики, обновляем данные графика
      if (selectedSensors.length > 0 && startDate && endDate) {
        fetchData(startDate, endDate, selectedSensors);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.5 5.291A8 8 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.5-2.647z"></path>
              </svg>
              Обновление...
            </>
          ) : (
            'Обновить данные'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Выбор датчиков */}
            <SensorCheckboxes
              sensors={availableSensors}
              selectedSensors={selectedSensors}
              onChange={handleSensorChange}
              sensorColors={SENSOR_COLORS}
            />
            
            {/* Выбор периода времени */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
          </div>
          
          {/* Последние показания */}
          <div className="mt-6">
            <SensorsList
              sensorData={lastSensorValues}
              sensorColors={SENSOR_COLORS}
            />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {/* График */}
          <TemperatureChart
            data={sensorData}
            selectedSensors={selectedSensors}
            sensorColors={SENSOR_COLORS}
          />
        </div>
      </div>
    </Layout>
  );
}