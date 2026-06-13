// types-detail.ts

export type CompteStatut = "actif" | "suspendu" | "inactif" | "bootstrap" | "expire";
export type ProfilType =
  | "etudiant" | "enseignant" | "enseignant_chercheur"
  | "personnel_admin" | "personnel_technique"
  | "direction" | "invite" | "systeme";
export type IamSyncStatus = "synced" | "pending" | "error" | "none";
export type AccountAction = "suspendre" | "reactiver" | "reset-password" | "supprimer";

export type ProfilPreview = {
  id: string;
  type: ProfilType;
  typeLabel: string;
  label: string;
  statut: CompteStatut;
  filiere?: string;
  anneeAcademique?: string;
  derniereConnexion: string | null;
};

export type CompteDetailFull = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  identifiant: string;
  username: string;
  statut: CompteStatut;

  // IAM Central
  userIdNational: string | null;
  iamSyncStatus: IamSyncStatus;
  iamSyncAt: string | null;
  snapshotIamCentral: Record<string, string> | null;

  // Indicators
  hasCredentials: boolean;
  requirePasswordChange: boolean;
  nbConnexions: number;
  isBootstrap: boolean;

  // Dates
  createdAt: string;
  updatedAt: string;
  premiereConnexion: string | null;
  derniereConnexion: string | null;
  updatedByLabel: string | null;
  updatedBy: string | null;

  // Content
  notes: string;
  metaData: Record<string, string | boolean | number>;
  preferences: Record<string, string | boolean>;

  profils: ProfilPreview[];
};

export type ModalPayload = {
  raison?: string;
  newPassword?: string;
};

export type ModalState = {
  action: AccountAction;
  compte: CompteDetailFull;
} | null;