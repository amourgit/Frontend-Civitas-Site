// utils/sanitizer.ts
export class RequestSanitizer {
    private static readonly DANGEROUS_PATTERNS = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
    ];
  
    static sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeParams(value as Record<string, unknown>);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
  
    private static sanitizeString(input: string): string {
      let sanitized = input.trim();
      
      this.DANGEROUS_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
      
      return sanitized;
    }
  }