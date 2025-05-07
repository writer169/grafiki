import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SensorData } from '@/models/SensorData';

interface SensorsListProps {
  sensorData: SensorData[];
  sensorColors: Record<string, string>;
}

export default function SensorsList({ sensorData, sensorColors }: SensorsListProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h3 className="text-lg font-medium p-4 bg-gray-50 border-b">Последние показания</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Датчик
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Последнее значение
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Время обновления
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sensorData.length > 0 ? (
              sensorData.map((sensor) => (
                <tr key={sensor.sensor_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: sensorColors[sensor.sensor_id] }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">{sensor.sensor_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sensor.value !== null ? `${sensor.value}°C` : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sensor.status === 'online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sensor.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(sensor.timestamp), 'dd.MM.yyyy HH:mm', { locale: ru })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
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