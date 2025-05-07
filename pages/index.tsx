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

  const handleLogout = async () => {
    try {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {!isAuthorized ? (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg mb-6 animate-pulse">
            Для просмотра данных необходимо авторизоваться. Перенаправление на страницу входа...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Temperature Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <TemperatureChart
                data={sensorData}
                selectedSensors={selectedSensors}
                sensorColors={SENSOR_COLORS}
              />
              
              {/* Date Range Picker */}
              <div className="mt-6">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            
            {/* Sensor Checkboxes */}
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-wrap justify-center gap-6">
                {availableSensors.map((sensor) => (
                  <div key={sensor} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`sensor-${sensor}`}
                      checked={selectedSensors.includes(sensor)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSensors([...selectedSensors, sensor]);
                        } else {
                          setSelectedSensors(selectedSensors.filter(s => s !== sensor));
                        }
                      }}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`sensor-${sensor}`}
                      className="ml-2 text-base font-medium"
                      style={{ color: SENSOR_COLORS[sensor] }}
                    >
                      {sensor}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sensors Data Table */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 table-auto">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide">
                        Датчик
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide">
                        Температура
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide">
                        Статус
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide">
                        Время
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lastSensorValues.length > 0 ? (
                      lastSensorValues
                        .filter(sensor => ['Город', 'Веранда', 'Кухня', 'Спальня'].includes(sensor.sensor_id))
                        .sort((a, b) => {
                          const order = ['Город', 'Веранда', 'Кухня', 'Спальня'];
                          return order.indexOf(a.sensor_id) - order.indexOf(b.sensor_id);
                        })
                        .map((sensor, index) => (
                          <tr
                            key={sensor.sensor_id}
                            className="hover:bg-gray-50 transition-all duration-200 animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: SENSOR_COLORS[sensor.sensor_id] }}
                                ></div>
                                <div
                                  className="text-sm font-medium"
                                  style={{ color: SENSOR_COLORS[sensor.sensor_id] }}
                                >
                                  {sensor.sensor_id}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {sensor.value !== null ? `${sensor.value.toFixed(1)}°C` : '—'}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                              <span
                                className={`px-4 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  sensor.status === 'online'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {sensor.status === 'online' ? 'On' : 'Off'}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                              <div className="text-sm italic text-gray-500">
                                {new Date(sensor.timestamp).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm font-medium text-gray-500 animate-pulse">
                          Нет данных
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRefresh}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
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
              
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300"
              >
                Выйти
              </button>
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