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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto max-w-4xl">
      <h3 className="text-lg font-semibold p-6 bg-gray-50 border-b text-gray-800">
        Последние показания
      </h3>
      
      <div className="overflow-x-auto px-6 py-4">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Датчик
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Температура
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Время
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderedSensors.length > 0 ? (
              orderedSensors.map((sensor) => (
                <tr
                  key={sensor.sensor_id}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: sensorColors[sensor.sensor_id] }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">
                        {sensor.sensor_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {sensor.value !== null ? `${sensor.value.toFixed(1)}°C` : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {format(new Date(sensor.timestamp), 'HH:mm', { locale: ru })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
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