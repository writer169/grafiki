import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SensorData } from '@/models/SensorData';

interface SensorsListProps {
  sensorData: SensorData[];
  sensorColors: Record<string, string>;
}

export default function SensorsList({ sensorData, sensorColors }: SensorsListProps) {
  // Задаём порядок датчиков
  const orderedSensors = ['Город', 'Веранда', 'Кухня', 'Спальня']
    .filter(s => sensorData.some(data => data.sensor_id === s))
    .map(sensorId => sensorData.find(data => data.sensor_id === sensorId)!)
    .filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden mx-auto max-w-4xl">
      <h3 className="text-xl font-bold p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b text-gray-900">
        Последние показания
      </h3>
      
      <div className="overflow-x-auto px-6 py-6">
        <table className="min-w-full divide-y divide-gray-300 table-auto">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th
                scope="col"
                className="px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-wide shadow-sm"
              >
                Датчик
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-wide shadow-sm"
              >
                Температура
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-wide shadow-sm"
              >
                Статус
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-wide shadow-sm"
              >
                Время
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderedSensors.length > 0 ? (
              orderedSensors.map((sensor, index) => (
                <tr
                  key={sensor.sensor_id}
                  className="hover:bg-gray-50 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-center group">
                    <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <div
                        className="w-3 h-3 rounded-full mr-2 group-hover:shadow-md"
                        style={{ backgroundColor: sensorColors[sensor.sensor_id] }}
                      ></div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: sensorColors[sensor.sensor_id] }}
                      >
                        {sensor.sensor_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center group">
                    <div className="text-base font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                      {sensor.value !== null ? `${sensor.value.toFixed(1)}°C` : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center group">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full group-hover:shadow-sm transition-all duration-200 ${
                        sensor.status === 'online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      style={{
                        backgroundColor: sensor.status === 'online' ? '#10b98133' : '#ef444433',
                        color: sensor.status === 'online' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {sensor.status === 'online' ? 'On' : 'Off'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center group">
                    <div className="text-sm italic text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                      {format(new Date(sensor.timestamp), 'HH:mm', { locale: ru })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm font-medium text-gray-500 animate-pulse">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}