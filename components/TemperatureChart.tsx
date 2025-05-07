import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SensorData } from '@/models/SensorData';

// Динамический импорт без рендеринга на сервере
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TemperatureChartProps {
  data: SensorData[];
  selectedSensors: string[];
  sensorColors: Record<string, string>;
}

export default function TemperatureChart({ data, selectedSensors, sensorColors }: TemperatureChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Группируем данные по датчикам
      const groupedData: Record<string, SensorData[]> = {};
      
      data.forEach((item) => {
        if (!groupedData[item.sensor_id]) {
          groupedData[item.sensor_id] = [];
        }
        groupedData[item.sensor_id].push(item);
      });
      
      // Создаем данные для графика для каждого датчика
      const plotData = selectedSensors
        .filter(sensor => groupedData[sensor])
        .map((sensor) => {
          // Сортируем данные по времени
          const sensorData = groupedData[sensor].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          // Создаем массивы для x (время) и y (значение)
          const x: Date[] = [];
          const y: (number | null)[] = [];
          
          sensorData.forEach((item) => {
            x.push(new Date(item.timestamp));
            y.push(item.value);
          });
          
          return {
            type: 'scatter',
            mode: 'lines+markers',
            name: sensor,
            x,
            y,
            line: { color: sensorColors[sensor], width: 2 },
            marker: { color: sensorColors[sensor], size: 5 },
            connectgaps: false // Не соединять точки с null значениями
          };
        });
      
      setChartData(plotData);
    } catch (error) {
      console.error('Error preparing chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, selectedSensors, sensorColors]);

  const layout = {
    // Меняем строковое значение на объект с полем text
    title: {
      text: 'График температуры'
    },
    autosize: true,
    height: 500,
    margin: { l: 50, r: 50, b: 50, t: 80, pad: 4 },
    xaxis: {
      title: 'Время',
      tickformat: '%d.%m.%Y %H:%M',
      tickangle: -45
    },
    yaxis: {
      title: 'Температура (°C)'
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.2
    },
    hovermode: 'closest',
    plot_bgcolor: '#f8f9fa',
    paper_bgcolor: '#ffffff'
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Загрузка графика...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">
            {selectedSensors.length === 0
              ? 'Выберите хотя бы один датчик для отображения графика'
              : 'Нет данных для выбранных датчиков за указанный период'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Plot
        data={chartData}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}