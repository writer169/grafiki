useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const groupedData: Record<string, SensorData[]> = {};
      let allTimestamps: Date[] = [];

      data.forEach((item) => {
        if (!groupedData[item.sensor_id]) {
          groupedData[item.sensor_id] = [];
        }
        groupedData[item.sensor_id].push(item);
        allTimestamps.push(new Date(item.timestamp));
      });

      // Сортируем все метки времени
      allTimestamps = [...new Set(allTimestamps.map(d => d.getTime()))].map(t => new Date(t)).sort((a, b) => a.getTime() - b.getTime());

      // Подготавливаем кастомные метки времени
      const dateLabels: Array<{value: Date, text: string}> = [];
      
      if (allTimestamps.length > 0) {
        // Добавляем первую дату всегда
        const firstDate = allTimestamps[0];
        dateLabels.push({
          value: firstDate,
          text: `${firstDate.getDate().toString().padStart(2, '0')}.${(firstDate.getMonth() + 1).toString().padStart(2, '0')} ${firstDate.getHours().toString().padStart(2, '0')}:${firstDate.getMinutes().toString().padStart(2, '0')}`
        });

        // Добавляем метки на границах дат (00:00)
        let currentDate = new Date(firstDate);
        currentDate.setHours(0, 0, 0, 0);
        currentDate.setDate(currentDate.getDate() + 1); // Следующий день, 00:00
        
        const lastDate = allTimestamps[allTimestamps.length - 1];
        
        while (currentDate.getTime() < lastDate.getTime()) {
          dateLabels.push({
            value: new Date(currentDate),
            text: `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')} 00:00`
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Добавляем метки для часов между датами
        allTimestamps.forEach(timestamp => {
          // Если это не граница дня (00:00) и не первая дата
          if (timestamp.getHours() !== 0 || timestamp.getMinutes() !== 0 || 
              timestamp.getTime() === firstDate.getTime()) {
            // Проверяем, что этот час ещё не добавлен
            if (!dateLabels.some(label => 
                label.value.getHours() === timestamp.getHours() && 
                label.value.getDate() === timestamp.getDate() && 
                label.value.getMonth() === timestamp.getMonth())) {
              // Добавляем только часы, без даты
              dateLabels.push({
                value: timestamp,
                text: `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`
              });
            }
          }
        });
      }
      
      // Сортируем метки
      dateLabels.sort((a, b) => a.value.getTime() - b.value.getTime());

      // Ограничиваем количество меток
      const maxLabels = 12;
      let skipFactor = Math.max(1, Math.floor(dateLabels.length / maxLabels));
      const filteredLabels = dateLabels.filter((_, i) => i % skipFactor === 0 || i === 0 || i === dateLabels.length - 1);

      // Обновляем насimport { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SensorData } from '@/models/SensorData';
import { Layout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TemperatureChartProps {
  data: SensorData[];
  selectedSensors: string[];
  sensorColors: Record<string, string>;
}

export default function TemperatureChart({
  data,
  selectedSensors,
  sensorColors
}: TemperatureChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для дополнительного сглаживания данных
  const smoothData = (points: number[], windowSize: number = 3): number[] => {
    if (points.length < windowSize) return points;
    
    const smoothed: number[] = [];
    
    // Начальные точки остаются как есть
    for (let i = 0; i < Math.floor(windowSize/2); i++) {
      smoothed.push(points[i]);
    }
    
    // Скользящее среднее
    for (let i = Math.floor(windowSize/2); i < points.length - Math.floor(windowSize/2); i++) {
      let sum = 0;
      for (let j = i - Math.floor(windowSize/2); j <= i + Math.floor(windowSize/2); j++) {
        sum += points[j];
      }
      smoothed.push(sum / windowSize);
    }
    
    // Конечные точки остаются как есть
    for (let i = points.length - Math.floor(windowSize/2); i < points.length; i++) {
      smoothed.push(points[i]);
    }
    
    return smoothed;
  };

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const groupedData: Record<string, SensorData[]> = {};

      data.forEach((item) => {
        if (!groupedData[item.sensor_id]) {
          groupedData[item.sensor_id] = [];
        }
        groupedData[item.sensor_id].push(item);
      });

      const plotData = selectedSensors
        .filter((sensor) => groupedData[sensor])
        .map((sensor) => {
          const sensorData = groupedData[sensor].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() -
              new Date(b.timestamp).getTime()
          );

          const x: Date[] = [];
          const y: (number | null)[] = [];
          const rawValues: number[] = [];

          sensorData.forEach((item) => {
            x.push(new Date(item.timestamp));
            if (item.value !== null) {
              rawValues.push(item.value);
            }
            y.push(item.value);
          });
          
          // Применяем дополнительное сглаживание, если точек достаточно
          const smoothedValues = rawValues.length >= 5 ? smoothData(rawValues, 5) : rawValues;
          
          // Заменяем исходные значения сглаженными
          let smoothedIndex = 0;
          for (let i = 0; i < y.length; i++) {
            if (y[i] !== null) {
              y[i] = smoothedValues[smoothedIndex++];
            }
          }

          return {
            type: 'scatter' as const,
            mode: 'lines', // Убрали маркеры, оставили только линии
            name: ' ',
            x,
            y,
            line: { 
              color: sensorColors[sensor], 
              width: 2.5,
              shape: 'spline', // Добавили сглаживание линий
              smoothing: 1.6 // Максимальный коэффициент сглаживания
            },
            connectgaps: true, // Соединяем точки с пропусками для более гладкой линии
            hoverinfo: 'x+y', // Улучшенная информация при наведении
            hoverlabel: { bgcolor: sensorColors[sensor] }, // Цвет метки соответствует цвету линии
          };
        });

      setChartData(plotData);
    } catch (error) {
      console.error('Error preparing chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, selectedSensors, sensorColors]);

  const layout: Partial<Layout> = {
    title: { text: 'График температуры', font: { size: 22 } },
    autosize: true,
    height: 500,
    margin: { l: 40, r: 40, b: 40, t: 80, pad: 4 }, // Немного уменьшены отступы
    xaxis: {
      tickformat: '', // Убираем стандартный формат
      tickangle: -45,
      title: { text: '' }, // Убрали подпись "Время"
      tickfont: { size: 8, family: 'Arial, sans-serif' }, // Очень маленький шрифт для времени
      nticks: 12, // Увеличиваем количество отметок, но будем фильтровать их
      showgrid: false, // Убираем вертикальную сетку
      tickformatstops: [
        {
          dtickrange: [null, 60000], // до минуты
          value: '%H:%M:%S.%L'
        },
        {
          dtickrange: [60000, 3600000], // от минуты до часа
          value: '%H:%M'
        },
        {
          dtickrange: [3600000, 86400000], // от часа до дня
          value: '%H:%M'
        },
        {
          dtickrange: [86400000, 604800000], // от дня до недели
          value: '%e. %b'
        },
        {
          dtickrange: [604800000, "M1"], // от недели до месяца
          value: '%e. %b'
        },
        {
          dtickrange: ["M1", "M12"], // от месяца до года
          value: '%b %y'
        },
        {
          dtickrange: ["M12", null], // больше года
          value: '%Y'
        }
      ],
      // Функция для кастомизации меток времени
      tickvals: [], // Будем динамически заполнять в useEffect
      ticktext: [] // Будем динамически заполнять в useEffect
    },
    yaxis: {
      title: { text: '' }, // Убрали подпись "Температура (°C)"
      tickfont: { size: 10, family: 'Arial, sans-serif' }, // Шрифт для значений температуры
      showticklabels: true, // Показываем подписи значений температуры
      tickformat: '.1f', // Формат с одним знаком после запятой
      showgrid: true, // Оставляем горизонтальную сетку
      gridcolor: '#e0e0e0', // Светлый цвет сетки
      zeroline: false // Убираем линию нуля
    },
    showlegend: false,
    hovermode: 'closest',
    plot_bgcolor: '#f8f9fa',
    paper_bgcolor: '#ffffff'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Загрузка графика...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center">
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
    <div>
      <Plot
        data={chartData}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}