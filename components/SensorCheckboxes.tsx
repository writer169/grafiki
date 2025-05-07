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

  return (
    <div className="flex flex-wrap justify-center gap-6 py-4">
      {sensors.map((sensor) => (
        <div key={sensor} className="flex items-center">
          <input
            type="checkbox"
            id={`sensor-${sensor}`}
            checked={selectedSensors.includes(sensor)}
            onChange={(e) => handleChange(sensor, e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor={`sensor-${sensor}`}
            className="ml-2 text-base font-medium"
            style={{ color: sensorColors[sensor] }}
          >
            {sensor}
          </label>
        </div>
      ))}
    </div>
  );
}
