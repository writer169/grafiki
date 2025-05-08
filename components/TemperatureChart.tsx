import { useEffect, useState, useMemo } from 'react';
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

  // Создаем пользовательскую функцию форматирования для оси времени
  const customDateFormatter = useMemo(() => {
    const formatCache = new Map<string, string>();
    let lastDate = '';
    
    return (date: Date): string => {
      const dateString = date.toISOString();
      
      // Проверяем, есть ли уже форматированная строка в кэше
      if (formatCache.has(dateString)) {
        return formatCache.get(dateString)!;
      }
      
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      
      const currentDate = `${day}.${month}`;
      let formattedDate = '';
      
      // Показываем дату только в начале графика или в 00:00
      if (currentDate !== lastDate || (hours === 0 && minutes === 0)) {
        formattedDate = `${day}.${month} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        lastDate = currentDate;
      } else {
        formattedDate = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      // Сохраняем в кэш
      formatCache.set(dateString, formattedDate);
      return formattedDate;
    };
  }, []);

  useEffect(() => {
    if (chartData.length === 0) return;
    
    // Собираем все метки времени из всех наборов данных
    const allTimestamps: Date[] = [];
    chartData.forEach(dataset => {
      dataset.x.forEach((timestamp: Date) => {
        allTimestamps.push(new Date(timestamp));
      });
    });
    
    // Сортируем по времени
    allTimestamps.sort((a, b) => a.getTime() - b.getTime());
    
    // Удаляем дубликаты
    const uniqueTimestamps = Array.from(new Set(allTimestamps.map(d => d.getTime())))
      .map(time => new Date(time));
    
    // Определяем, какие метки времени показывать полностью (с датой)
    // Первая метка всегда показывается полностью
    const tickvals: Date[] = [uniqueTimestamps[0]];
    const ticktext: string[] = [customDateFormatter(uniqueTimestamps[0])];
    
    let currentDay = uniqueTimestamps[0].getDate();
    
    // Проходим по всем меткам, начиная со второй
    for (let i = 1; i < uniqueTimestamps.length; i++) {
      const timestamp = uniqueTimestamps[i];
      const day = timestamp.getDate();
      const hours = timestamp.getHours();
      const minutes = timestamp.getMinutes();
      
      // Показываем метку, если это начало нового дня или по алгоритму прореживания
      const isNewDay = day !== currentDay;
      const isMidnight = hours === 0 && minutes === 0;
      const isSignificantTime = i % Math.max(1, Math.floor(uniqueTimestamps.length / 8)) === 0;
      
      if (isNewDay || isMidnight || isSignificantTime) {
        tickvals.push(timestamp);
        ticktext.push(customDateFormatter(timestamp));
        currentDay = day;
      }
    }
    
    // Обновляем макет с новыми метками
    setLayout(prevLayout => ({
      ...prevLayout,
      xaxis: {
        ...prevLayout.xaxis,
        tickvals,
        ticktext
      }
    }));
  }, [chartData, customDateFormatter]);

  const [layout, setLayout] = useState<Partial<Layout>>({
    title: { text: 'График температуры', font: { size: 22 } },
    autosize: true,
    height: 500,
    margin: { l: 40, r: 40, b: 40, t: 80, pad: 4 },
    xaxis: {
      tickangle: -45,
      title: { text: '' },
      tickfont: { size: 8, family: 'Arial, sans-serif' },
      showgrid: false,
    },
    yaxis: {
      title: { text: '' },
      tickfont: { size: 10, family: 'Arial, sans-serif' },
      showticklabels: true,
      tickformat: '.1f',
      showgrid: true,
      gridcolor: '#e0e0e0',
      zeroline: false
    },
    showlegend: false,
    hovermode: 'closest',
    plot_bgcolor: '#f8f9fa',
    paper_bgcolor: '#ffffff'
  });

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