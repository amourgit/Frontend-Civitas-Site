import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';

interface NewsletterCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  onSubscribe?: (email: string) => void;
}

const SubscribeNewsletterCard: React.FC<NewsletterCardProps> = ({
  title,
  description,
  buttonText,
  placeholder,
  showCloseButton = true,
  onClose,
  onSubscribe
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && onSubscribe) {
      onSubscribe(email);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
        </button>
      )}

      <div className="flex items-start space-x-3">
        {/* Mail illustration */}
        <div className="flex-shrink-0">
          <div className="relative">
            {/* Envelope base */}
            <div className="w-12 h-8 bg-yellow-400 rounded relative overflow-hidden">
              {/* Envelope flap */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-500 rounded-t"></div>
              
              {/* Letter inside */}
              <div className="absolute top-1 left-1 right-1 bottom-1 bg-white rounded-sm">
                {/* Letter lines */}
                <div className="space-y-0.5 p-1">
                  <div className="h-0.5 bg-cyan-400 rounded w-2/3"></div>
                  <div className="h-0.5 bg-cyan-400 rounded w-1/3"></div>
                  <div className="h-0.5 bg-cyan-400 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-sm font-bold text-gray-900 mb-1">
              {title}
            </h2>
          )}

          {description && (
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {/* Form */}
      <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder || "Email Address"}
                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-transparent outline-none text-xs placeholder-gray-400"
              />
            </div>
            
            {buttonText && (
              <button
                onClick={handleSubmit}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded transition-colors text-xs whitespace-nowrap"
              >
                {buttonText}
              </button>
            )}
        </div>
    </div>
  );
};

export default SubscribeNewsletterCard;