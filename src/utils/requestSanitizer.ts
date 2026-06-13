import { ValidationError } from "../errors/ValidatatorError";

export class RequestSanitizer {
    private static readonly DANGEROUS_PATTERNS = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
    ];
  
    private static readonly XSS_PATTERNS = [
      /(\b)(alert|confirm|prompt)\s*\(/gi,
      /(javascript:|data:text\/html)/gi,
      /(<|%3C)(script|iframe|object|embed)/gi,
    ];
  
    static sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
            typeof item === 'string' ? this.sanitizeString(item) : item
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeParams(value as Record<string, unknown>);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
  
    static sanitizeString(input: string): string {
      if (!input || typeof input !== 'string') {
        return input;
      }
  
      let sanitized = input.trim();
      
      // Nettoyer les patterns dangereux
      this.DANGEROUS_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
  
      // Nettoyer les patterns XSS
      this.XSS_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
  
      // Encoder les caractères HTML dangereux
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      
      return sanitized;
    }
  
    static validateAndSanitizeUrl(url: string): string {
      try {
        const urlObj = new URL(url, window?.location?.origin || 'https://localhost');
        
        // Vérifier que le protocole est sûr
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('Invalid protocol');
        }
  
        return urlObj.toString();
      } catch (error) {
        throw new ValidationError('Invalid URL format', [
          {
            code: 'invalid_url',
            message: 'URL format is invalid',
            path: ['url']
          }
        ]);
      }
    }
  }