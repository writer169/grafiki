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
  const [lastSensorValues, setLastSensorValues