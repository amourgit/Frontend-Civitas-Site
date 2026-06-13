"use client"

import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useAuthContext } from "@/lib/auth-store"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(
  prenom?: string | null,
  nom?: string | null,
  username?: string | null
): string {
  const first = prenom?.trim()?.[0] ?? ""
  const last  = nom?.trim()?.[0]  ?? ""
  if (first || last) return `${first}${last}`.toUpperCase()
  return (username?.trim()?.[0] ?? "U").toUpperCase()
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function statutColor(statut?: string): string {
  switch (statut?.toLowerCase()) {
    case "actif":    return "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
    case "inactif":  return "bg-gray-500/20   border-gray-400/30   text-gray-300"
    case "suspendu": return "bg-red-500/20    border-red-400/30    text-red-300"
    default:         return "bg-white/10      border-white/20      text-white/70"
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function UserProfileCard() {
  const { user, isLoading } = useAuthContext()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div
        className="w-[420px] max-w-[420px] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center py-12"
        style={{ backdropFilter: "blur(50px)" }}
      >
        <Loader2 className="h-6 w-6 text-white/40 animate-spin" />
      </div>
    )
  }

  // Données réelles Keycloak via AuthContext
  const fullName   = [user?.prenom, user?.nom].filter(Boolean).join(" ") || user?.username || "Utilisateur"
  const username   = user?.username ? `@${user.username}` : null
  const email      = user?.email
  const telephone  = (user as any)?.telephone as string | undefined
  const typeProfil = user?.type_profil
  const statut     = user?.statut
  const derniereCo = (user as any)?.derniere_connexion as string | undefined
  const premiereCo = (user as any)?.premiere_connexion as string | undefined
  const nbCo       = (user as any)?.nb_connexions
  const isAdmin    = user?.is_admin
  const userId     = user?.id
  const initials   = getInitials(user?.prenom, user?.nom, user?.username)

  const handleVoirPlus = () => {
    if (userId) navigate(`/modules/profils/${userId}`)
  }

  return (
    <div
      className="w-[420px] max-w-[420px] border border-white/10 rounded-xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.01] hover:border-white/20 shadow-2xl"
      style={{ backdropFilter: "blur(50px)" }}
    >
      <div className="p-6 space-y-5">

        {/* ── Avatar + Identité ──────────────────────────── */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl border border-white/20 bg-gradient-to-br from-blue-500/60 to-purple-600/60 backdrop-blur-xl shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white select-none">{initials}</span>
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black/40 ${
                statut?.toLowerCase() === "actif" ? "bg-emerald-400" : "bg-gray-500"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight truncate">{fullName}</h1>
              {username && (
                <p className="text-white/60 text-sm font-medium truncate">{username}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {typeProfil && (
                <Badge className="bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs px-2.5 py-0.5 font-medium">
                  {typeProfil}
                </Badge>
              )}
              {statut && (
                <Badge className={`border text-xs px-2.5 py-0.5 font-medium ${statutColor(statut)}`}>
                  {statut}
                </Badge>
              )}
              {isAdmin && (
                <Badge className="bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs px-2.5 py-0.5 font-medium">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ── Contact & Activité ─────────────────────────── */}
        <div className="space-y-2.5 rounded-xl p-4 border border-white/10">
          {email && (
            <div className="flex items-center gap-3 text-white/85 text-sm">
              <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="font-medium truncate">{email}</span>
            </div>
          )}
          {telephone && (
            <div className="flex items-center gap-3 text-white/85 text-sm">
              <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="font-medium">{telephone}</span>
            </div>
          )}
          {premiereCo && (
            <div className="flex items-center gap-3 text-white/85 text-sm">
              <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="font-medium">1ère connexion : {formatDate(premiereCo)}</span>
            </div>
          )}
          {derniereCo && (
            <div className="flex items-center gap-3 text-white/85 text-sm">
              <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="font-medium">Dernière connexion : {formatDate(derniereCo)}</span>
            </div>
          )}
          {nbCo !== null && nbCo !== undefined && (
            <div className="flex items-center gap-3 text-white/85 text-sm">
              <ShieldCheck className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="font-medium">
                {Number(nbCo) || 0} connexion{Number(nbCo) !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {!email && !telephone && !premiereCo && !derniereCo && nbCo == null && (
            <p className="text-white/40 text-sm text-center py-1">
              Aucune information disponible
            </p>
          )}
        </div>

        {/* ── Bouton Voir plus ───────────────────────────── */}
        <Button
          onClick={handleVoirPlus}
          disabled={!userId}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-medium transition-all duration-300 hover:scale-[1.01] shadow-md gap-2"
        >
          <User className="h-4 w-4" />
          Voir mon profil complet
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>

      </div>
    </div>
  )
}
