import React from 'react';
import dynamic from 'next/dynamic';
import { SensorData } from '../models/SensorData';
import { groupSensorData } from '../lib/sensors';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TemperatureChartProps {
  data: SensorData[];
  selectedSensors: string[];
  startDate: Date;
  endDate: Date;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  selectedSensors,
  startDate,
  endDate,
}) => {
  const groupedData = groupSensorData(data, selectedSensors);

  const chartData = Object.entries(groupedData).map(([sensorName, values]) => ({
    x: values.map((v) => new Date(v.timestamp)),
    y: values.map((v) => v.value),
    type: 'scatter',
    mode: 'lines+markers',
    name: sensorName,
  }));

  const layout = {
    title: { text: 'Температурный график' },
    autosize: true,
    height: 500,
    margin: {
      l: 50,
      r: 30,
      b: 50,
      t: 50,
      pad: 4,
    },
    xaxis: {
      title: { text: 'Дата и время' },
      tickformat: '%d.%m %H:%M',
      tickangle: -45,
    },
    yaxis: {
      title: { text: 'Температура (°C)' },
    },
    legend: {
      orientation: 'h',
      y: -0.3,
    },
    plot_bgcolor: '#f9f9f9',
    paper_bgcolor: '#f9f9f9',
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={chartData}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default TemperatureChart;