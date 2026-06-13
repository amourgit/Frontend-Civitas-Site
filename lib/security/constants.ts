// ============================================================
// lib/security/constants.ts
// Source unique de vérité pour toute la configuration sécurité.
// Ne jamais dupliquer ces valeurs dans d'autres fichiers.
// ============================================================

// ── Clés de stockage ─────────────────────────────────────
export const STORAGE_KEYS = {
  LEGACY_ACCESS_TOKEN:  'iam_access_token',
  LEGACY_REFRESH_TOKEN: 'iam_refresh_token',
  LEGACY_SESSION_ID:    'iam_session_id',

  USER:        'iam_user',
  PERMISSIONS: 'iam_permissions',
  ROLES:       'iam_roles',
} as const;

// ── Noms des cookies ──────────────────────────────────────
export const COOKIE_NAMES = {
  ACCESS_TOKEN:      'iam_at',
  REFRESH_TOKEN:     'iam_rt',
  SESSION_ID:        'iam_sid',
  SESSION_ACTIVE:    'iam_session_active',
  // Cookie JS-lisible (non HttpOnly) contenant l'expiry Unix (secondes)
  // du refresh token. Permet au frontend de détecter immédiatement
  // l'expiration du refresh token sans attendre celle de l'access token.
  REFRESH_TOKEN_EXP: 'iam_rt_exp',
} as const;

// ── Durées de vie ─────────────────────────────────────────
export const TOKEN_TTL = {
  ACCESS_TOKEN_SECONDS:   3600,
  REFRESH_TOKEN_SECONDS:  86_400 * 7,
  SESSION_ACTIVE_SECONDS: 86_400,
} as const;

// ── Inactivité & session ──────────────────────────────────
export const INACTIVITY = {
  TIMEOUT_MS:       15 * 60 * 1000,
  WARNING_BEFORE_MS: 2 * 60 * 1000,
  RESET_EVENTS: ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const,
} as const;

// ── Polling SessionMonitor ────────────────────────────────
export const SESSION_MONITOR = {
  POLL_STANDARD_MS: 60_000,
  POLL_ELEVATED_MS: 15_000,
  POLL_CRITICAL_MS:  5_000,
  HEALTH_ENDPOINT: '/compte/moi',
} as const;

// ── Routes publiques exactes (pour middleware) ────────────
export const PUBLIC_EXACT_ROUTES = new Set([
  '/',
  '/welcome',
]);

// ── Préfixes publics (pour middleware) ───────────────────
export const PUBLIC_PREFIXES = [
  '/auth/login',
  '/auth/forgot',
  '/auth/logout',
  '/_next',
  '/api',
  '/favicon',
  '/images',
  '/logo',
  '/motion_logo',
  '/opengraph-image',
  '/themes',
] as const;

// ── Headers de sécurité (appliqués par le middleware) ────
export const SECURITY_HEADERS = {
  'X-Frame-Options':           'DENY',
  'X-Content-Type-Options':    'nosniff',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
} as const;

// ── Utilitaire route publique ─────────────────────────────
export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
