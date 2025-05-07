import { useState, useEffect } from 'react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { subHours } from 'date-fns';
import { useRouter } from 'next/router';
import { SensorData } from '@/models/SensorData';
import Layout from '@/components/Layout';
import TemperatureChart from '@/components/TemperatureChart';
import DateRangePicker from '@/components/DateRangePicker';
import SensorCheckboxes from '@/components/SensorCheckboxes';
import SensorsList from '@/components/SensorsList';

// Sensor colors in the requested order
const SENSOR_COLORS: Record<string, string> = {
  'Город': '#f59e0b',
  'Веранда': '#10b981',
  'Кухня': '#3b82f6',
  'Спальня': '#ef4444'
};

interface HomeProps {
  initialData: SensorData[];
  lastValues: SensorData[];
}

export default function Home({ initialData, lastValues }: HomeProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(subHours(new Date(), 24));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [sensorData, setSensorData] = useState<SensorData[]>(initialData);
  const [lastSensorValues, setLastSensorValues] = useState<SensorData[]>(lastValues);
  const [availableSensors, setAvailableSensors] = useState<string[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  useEffect(() => {
    loadLastValues();
  }, []);

  useEffect(() => {
    if (lastSensorValues.length > 0) {
      const sensors = ['Город', 'Веранда', 'Кухня', 'Спальня'].filter(sensor => 
        lastSensorValues.some(data => data.sensor_id === sensor)
      );
      setAvailableSensors(sensors);
      setSelectedSensors(sensors);
    }
  }, [lastSensorValues]);

  useEffect(() => {
    if (selectedSensors.length > 0 && startDate && endDate) {
      fetchData(startDate, endDate, selectedSensors);
    }
  }, [selectedSensors]);

  const loadLastValues = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/data');
      setLastSensorValues(response.data.lastValues);
      setIsAuthorized(true);
    } catch (error: any) {
      console.error('Ошибка при получении последних значений:', error);
      if (error.response?.status === 401) {
        setIsAuthorized(false);
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end && selectedSensors.length > 0) {
      fetchData(start, end, selectedSensors);
    }
  };

  const handleSensorChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
  };

  const fetchData = async (start: Date | null, end: Date | null, sensors: string[]) => {
    if (!start || !end || sensors.length === 0) {
      setSensorData([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('start', start.toISOString());
      params.append('end', end.toISOString());
      sensors.forEach(sensor => params.append('sensors', sensor));
      const response = await axios.get(`/api/data?${params.toString()}`);
      setSensorData(response.data.data);
      setIsAuthorized(true);
    } catch (error: any) {
      console.error('Ошибка при получении данных:', error);
      setSensorData([]);
      if (error.response?.status === 401) {
        setIsAuthorized(false);
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/data');
      setLastSensorValues(response.data.lastValues);
      setIsAuthorized(true);
      if (selectedSensors.length > 0 && startDate && endDate) {
        fetchData(startDate, endDate, selectedSensors);
      }
    } catch (error: any) {
      console.error('Ошибка при обновлении данных:', error);
      if (error.response?.status === 401) {
        setIsAuthorized(false);
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={handleRefresh}
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Обновление...
              </>
            ) : (
              'Обновить данные'
            )}
          </button>
        </div>

        {!isAuthorized ? (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg mb-6 animate-pulse">
            Для просмотра данных необходимо авторизоваться. Перенаправление на страницу входа...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                <SensorCheckboxes
                  sensors={availableSensors}
                  selectedSensors={selectedSensors}
                  onChange={handleSensorChange}
                  sensorColors={SENSOR_COLORS}
                />
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                <SensorsList
                  sensorData={lastSensorValues}
                  sensorColors={SENSOR_COLORS}
                />
              </div>
            </div>

            {/* Chart Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                <TemperatureChart
                  data={sensorData}
                  selectedSensors={selectedSensors}
                  sensorColors={SENSOR_COLORS}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    return {
      props: {
        initialData: [],
        lastValues: [],
      },
    };
  } catch (error) {
    console.error('Ошибка при получении начальных данных:', error);
    return {
      props: {
        initialData: [],
        lastValues: [],
      },
    };
  }
};