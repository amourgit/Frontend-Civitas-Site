import React from 'react';
import { CloudSun, Cloud, Sun } from 'lucide-react';

interface WeatherCardProps {
  date?: string;
  time?: string;
  city?: string;
  country?: string;
  description?: string;
  temperature?: number;
  weatherCondition?: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy';
  weatherLabel?: string;
  backgroundImage?: string;
}

const LagosWeatherCard: React.FC<WeatherCardProps> = ({
  date,
  time,
  city,
  country,
  description,
  temperature,
  weatherCondition = 'partly-cloudy',
  weatherLabel,
  backgroundImage
}) => {
  const getWeatherIcon = () => {
    switch (weatherCondition) {
      case 'sunny':
        return <Sun className="w-12 h-12 text-yellow-300" />;
      case 'cloudy':
        return <Cloud className="w-12 h-12 text-gray-200" />;
      case 'partly-cloudy':
        return <CloudSun className="w-12 h-12 text-yellow-300" />;
      default:
        return <CloudSun className="w-12 h-12 text-yellow-300" />;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
      {/* Background image avec overlay gradient */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage 
            ? `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%), url(${backgroundImage})`
            : `linear-gradient(135deg, rgba(101,67,33,0.8) 0%, rgba(139,69,19,0.7) 30%, rgba(160,82,45,0.6) 60%, rgba(34,139,34,0.7) 100%), 
               url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="%23654321"/><circle cx="200" cy="150" r="30" fill="%23DEB887" opacity="0.6"/><circle cx="800" cy="100" r="25" fill="%23F4A460" opacity="0.5"/><rect x="100" y="400" width="40" height="30" fill="%23D2691E" opacity="0.7"/><rect x="300" y="450" width="35" height="25" fill="%23CD853F" opacity="0.6"/><rect x="600" y="420" width="45" height="35" fill="%23A0522D" opacity="0.7"/><rect x="900" y="440" width="50" height="40" fill="%238B4513" opacity="0.8"/><rect x="150" y="480" width="60" height="20" fill="%23228B22" opacity="0.6"/></svg>')`
        }}
      >
        {/* Date et heure - affiché seulement si au moins une des deux est présente */}
        {(date || time) && (
          <div className="absolute top-6 left-6 text-white space-y-1">
            {date && (
              <div className="text-lg font-light opacity-90">{date}</div>
            )}
            {time && (
              <div className="text-lg font-light opacity-90 ml-4">{time}</div>
            )}
          </div>
        )}

        {/* Titre principal - ville et pays */}
        <div className="absolute top-20 left-6 text-white">
          {city && (
            <h1 className="text-4xl font-light tracking-wide mb-2">
              {city.toUpperCase()}
            </h1>
          )}
          {country && (
            <h2 className="text-lg font-light tracking-widest opacity-90">
              {country.toUpperCase()}
            </h2>
          )}
        </div>

        {/* Description - affiché seulement si présente */}
        {description && (
          <div className="absolute top-48 left-6 right-6 text-white">
            <p className="text-0.2rem font-light leading-relaxed opacity-90">
              {description}
            </p>
          </div>
        )}

        {/* Météo - température et conditions */}
        {(temperature !== undefined || weatherLabel) && (
          <div className="absolute bottom-6 left-6 flex items-center space-x-4 text-white">
            {/* Icône météo */}
            <div className="flex items-center">
              {getWeatherIcon()}
            </div>
            
            {/* Température et label */}
            <div className="flex flex-col">
              {temperature !== undefined && (
                <div className="text-5xl font-light">
                  {temperature}°
                </div>
              )}
              {weatherLabel && (
                <div className="text-lg font-light opacity-90">
                  {weatherLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LagosWeatherCard;