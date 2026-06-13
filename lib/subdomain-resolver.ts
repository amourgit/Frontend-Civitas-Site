// ============================================================
// lib/subdomain-resolver.ts
// SubdomainResolver — Extraction multi-niveaux des sous-domaines
//
// PRINCIPE :
//   Permet d'extraire N niveaux de sous-domaines depuis une URL,
//   avec configuration fine des niveaux à retourner.
//
// EXEMPLES D'URL :
//   https://client1.region2.org.iam-central.ga
//     niveau 1 (le plus proche du domaine racine) → "org"
//     niveau 2 → "region2"
//     niveau 3 → "client1"
//
//   https://tenant.app.saas-platform.com
//     niveaux [1,2] → ["app", "tenant"]
//
// API :
//   resolveSubdomains(options?)       → SubdomainResolution
//   getSubdomainAt(level, hostname?)  → string | null
//   getSubdomainsList(levels, hostname?) → string[]
//
// MULTITENANT :
//   En combinaison avec realm-resolver, on peut mapper :
//     client1.region2.org.iam-central.ga
//     → realm = "client1" (niveau le plus haut)
//     → region = "region2"
//     → sector = "org"
// ============================================================

// ── Configuration ─────────────────────────────────────────────

/**
 * Domaines racines à ignorer lors de l'extraction des sous-domaines.
 * Ces domaines et leurs variantes www. ne sont pas considérés
 * comme des sous-domaines significatifs.
 */
const ROOT_DOMAINS: readonly string[] = [
  'localhost',
  '127.0.0.1',
  '::1',
  // Domaines de production IAM Central
  'iam-central.ga',
  'iam-central.com',
  'iam-central.io',
  'iamcentral.ga',
  // Domaines génériques
  'app.localhost',
];

/**
 * TLDs connus pour la détection des domaines à 2 parties (ex: "saas.com")
 * et des ccTLD composés (ex: "co.uk", "com.au").
 */
const COMPOUND_TLDS: readonly string[] = [
  'co.uk', 'co.in', 'co.nz', 'co.za', 'co.jp',
  'com.au', 'com.br', 'com.ar', 'com.mx',
  'org.uk', 'net.uk', 'me.uk', 'ac.uk',
  'gov.uk', 'gov.au', 'gov.br',
];

// ── Types ──────────────────────────────────────────────────────

/** Options de résolution des sous-domaines */
export interface SubdomainResolverOptions {
  /**
   * Hostname explicite (utile pour SSR ou tests).
   * Si omis, utilise window.location.hostname côté client.
   */
  hostname?: string;

  /**
   * Niveaux de sous-domaines à extraire.
   *
   * Le NIVEAU 1 est le sous-domaine le plus proche du domaine racine.
   * Exemple : "client.region.org.iam-central.ga"
   *   - niveau 1 = "org"
   *   - niveau 2 = "region"
   *   - niveau 3 = "client"
   *
   * Si non défini, tous les niveaux sont retournés.
   */
  levels?: number[];

  /**
   * Domaines racines supplémentaires à exclure (en plus de la liste par défaut).
   */
  additionalRootDomains?: string[];

  /**
   * Si true, "www" est ignoré comme sous-domaine (défaut: true).
   */
  ignoreWww?: boolean;
}

/** Résultat de la résolution des sous-domaines */
export interface SubdomainResolution {
  /** Tous les sous-domaines extraits, du plus proche au plus éloigné du domaine racine */
  all: string[];

  /**
   * Sous-domaines indexés par niveau (base 1).
   * niveau 1 = le plus proche du domaine racine.
   *
   * @example
   * // "client.region.iam-central.ga"
   * // byLevel[1] = "region"
   * // byLevel[2] = "client"
   */
  byLevel: Record<number, string>;

  /**
   * Sous-domaines demandés via options.levels (dans l'ordre demandé).
   * Vide si levels non spécifié.
   */
  requested: string[];

  /** Hostname source utilisé pour l'extraction */
  hostname: string;

  /** Domaine racine détecté (sans les sous-domaines) */
  rootDomain: string;

  /** true si des sous-domaines ont été trouvés */
  hasSubdomains: boolean;

  /** Nombre total de niveaux de sous-domaines */
  depth: number;
}

// ── Parsing du hostname ────────────────────────────────────────

/**
 * Nettoie le hostname (retire le port, met en minuscules).
 */
function cleanHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase().trim();
}

/**
 * Vérifie si le hostname est une adresse IP.
 */
