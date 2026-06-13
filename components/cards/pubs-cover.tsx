import React from 'react';
import { Plane, Building2 } from 'lucide-react';

interface TravelCardProps {
  discount?: string;
  destination?: string;
  flightIncluded?: boolean;
  accommodationIncluded?: boolean;
  nights?: number;
  price?: number;
  currency?: string;
  backgroundImage?: string;
}

const CubaTravelCard: React.FC<TravelCardProps> = ({
  discount,
  destination,
  flightIncluded = false,
  accommodationIncluded = false,
  nights,
  price,
  currency = '$',
  backgroundImage
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl">
      {/* Background image avec overlay gradient */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage 
            ? `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%), url(${backgroundImage})`
            : `linear-gradient(135deg, rgba(0,100,150,0.3) 0%, rgba(0,150,100,0.2) 50%, rgba(50,150,50,0.4) 100%), 
               url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2387CEEB"/><stop offset="30%" style="stop-color:%2398FB98"/><stop offset="70%" style="stop-color:%23228B22"/><stop offset="100%" style="stop-color:%23006400"/></linearGradient></defs><rect width="800" height="600" fill="url(%23bg)"/><ellipse cx="200" cy="200" rx="60" ry="40" fill="%23DEB887" opacity="0.8"/><ellipse cx="500" cy="150" rx="80" ry="50" fill="%23CD853F" opacity="0.7"/><ellipse cx="650" cy="250" rx="50" ry="30" fill="%23A0522D" opacity="0.6"/><path d="M0,400 Q200,350 400,380 T800,400 L800,600 L0,600 Z" fill="%2300CED1" opacity="0.6"/></svg>')`
        }}
      >
        {/* Badge de réduction */}
        {discount && (
          <div className="absolute top-4 -left-2 bg-orange-500 text-white px-4 py-2 rounded-md shadow-lg">
            <span className="text-0.875rem font-semibold">Up to {discount} off</span>
          </div>
        )}

        {/* Destination */}
        {destination && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-5rem font-bold text-white tracking-wider drop-shadow-lg">
              {destination.toUpperCase()}
              <span className="text-blue-400">.</span>
            </h1>
          </div>
        )}

        {/* Informations du package en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <div className="flex justify-between items-center text-white">
            {/* Services inclus */}
            {(flightIncluded || accommodationIncluded || nights) && (
              <div className="flex items-center space-x-2">
                {flightIncluded && (
                  <Plane className="w-6 h-6" />
                )}
                {accommodationIncluded && (
                  <Building2 className="w-6 h-6" />
                )}
                <div className="text-1rem font-medium">
                  {flightIncluded && accommodationIncluded && nights && (
                    <span>Flight + {nights} nights</span>
                  )}
                  {flightIncluded && !accommodationIncluded && (
                    <span>Flight</span>
                  )}
                  {!flightIncluded && accommodationIncluded && nights && (
                    <span>{nights} nights</span>
                  )}
                </div>
              </div>
            )}

            {/* Prix */}
            {price !== undefined && (
              <div className="text-right">
                <span className="text-3rem font-bold">
                  {currency} {price}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CubaTravelCard;