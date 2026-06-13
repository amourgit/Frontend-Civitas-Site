export type RequiredAction =
  | "UPDATE_PASSWORD"
  | "VERIFY_EMAIL"
  | "UPDATE_PROFILE"
  | "CONFIGURE_TOTP"
  | "TERMS_AND_CONDITIONS";

export type CredentialType = "password" | "otp" | "webauthn" | "recovery-codes";

export interface Credential {
  id: string;
  type: CredentialType;
  userLabel: string;
  createdAt: string;
  lastUsed?: string;
}

export interface RoleMapping {
  id: string;
  name: string;
  description?: string;
  scope: "realm" | "client";
  client?: string;
  assigned: boolean;
}

export interface Group {
  id: string;
  name: string;
  path: string;
  member: boolean;
}

export interface Consent {
  id: string;
  client: string;
  grantedAt: string;
  scopes: string[];
}

export interface Session {
  id: string;
  ip: string;
  startedAt: string;
  lastAccess: string;
  clients: string[];
}

export interface AdminEvent {
  id: string;
  time: string;
  operation: string;
  resource: string;
  by: string;
}

export interface UserAttribute {
  key: string;
  values: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  enabled: boolean;
  createdAt: string;
  requiredActions: RequiredAction[];
  attributes: UserAttribute[];
  credentials: Credential[];
  roles: RoleMapping[];
  groups: Group[];
  consents: Consent[];
  sessions: Session[];
  adminEvents: AdminEvent[];
}