function isIPAddress(host: string): boolean {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  // IPv6 simplifié
  if (host.startsWith('[') || host.includes(':')) return true;
  return false;
}

/**
 * Détecte si le hostname est un domaine racine connu.
 */
function isKnownRootDomain(host: string, extraRoots: string[] = []): boolean {
  const allRoots = [...ROOT_DOMAINS, ...extraRoots];
  return allRoots.some(
    (root) => host === root || host === `www.${root}`,
  );
}

/**
 * Détecte la longueur du TLD composé si applicable.
 * Exemple : "co.uk" → 2, "com" → 1
 */
function getCompoundTLDLength(parts: string[]): number {
  if (parts.length < 2) return 1;
  const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  if (COMPOUND_TLDS.includes(lastTwo)) return 2;
  return 1;
}

// ── Extraction principale ──────────────────────────────────────

/**
 * Extrait tous les segments de sous-domaines depuis un hostname.
 *
 * @returns Tableau ordonné du plus proche au plus éloigné du domaine racine.
 *
 * @example
 * // "client.region.org.iam-central.ga"
 * // ROOT_DOMAIN = "iam-central.ga" (2 parties)
 * // sous-domaines = ["org", "region", "client"]
 * //                  ^niveau1  ^niveau2  ^niveau3
 */
function extractAllSubdomains(
  hostname: string,
  options: { additionalRootDomains?: string[]; ignoreWww?: boolean } = {},
): { subdomains: string[]; rootDomain: string } {
  const { additionalRootDomains = [], ignoreWww = true } = options;
  const host = cleanHostname(hostname);

  // Cas triviaux
  if (!host || isIPAddress(host) || isKnownRootDomain(host, additionalRootDomains)) {
    return { subdomains: [], rootDomain: host };
  }

  const parts = host.split('.');

  // Hostname sans point (ex: "monapp" en intranet) → traiter comme sous-domaine unique
  if (parts.length === 1) {
    return { subdomains: [host], rootDomain: '' };
  }

  // Détecter les domaines racines connus parmi les suffixes
  // On cherche le domaine racine le plus long qui correspond à nos ROOT_DOMAINS
  const allRoots = [...ROOT_DOMAINS, ...additionalRootDomains];
  let rootParts = 0;

  for (const root of allRoots) {
    const rootSegments = root.split('.');
    const tail = parts.slice(-rootSegments.length).join('.');
    if (tail === root && rootSegments.length > rootParts) {
      rootParts = rootSegments.length;
    }
  }

  // Si aucun domaine racine connu détecté, utiliser la détection TLD automatique
  if (rootParts === 0) {
    const tldLen = getCompoundTLDLength(parts);
    // domaine = tld + 1 partie (ex: "example.com" = 2 parties)
    rootParts = tldLen + 1;
  }

  const rootDomain = parts.slice(-rootParts).join('.');
  let subdomainParts = parts.slice(0, parts.length - rootParts);

  // Ignorer "www" si demandé
  if (ignoreWww && subdomainParts[0] === 'www') {
    subdomainParts = subdomainParts.slice(1);
  }

  // Les sous-domaines sont du plus éloigné (gauche) au plus proche (droite) du rootDomain
  // On inverse pour que l'index 0 = niveau 1 (le plus proche du rootDomain)
  const subdomains = [...subdomainParts].reverse();

  return { subdomains, rootDomain };
}

// ── API publique ───────────────────────────────────────────────

/**
 * Résout les sous-domaines depuis l'URL courante ou un hostname fourni.
 *
 * @param options Configuration de la résolution
 * @returns SubdomainResolution avec tous les niveaux et les niveaux demandés
 *
 * @example
 * // URL: https://client1.region2.org.iam-central.ga
 * const r = resolveSubdomains({ levels: [1, 3] });
 * // r.all      = ["org", "region2", "client1"]
 * // r.byLevel  = { 1: "org", 2: "region2", 3: "client1" }
 * // r.requested = ["org", "client1"]  (niveaux 1 et 3)
 *
 * @example
 * // URL: https://tenant.app.saas-platform.com
 * const r = resolveSubdomains({ levels: [2] });
 * // r.all      = ["app", "tenant"]
 * // r.byLevel  = { 1: "app", 2: "tenant" }
 * // r.requested = ["tenant"]
 */
