import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

interface CardPromoCardProps {
  productName?: string;
  title?: string;
  imageUrl?: string;
  timeLeft?: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
  price?: number;
  currency?: string;
  priceLabel?: string;
  onPurchase?: () => void;
}

const CardPromoCard: React.FC<CardPromoCardProps> = ({
  productName,
  title,
  imageUrl,
  timeLeft,
  price,
  currency = '$',
  priceLabel,
  onPurchase
}) => {
  const [countdown, setCountdown] = useState(timeLeft || {});

  // Simulation du countdown (optionnel)
  useEffect(() => {
    if (!timeLeft) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        const { days = 0, hours = 0, minutes = 0 } = prev;
        let totalMinutes = days * 24 * 60 + hours * 60 + minutes;
        
        if (totalMinutes <= 0) return prev;
        
        totalMinutes -= 1;
        
        return {
          days: Math.floor(totalMinutes / (24 * 60)),
          hours: Math.floor((totalMinutes % (24 * 60)) / 60),
          minutes: totalMinutes % 60
        };
      });
    }, 1000); // Update every minute

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-800 rounded-3xl p-2 text-white">
      {/* Product name */}
      {productName && (
        <div className="text-center mb-2">
          <p className="text-1.125rem text-gray-300 font-light">
            {productName}
          </p>
        </div>
      )}

      {/* Main title */}
      {title && (
        <div className="text-center mb-2">
          <h1 className="text-3.5rem font-bold leading-tight">
            {title}
          </h1>
        </div>
      )}

      {/* Product image */}
      <div className="flex justify-center mb-2">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={productName || "Product"} 
            className="w-48 h-56 object-contain"
          />
        ) : (
          <div className="w-48 h-56 flex items-center justify-center">
            {/* Default iPhone illustration */}
            <div className="relative">
              {/* White iPhone */}
              <div className="w-20 h-32 bg-white rounded-lg shadow-lg relative mr-4">
                <div className="absolute top-2 left-2 right-2 bottom-8 bg-blue-100 rounded-md"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded"></div>
              </div>
              
              {/* Blue iPhone overlapping */}
              <div className="absolute top-4 left-8 w-20 h-32 bg-blue-600 rounded-lg shadow-lg">
                <div className="absolute top-2 left-2 right-2 bottom-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-md"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-400 rounded"></div>
                {/* Apple logo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-gray-600 rounded-sm opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Countdown timer */}
      {(countdown.days !== undefined || countdown.hours !== undefined || countdown.minutes !== undefined) && (
        <div className="text-center mb-8">
          <p className="text-1rem text-gray-300 mb-4">Time left:</p>
          <div className="flex justify-center space-x-4">
            {countdown.days !== undefined && (
              <div className="bg-gray-700 rounded-lg px-4 py-2 min-w-[3rem]">
                <span className="text-1.5rem font-bold text-gray-300">
                  {countdown.days.toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {countdown.hours !== undefined && (
              <div className="bg-gray-700 rounded-lg px-4 py-2 min-w-[3rem]">
                <span className="text-1.5rem font-bold text-gray-300">
                  {countdown.hours.toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {countdown.minutes !== undefined && (
              <div className="bg-gray-700 rounded-lg px-4 py-2 min-w-[3rem]">
                <span className="text-1.5rem font-bold text-gray-300">
                  {countdown.minutes.toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price button */}
      {(price !== undefined || priceLabel) && (
        <div className="text-center">
          <button
            onClick={onPurchase}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors text-1.25rem"
          >
            {priceLabel || `Only ${currency}${price?.toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  );
};

// Exemple d'utilisation avec des données complètes
const ExampleUsage: React.FC = () => {
  const offerData: CardPromoCardProps = {
    productName: "Iphone 12 mini",
    title: "Best offer",
    timeLeft: {
      days: 2,
      hours: 23,
      minutes: 42
    },
    price: 399.00,
    currency: "$",
    onPurchase: () => {
      alert("Purchase initiated!");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen space-y-8">
      <CardPromoCard {...offerData} />
      
      {/* Exemple avec données partielles */}
      <div className="mt-8">
        <h3 className="text-1.125rem font-semibold mb-4">Exemple avec données partielles :</h3>
        <CardPromoCard 
          productName="iPhone 13 Pro"
          title="Special Deal"
          price={699}
          onPurchase={() => console.log("Purchase clicked")}
        />
      </div>

      {/* Exemple avec label de prix personnalisé */}
      <div className="mt-8">
        <h3 className="text-1.125rem font-semibold mb-4">Exemple avec label personnalisé :</h3>
        <CardPromoCard 
          title="Limited Time"
          priceLabel="Get it now - €449.99"
          timeLeft={{ hours: 5, minutes: 30 }}
        />
      </div>
    </div>
  );
};

export default CardPromoCard;