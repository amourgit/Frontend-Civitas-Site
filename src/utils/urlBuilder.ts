import { ValidationError } from "../errors/ValidatatorError";

export class UrlBuilder {
  static buildUrl(baseUrl: string, endpoint: string, params?: Record<string, unknown>): string {
    try {
      // Nettoyer et combiner l'URL de base et l'endpoint
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const cleanEndpoint = endpoint.replace(/^\//, '');
      const fullPath = `${cleanBaseUrl}/${cleanEndpoint}`;
      
      const url = new URL(fullPath);
      
      // Ajouter les paramètres de requête
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              // Gérer les arrays - ajouter chaque élément
              value.forEach(item => {
                if (item !== null && item !== undefined) {
                  url.searchParams.append(key, String(item));
                }
              });
            } else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }
      
      return url.toString();
    } catch (error) {
      throw new ValidationError('Failed to build URL', [
        {
          code: 'invalid_url_construction',
          message: `Cannot construct URL from baseUrl: "${baseUrl}" and endpoint: "${endpoint}"`,
          path: ['url']
        }
      ]);
    }
  }

  static extractResourceId(endpoint: string): string | null {
    const patterns = [
      /\/([^\/]+)$/, // Dernier segment
      /:id/,         // Pattern :id
      /\{id\}/,      // Pattern {id}
    ];

    for (const pattern of patterns) {
      const match = endpoint.match(pattern);
      if (match) {
        return match[1] || null;
      }
    }

    return null;
  }

  static replaceResourceId(endpoint: string, resourceId: string | number): string {
    return endpoint
      .replace(':id', String(resourceId))
      .replace('{id}', String(resourceId))
      .replace(/\/\$/, `/${resourceId}`);
  }
}