export function resolveSubdomains(
  options: SubdomainResolverOptions = {},
): SubdomainResolution {
  const {
    hostname: explicitHostname,
    levels,
    additionalRootDomains = [],
    ignoreWww = true,
  } = options;

  // Déterminer le hostname source
  const hostname =
    explicitHostname ??
    (typeof window !== 'undefined' ? window.location.hostname : '');

  const { subdomains, rootDomain } = extractAllSubdomains(hostname, {
    additionalRootDomains,
    ignoreWww,
  });

  // Construire byLevel (base 1)
  const byLevel: Record<number, string> = {};
  subdomains.forEach((sub, idx) => {
    byLevel[idx + 1] = sub;
  });

  // Extraire les niveaux demandés (dans l'ordre demandé)
  const requested: string[] = [];
  if (levels && levels.length > 0) {
    for (const lvl of levels) {
      const val = byLevel[lvl];
      if (val !== undefined) requested.push(val);
    }
  }

  return {
    all:           subdomains,
    byLevel,
    requested,
    hostname,
    rootDomain,
    hasSubdomains: subdomains.length > 0,
    depth:         subdomains.length,
  };
}

/**
 * Retourne le sous-domaine à un niveau précis.
 *
 * Niveau 1 = le plus proche du domaine racine.
 *
 * @param level   Niveau de sous-domaine (base 1)
 * @param hostname Hostname optionnel (pour SSR/tests)
 * @returns Le sous-domaine ou null si inexistant
 *
 * @example
 * // URL: https://client.region.iam-central.ga
 * getSubdomainAt(1) // → "region"
 * getSubdomainAt(2) // → "client"
 * getSubdomainAt(3) // → null
 */
export function getSubdomainAt(level: number, hostname?: string): string | null {
  const res = resolveSubdomains({ hostname, levels: [level] });
  return res.byLevel[level] ?? null;
}

/**
 * Retourne une liste de sous-domaines pour les niveaux demandés.
 *
 * @param levels  Tableau de niveaux (base 1) à extraire
 * @param hostname Hostname optionnel (pour SSR/tests)
 * @returns Liste des sous-domaines dans l'ordre des niveaux demandés
 *
 * @example
 * // URL: https://client.region.org.iam-central.ga
 * getSubdomainsList([1, 3])  // → ["org", "client"]
 * getSubdomainsList([2, 1])  // → ["region", "org"]
 */
export function getSubdomainsList(levels: number[], hostname?: string): string[] {
  const res = resolveSubdomains({ hostname, levels });
  return res.requested;
}

/**
 * Retourne le premier sous-domaine (niveau le plus éloigné du rootDomain).
 * Correspond généralement au tenant/client dans une architecture multitenant.
 *
 * @example
 * // URL: https://myclient.iam-central.ga
 * getTopSubdomain() // → "myclient"
 *
 * // URL: https://myclient.region.iam-central.ga
 * getTopSubdomain() // → "myclient"
 */
export function getTopSubdomain(hostname?: string): string | null {
  const res = resolveSubdomains({ hostname });
  if (res.depth === 0) return null;
  return res.all[res.depth - 1] ?? null;
}

/**
 * Retourne tous les sous-domaines sous forme de map { niveau: valeur }.
 *
 * @param hostname Hostname optionnel
 *
 * @example
 * // URL: https://client.region.org.iam-central.ga
 * getAllSubdomainsMap()
 * // → { 1: "org", 2: "region", 3: "client" }
 */
export function getAllSubdomainsMap(hostname?: string): Record<number, string> {
  return resolveSubdomains({ hostname }).byLevel;
}

// ── Hook React ─────────────────────────────────────────────────

/**
 * Hook React qui retourne la résolution de sous-domaines courante.
 * À utiliser dans les composants côté client uniquement.
 *
 * @param options Options de résolution (peuvent inclure les niveaux)
 *
 * @example
 * function TenantBadge() {
 *   const { byLevel, requested } = useSubdomains({ levels: [1, 2] });
 *   return <span>{requested.join(' / ')}</span>;
 * }
 */
export function useSubdomains(
  options: SubdomainResolverOptions = {},
): SubdomainResolution {
  // Pas de dépendances dynamiques — le hostname ne change pas pendant la vie du composant
  // (sauf en dev multi-tenants — dans ce cas, invalider le composant manuellement)
  return resolveSubdomains(options);
}

// ── Export par défaut ──────────────────────────────────────────
export default {
  resolveSubdomains,
  getSubdomainAt,
  getSubdomainsList,
  getTopSubdomain,
  getAllSubdomainsMap,
  useSubdomains,
};
