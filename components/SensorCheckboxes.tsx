import React from 'react';

interface SensorCheckboxesProps {
  sensors: string[];
  selectedSensors: string[];
  onChange: (selected: string[]) => void;
  sensorColors: Record<string, string>;
}

export default function SensorCheckboxes({
  sensors,
  selectedSensors,
  onChange,
  sensorColors
}: SensorCheckboxesProps) {
  const handleChange = (sensor: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedSensors, sensor]);
    } else {
      onChange(selectedSensors.filter(s => s !== sensor));
    }
  };

  const handleSelectAll = () => {
    if (selectedSensors.length === sensors.length) {
      onChange([]);
    } else {
      onChange([...sensors]);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Датчики</h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:underline"
        >
          {selectedSensors.length === sensors.length ? 'Снять все' : 'Выбрать все'}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {sensors.map((sensor) => (
          <div key={sensor} className="flex items-center">
            <input
              type="checkbox"
              id={`sensor-${sensor}`}
              checked={selectedSensors.includes(sensor)}
              onChange={(e) => handleChange(sensor, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`sensor-${sensor}`}
              className="ml-2 block text-sm font-medium"
              style={{ color: sensorColors[sensor] }}
            >
              {sensor}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}