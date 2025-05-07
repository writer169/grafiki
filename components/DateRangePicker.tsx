import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ru } from 'date-fns/locale';
import { subDays, subHours, startOfDay, endOfDay } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Обработчик для предустановленных периодов
  const handlePresetChange = (preset: string) => {
    setIsCustomRange(false);
    
    let newStartDate: Date | null = null;
    let newEndDate: Date | null = null;
    
    const now = new Date();
    
    switch (preset) {
      case '24h':
        newStartDate = subHours(now, 24);
        newEndDate = now;
        break;
      case '7d':
        newStartDate = subDays(now, 7);
        newEndDate = now;
        break;
      case '30d':
        newStartDate = subDays(now, 30);
        newEndDate = now;
        break;
      case 'custom':
        setIsCustomRange(true);
        return;
      default:
        break;
    }
    
    onChange(newStartDate, newEndDate);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Период</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => handlePresetChange('24h')}
          className={`px-3 py-1 rounded ${
            !isCustomRange && startDate && endDate && endDate.getTime() - startDate.getTime() === 24 * 60 * 60 * 1000
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          24 часа
        </button>
        
        <button
          type="button"
          onClick={() => handlePresetChange('7d')}
          className={`px-3 py-1 rounded ${
            !isCustomRange && startDate && endDate && endDate.getTime() - startDate.getTime() === 7 * 24 * 60 * 60 * 1000
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          7 дней
        </button>
        
        <button
          type="button"
          onClick={() => handlePresetChange('30d')}
          className={`px-3 py-1 rounded ${
            !isCustomRange && startDate && endDate && endDate.getTime() - startDate.getTime() === 30 * 24 * 60 * 60 * 1000
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          30 дней
        </button>
        
        <button
          type="button"
          onClick={() => handlePresetChange('custom')}
          className={`px-3 py-1 rounded ${
            isCustomRange ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Произвольно
        </button>
      </div>
      
      {isCustomRange && (
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              С
            </label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={(date) => onChange(date, endDate)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd.MM.yyyy"
              locale={ru}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              По
            </label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={(date) => onChange(startDate, date ? endOfDay(date) : null)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd.MM.yyyy"
              locale={ru}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}