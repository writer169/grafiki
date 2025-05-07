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
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Период</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => handlePresetChange('24h')}
          className={`date-range-button ${
            !isCustomRange && startDate && endDate && endDate.getTime() - startDate.getTime() === 24 * 60 * 60 * 1000
              ? 'date-range-button--active'
              : 'date-range-button--inactive'
          }`}
        >
          24 часа
        </button>
        
        <button
          type="button"
          onClick={() => handlePresetChange('7d')}
          className={`date-range-button ${
            !isCustomRange && startDate && endDate && endDate.getTime() - startDate.getTime() === 7 * 24 * 60 * 60 * 1000
              ? 'date-range-button--active'
              : 'date-range-button--inactive'
          }`}
        >
          7 дней
        </button>
        
        <button
          type="button"
          onClick={() => handlePresetChange('30d')}
          className={`date-range-button ${
            !isCustomRange && startDate && endDate && endDate.getTime() - startDate.getTime() === 30 * 24 * 60 * 60 * 1000
              ? 'date-range-button--active'
              : 'date-range-button--inactive'
          }`}
        >
          30 дней
        </button>
        
        <button
          type="button"
          onClick={() => handlePresetChange('custom')}
          className={`date-range-button ${
            isCustomRange ? 'date-range-button--active' : 'date-range-button--inactive'
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
              className="date-range-input"
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
              className="date-range-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}