const now = new Date();
const iso = (daysAgo: number) =>
  new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const mockUsers: User[] = [
  {
    id: "u_1",
    username: "alice.martin",
    email: "alice.martin@acme.io",
    firstName: "Alice",
    lastName: "Martin",
    emailVerified: true,
    enabled: true,
    createdAt: iso(120),
    requiredActions: [],
    attributes: [
      { key: "department", values: ["Engineering"] },
      { key: "phone", values: ["+33 6 12 34 56 78"] },
      { key: "locale", values: ["fr_FR"] },
    ],
    credentials: [
      { id: "c1", type: "password", userLabel: "Primary password", createdAt: iso(120), lastUsed: iso(0) },
      { id: "c2", type: "otp", userLabel: "Authy", createdAt: iso(60), lastUsed: iso(2) },
      { id: "c3", type: "webauthn", userLabel: "MacBook TouchID", createdAt: iso(40), lastUsed: iso(1) },
    ],
    roles: [
      { id: "r1", name: "admin", description: "Full administrator", scope: "realm", assigned: true },
      { id: "r2", name: "user", description: "Default user role", scope: "realm", assigned: true },
      { id: "r3", name: "manage-account", scope: "client", client: "account", assigned: true },
      { id: "r4", name: "view-profile", scope: "client", client: "account", assigned: false },
      { id: "r5", name: "offline_access", scope: "realm", assigned: false },
    ],
    groups: [
      { id: "g1", name: "Engineers", path: "/Engineers", member: true },
      { id: "g2", name: "Admins", path: "/Admins", member: true },
      { id: "g3", name: "Marketing", path: "/Marketing", member: false },
      { id: "g4", name: "Support", path: "/Support", member: false },
    ],
    consents: [
      { id: "co1", client: "web-portal", grantedAt: iso(30), scopes: ["openid", "profile", "email"] },
      { id: "co2", client: "mobile-app", grantedAt: iso(10), scopes: ["openid", "offline_access"] },
    ],
    sessions: [
      { id: "s1", ip: "82.65.144.12", startedAt: iso(0), lastAccess: iso(0), clients: ["web-portal", "account"] },
      { id: "s2", ip: "192.168.1.34", startedAt: iso(1), lastAccess: iso(0), clients: ["mobile-app"] },
    ],
    adminEvents: [
      { id: "e1", time: iso(2), operation: "UPDATE", resource: "user", by: "admin" },
      { id: "e2", time: iso(7), operation: "ACTION", resource: "reset-password", by: "admin" },
      { id: "e3", time: iso(30), operation: "CREATE", resource: "user", by: "system" },
    ],
  },
  {
    id: "u_2",
    username: "bob.lefevre",
    email: "bob@acme.io",
    firstName: "Bob",
    lastName: "Lefèvre",
    emailVerified: false,
    enabled: true,
    createdAt: iso(45),
    requiredActions: ["VERIFY_EMAIL"],
    attributes: [{ key: "department", values: ["Sales"] }],
    credentials: [
      { id: "c1", type: "password", userLabel: "Primary password", createdAt: iso(45), lastUsed: iso(3) },
    ],
    roles: [{ id: "r2", name: "user", scope: "realm", assigned: true }],
    groups: [{ id: "g5", name: "Sales", path: "/Sales", member: true }],
    consents: [],
    sessions: [
      { id: "s1", ip: "10.0.0.5", startedAt: iso(3), lastAccess: iso(3), clients: ["web-portal"] },
    ],
    adminEvents: [{ id: "e1", time: iso(45), operation: "CREATE", resource: "user", by: "admin" }],
  },
  {
    id: "u_3",
    username: "carla.dubois",
    email: "carla.dubois@acme.io",
    firstName: "Carla",
    lastName: "Dubois",
    emailVerified: true,
    enabled: false,
    createdAt: iso(300),
    requiredActions: ["UPDATE_PASSWORD"],
    attributes: [
      { key: "department", values: ["HR"] },
      { key: "city", values: ["Lyon", "Paris"] },
    ],
    credentials: [
      { id: "c1", type: "password", userLabel: "Primary password", createdAt: iso(300), lastUsed: iso(120) },
      { id: "c2", type: "recovery-codes", userLabel: "Recovery codes", createdAt: iso(200) },
    ],
    roles: [
      { id: "r2", name: "user", scope: "realm", assigned: true },
      { id: "r6", name: "hr-manager", scope: "client", client: "hr-app", assigned: true },
    ],
    groups: [{ id: "g6", name: "HR", path: "/HR", member: true }],
    consents: [{ id: "co1", client: "hr-app", grantedAt: iso(180), scopes: ["openid", "profile"] }],
    sessions: [],
    adminEvents: [
      { id: "e1", time: iso(5), operation: "UPDATE", resource: "user", by: "admin" },
      { id: "e2", time: iso(120), operation: "DISABLE", resource: "user", by: "admin" },
    ],
  },
  {
    id: "u_4",
    username: "david.nguyen",
    email: "david.nguyen@acme.io",
    firstName: "David",
    lastName: "Nguyen",
    emailVerified: true,
    enabled: true,
    createdAt: iso(15),
    requiredActions: ["CONFIGURE_TOTP", "UPDATE_PROFILE"],
    attributes: [{ key: "department", values: ["Engineering"] }],
    credentials: [
      { id: "c1", type: "password", userLabel: "Primary", createdAt: iso(15), lastUsed: iso(0) },
    ],
    roles: [{ id: "r2", name: "user", scope: "realm", assigned: true }],
    groups: [{ id: "g1", name: "Engineers", path: "/Engineers", member: true }],
    consents: [],
    sessions: [
      { id: "s1", ip: "172.16.4.12", startedAt: iso(0), lastAccess: iso(0), clients: ["web-portal"] },
    ],
    adminEvents: [{ id: "e1", time: iso(15), operation: "CREATE", resource: "user", by: "admin" }],
  },
  {
    id: "u_5",
    username: "elena.rossi",
    email: "elena.rossi@acme.io",
    firstName: "Elena",
    lastName: "Rossi",
    emailVerified: true,
    enabled: true,
    createdAt: iso(220),
    requiredActions: [],
    attributes: [{ key: "department", values: ["Design"] }],
    credentials: [
      { id: "c1", type: "password", userLabel: "Primary", createdAt: iso(220), lastUsed: iso(0) },
      { id: "c2", type: "webauthn", userLabel: "YubiKey 5C", createdAt: iso(100), lastUsed: iso(0) },
    ],
    roles: [
      { id: "r2", name: "user", scope: "realm", assigned: true },
      { id: "r7", name: "designer", scope: "client", client: "figma-sync", assigned: true },
    ],
    groups: [{ id: "g7", name: "Design", path: "/Design", member: true }],
    consents: [{ id: "co1", client: "figma-sync", grantedAt: iso(90), scopes: ["openid", "profile"] }],
    sessions: [
      { id: "s1", ip: "82.65.10.4", startedAt: iso(0), lastAccess: iso(0), clients: ["web-portal", "figma-sync"] },
    ],
    adminEvents: [{ id: "e1", time: iso(220), operation: "CREATE", resource: "user", by: "system" }],
  },
];

export const REQUIRED_ACTIONS: { value: RequiredAction; label: string }[] = [
  { value: "UPDATE_PASSWORD", label: "Update password" },
  { value: "VERIFY_EMAIL", label: "Verify email" },
  { value: "UPDATE_PROFILE", label: "Update profile" },
  { value: "CONFIGURE_TOTP", label: "Configure OTP" },
  { value: "TERMS_AND_CONDITIONS", label: "Accept terms" },
];

export const ALL_GROUPS = [
  { id: "g1", name: "Engineers", path: "/Engineers" },
  { id: "g2", name: "Admins", path: "/Admins" },
  { id: "g3", name: "Marketing", path: "/Marketing" },
  { id: "g4", name: "Support", path: "/Support" },
  { id: "g5", name: "Sales", path: "/Sales" },
  { id: "g6", name: "HR", path: "/HR" },
  { id: "g7", name: "Design", path: "/Design" },
];
