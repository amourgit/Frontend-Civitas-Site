"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  MapPin,
  Activity,
  MoreVertical,
  Search,
  LayoutGrid,
  LayoutList,
  Wifi,
  Grid3X3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronDown,
  ArrowUpDown,
  HardDrive,
  Network,
  Lock,
  Ban,
  Trash2,
} from "lucide-react"
import { useIAMSessions } from '@/hooks/useIAMAuth'
import { useToast } from '@/components/ui/toast'
import type { Session } from '@/lib/models/iam/auth.model'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Line,
  LineChart,
  Bar,
  BarChart,
} from "recharts"

// ── Détection appareil depuis User-Agent (de SessionsPageContent.tsx) ──────────────────
function getDeviceType(ua?: string): 'mobile' | 'tablet' | 'desktop' {
  const u = (ua || '').toLowerCase();
  if (u.includes('ipad') || u.includes('tablet') || (u.includes('android') && !u.includes('mobile'))) return 'tablet';
  if (u.includes('mobile') || u.includes('android') || u.includes('iphone')) return 'mobile';
  return 'desktop';
}

function getBrowserName(ua?: string): string {
  const u = ua || '';
  if (u.includes('Chrome') && !u.includes('Edg') && !u.includes('OPR')) return 'Chrome';
  if (u.includes('Firefox')) return 'Firefox';
  if (u.includes('Safari') && !u.includes('Chrome')) return 'Safari';
  if (u.includes('Edg')) return 'Edge';
  if (u.includes('OPR') || u.includes('Opera')) return 'Opera';
  return 'Navigateur inconnu';
}

function getOSName(ua?: string): string {
  const u = ua || '';
  if (u.includes('Windows NT')) return 'Windows';
  if (u.includes('Mac OS')) return 'macOS';
  if (u.includes('Linux') && !u.includes('Android')) return 'Linux';
  if (u.includes('Android')) return 'Android';
  if (u.includes('iOS') || u.includes('iPhone') || u.includes('iPad')) return 'iOS';
  return 'OS inconnu';
}

function DeviceIcon({ ua, className }: { ua?: string; className?: string }) {
  const type = getDeviceType(ua);
  if (type === 'mobile') return <Smartphone className={className || 'w-5 h-5'} />;
  if (type === 'tablet') return <Tablet className={className || 'w-5 h-5'} />;
  return <Monitor className={className || 'w-5 h-5'} />;
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Status Badge Component (adapté pour format Session API)
function StatusBadge({ status }: { status?: string }) {
  const isActive = status !== 'revoked' && status !== 'expired';
  const config = isActive 
    ? { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2, label: "Actif" }
    : { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: status || 'Inconnu' };
  
  const { color, icon: Icon, label } = config;
  return (
    <Badge variant="outline" className={`${color} flex items-center gap-1 border`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

// Mini Sparkline Chart
function MiniSparkline({ data, color }: { data: { time: string; value?: number; requests?: number }[]; color: string }) {
  return (
    <div className="w-20 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={data[0]?.value !== undefined ? "value" : "requests"}
            stroke={color}
            fill={`url(#gradient-${color})`}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "A l'instant"
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

// Format bytes
function formatBytes(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
  return `${mb} MB`
}

// Session Card View
function SessionCard({ session, onRevoke, onViewDetails, currentSessionId }: { session: Session; onRevoke: () => void; onViewDetails: () => void; currentSessionId?: string | undefined }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-white/5 backdrop-blur-md rounded-lg border shadow-lg ${
        session.status === "active" 
          ? "border-emerald-500/20 shadow-emerald-500/10"
          : "border-white/10"
      }`}
    >
      {session.id === currentSessionId && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
      )}
      
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              session.status === "active" 
                ? "bg-emerald-500/20" 
                : session.status === "revoked" || session.status === "expired"
                  ? "bg-red-500/20"
                  : "bg-slate-700/50"
            }`}>
              <DeviceIcon 
                ua={session.user_agent} 
                className={`w-5 h-5 ${
                  session.status === "active" 
                    ? "text-emerald-400" 
                    : session.status === "revoked" || session.status === "expired"
                      ? "text-red-400"
                      : "text-slate-400"
                }`} 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">{getBrowserName(session.user_agent)} · {getOSName(session.user_agent)}</h3>
                {session.id === currentSessionId && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0">
                    Session actuelle
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">{getBrowserName(session.user_agent)}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
              <DropdownMenuItem onClick={onViewDetails} className="text-slate-300 focus:text-white">
                <Eye className="w-4 h-4 mr-2" />
                Voir details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                onClick={onRevoke} 
                className="text-red-400 focus:text-red-300"
                disabled={session.isCurrentSession}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Revoquer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status & Risk */}
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={session.status} />
        </div>

        {/* Location & IP */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span className="text-slate-300">Localisation non disponible</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400 font-mono text-[10px]">{session.ip_address || 'IP inconnue'}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Requetes</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{session.activity_count || 0}</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Donnees</span>
              <HardDrive className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Non disponible</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Latence</span>
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-white">Non disponible</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Connecte: {formatRelative(session.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Actif: {formatRelative(session.last_activity)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Session List Row
function SessionListRow({ session, onRevoke, onViewDetails, currentSessionId }: { session: Session; onRevoke: () => void; onViewDetails: () => void; currentSessionId?: string | undefined }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-slate-800/30 ${
        session.isCurrentSession
          ? "bg-emerald-500/5 border-emerald-500/30"
          : session.riskLevel === "high"
            ? "bg-red-500/5 border-red-500/20"
            : "bg-slate-900/50 border-white/5"
      }`}
    >
      {/* Device */}
      <div className={`p-2.5 rounded-lg shrink-0 ${
        session.status === "active" 
          ? "bg-emerald-500/20" 
          : session.status === "revoked" || session.status === "expired"
            ? "bg-red-500/20"
            : "bg-slate-700/50"
      }`}>
        <DeviceIcon 
          ua={session.user_agent} 
          className={`w-5 h-5 ${
            session.status === "active" 
              ? "text-emerald-400" 
              : session.status === "revoked" || session.status === "expired"
                ? "text-red-400"
                : "text-slate-400"
          }`} 
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-white truncate">{getBrowserName(session.user_agent)} · {getOSName(session.user_agent)}</h3>
          {session.isCurrentSession && (
            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0 shrink-0">
              Actuelle
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{getBrowserName(session.user_agent)}</span>
          <span className="text-slate-600">|</span>
          <span>{getOSName(session.user_agent)}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono">{session.ip_address || 'IP inconnue'}</span>
        </div>
      </div>

      {/* Location */}
      <div className="hidden md:flex items-center gap-2 text-sm text-slate-300 shrink-0">
        <MapPin className="w-4 h-4 text-slate-500" />
        Localisation non disponible
      </div>

      {/* Metrics */}
      <div className="hidden lg:flex items-center gap-6 shrink-0">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Requetes</div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-white">{session.activity_count || 0}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Donnees</div>
          <span className="text-sm font-semibold text-white">Non disponible</span>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Latence</div>
          <span className="text-sm font-semibold text-white">Non disponible</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={session.status} />
      </div>

      {/* Time */}
      <div className="hidden xl:block text-xs text-slate-500 shrink-0 w-24 text-right">
        {formatRelative(session.last_activity)}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
          <DropdownMenuItem onClick={onViewDetails} className="text-slate-300 focus:text-white">
            <Eye className="w-4 h-4 mr-2" />
            Voir details
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem 
            onClick={onRevoke} 
            className="text-red-400 focus:text-red-300"
            disabled={session.isCurrentSession}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Revoquer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

// Session Grid Mini Card
function SessionGridCard({ session, onRevoke, onViewDetails, currentSessionId }: { session: Session; onRevoke: () => void; onViewDetails: () => void; currentSessionId?: string | undefined }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-lg border p-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
        session.isCurrentSession
          ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
          : session.riskLevel === "high"
            ? "border-red-500/30"
            : "border-white/10"
      }`}
      onClick={onViewDetails}
    >
      {session.isCurrentSession && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-lg" />
      )}

      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${
          session.status === "active" 
            ? "bg-emerald-500/20" 
            : session.status === "suspicious"
              ? "bg-red-500/20"
              : "bg-slate-700/50"
        }`}>
          <DeviceIcon 
            ua={session.user_agent} 
            className={`w-4 h-4 ${
              session.status === "active" 
                ? "text-emerald-400" 
                : session.status === "suspicious"
                  ? "text-red-400"
                  : "text-slate-400"
            }`} 
          />
        </div>
        <div className="flex items-center gap-1">
        </div>
      </div>

      <h3 className="font-medium text-white text-sm truncate mb-1">{getBrowserName(session.user_agent)} · {getOSName(session.user_agent)}</h3>
      <p className="text-[10px] text-slate-500 mb-2">Localisation non disponible</p>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            session.status === "active" ? "bg-emerald-400" : 
            session.status === "suspicious" ? "bg-red-400" : "bg-amber-400"
          }`} />
          <span className="text-[10px] text-slate-400">{formatRelative(session.last_activity)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div className="bg-slate-800/50 rounded px-1.5 py-1 flex items-center justify-between">
          <span className="text-slate-500">Req</span>
          <span className="text-white font-medium">{session.activity_count || 0}</span>
        </div>
        <div className="bg-slate-800/50 rounded px-1.5 py-1 flex items-center justify-between">
          <span className="text-slate-500">Lat</span>
          <span className="text-white font-medium">Non disponible</span>
        </div>
      </div>

      {!session.isCurrentSession && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={(e) => { e.stopPropagation(); onRevoke(); }}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Revoquer
        </Button>
      )}
    </motion.div>
  )
}

// Stats Overview Cards
function StatsOverview({ sessions }: { sessions: Session[] }) {
  const stats = useMemo(() => {
    const active = sessions.filter(s => s.status === "active").length
    const suspicious = sessions.filter(s => s.status === "suspicious").length
    const revoked = sessions.filter(s => s.status === "revoked").length
    const totalRequests = sessions.reduce((acc, s) => acc + (s.activity_count || 0), 0)
    const avgLatency = 0
    const withVPN = 0

    return { active, suspicious, revoked, totalRequests, avgLatency, withVPN, total: sessions.length }
  }, [sessions])

  const activityData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      sessions: Math.floor(Math.random() * 10) + 2,
      requests: Math.floor(Math.random() * 500) + 100,
    }))
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-xs text-emerald-400/80">Sessions actives</p>
          <div className="mt-1 h-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData.slice(-8)}>
                <Bar dataKey="sessions" fill="#34d399" radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-xl font-bold text-white">{stats.suspicious}</span>
          </div>
          <p className="text-xs text-red-400/80">Activites suspectes</p>
          <Progress value={stats.suspicious / stats.total * 100} className="h-1 mt-2 bg-red-950" />
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xl font-bold text-white">{(stats.totalRequests / 1000).toFixed(1)}k</span>
          </div>
          <p className="text-xs text-amber-400/80">Requetes totales</p>
          <div className="mt-1 h-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData.slice(-8)}>
                <Line type="monotone" dataKey="requests" stroke="#fbbf24" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <span className="text-2xl font-bold text-white">Non disponible</span>
          </div>
          <p className="text-xs text-cyan-400/80">Donnees transferees</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">+12.3% cette semaine</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xl font-bold text-white">{stats.avgLatency}ms</span>
          </div>
          <p className="text-xs text-purple-400/80">Latence moyenne</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] text-emerald-400">-5ms vs hier</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="text-xl font-bold text-white">Non disponible</span>
          </div>
          <p className="text-xs text-blue-400/80">Sessions 2FA</p>
          <Progress value={0} className="h-1 mt-2 bg-blue-950" />
        </CardContent>
      </Card>
    </div>
  )
}

// Session Details Dialog
function SessionDetailsDialog({ session, open, onClose, currentSessionId }: { session: Session | null; open: boolean; onClose: () => void; currentSessionId?: string | undefined }) {
  if (!session) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className={`p-2 rounded-lg ${
              session.status === "active" ? "bg-emerald-500/20" : 
              session.status === "suspicious" ? "bg-red-500/20" : "bg-slate-700/50"
            }`}>
              <DeviceIcon type={session.deviceType} className={`w-5 h-5 ${
                session.status === "active" ? "text-emerald-400" : 
                session.status === "suspicious" ? "text-red-400" : "text-slate-400"
              }`} />
            </div>
            {session.deviceName}
            {session.isCurrentSession && (
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Session actuelle</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Informations detaillees de la session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Row */}
          <div className="flex items-center gap-3">
            <StatusBadge status={session.status} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Navigateur</div>
                <div className="text-sm text-white">{getBrowserName(session.user_agent)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Systeme</div>
                <div className="text-sm text-white">{getOSName(session.user_agent)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Adresse IP</div>
                <div className="text-sm text-white font-mono">{session.ip_address || 'IP inconnue'}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Localisation</div>
                <div className="text-sm text-white">Localisation non disponible</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Premiere connexion</div>
                <div className="text-sm text-white">{formatDate(session.created_at)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Derniere activite</div>
                <div className="text-sm text-white">{formatRelative(session.last_activity)}</div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Activite des dernieres 24h</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[]}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <RechartsTooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#22d3ee" fill="url(#activityGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{session.activity_count || 0}</div>
              <div className="text-xs text-slate-500">Requetes</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">Non disponible</div>
              <div className="text-xs text-slate-500">Donnees</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">Non disponible</div>
              <div className="text-xs text-slate-500">Latence</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">Non disponible</div>
              <div className="text-xs text-slate-500">Echecs</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Fermer
          </Button>
          {session.id !== currentSessionId && (
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4 mr-2" />
              Revoquer la session
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Component (adapté pour useIAMSessions)
export function ActiveSessions() {
  const { sessions, isLoading, error, currentSessionId, fetchSessions, revokeSession } = useIAMSessions();
  const { toast } = useToast();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "grid">("cards")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("last_activity")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null)

  useEffect(() => { 
    fetchSessions(); 
  }, [fetchSessions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSessions();
    setIsRefreshing(false);
  }

  const handleRevoke = (session: Session) => {
    setSessionToRevoke(session)
    setRevokeDialogOpen(true)
  }

  const confirmRevoke = async () => {
    if (sessionToRevoke) {
      setRevokingId(sessionToRevoke.id);
      const result = await revokeSession(sessionToRevoke.id);
      if (result.success) {
        toast({ 
          variant: 'success', 
          title: 'Session révoquée', 
          description: 'Déconnexion effectuée.', 
          duration: 3000 
        });
        setRevokeDialogOpen(false);
        setSessionToRevoke(null);
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Erreur', 
          description: result.error || 'Impossible de révoquer la session.' 
        });
      }
      setRevokingId(null);
    }
  }

  const filteredSessions = useMemo(() => {
    let result = [...sessions]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s => {
        const browser = getBrowserName(s.user_agent)
        const os = getOSName(s.user_agent)
        return (
          browser.toLowerCase().includes(query) ||
          os.toLowerCase().includes(query) ||
          (s.ip_address && s.ip_address.toLowerCase().includes(query)) ||
          (s.id && s.id.toLowerCase().includes(query))
        )
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "last_activity":
          const aTime = a.last_activity ? new Date(a.last_activity).getTime() : 0
          const bTime = b.last_activity ? new Date(b.last_activity).getTime() : 0
          return bTime - aTime
        case "created_at":
          const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0
          const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0
          return bCreated - aCreated
        case "activity_count":
          return (b.activity_count || 0) - (a.activity_count || 0)
        default:
          return 0
      }
    })

    // Current session always first
    const currentIndex = result.findIndex(s => s.id === currentSessionId)
    if (currentIndex > 0) {
      const [current] = result.splice(currentIndex, 1)
      result.unshift(current)
    }

    return result
  }, [sessions, searchQuery, statusFilter, sortBy])

  return (
    <TooltipProvider>
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Mes Sessions Actives</h1>
                <p className="text-slate-400 text-sm">Gerez et surveillez vos sessions de connexion en temps reel</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2 py-1 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  API: GET /tokens/sessions
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview sessions={sessions} />

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4 p-3 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 shadow-lg">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Rechercher par appareil, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-slate-500 text-sm h-9"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] bg-white/5 backdrop-blur-sm border-white/10 text-white text-sm h-9">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="idle">Inactif</SelectItem>
                  <SelectItem value="suspicious">Suspect</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-slate-800/50 border-slate-700 text-white">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="lastActivity">Derniere activite</SelectItem>
                  <SelectItem value="createdAt">Date de connexion</SelectItem>
                  <SelectItem value="requests">Nombre de requetes</SelectItem>
                  <SelectItem value="risk">Niveau de risque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                <TabsList className="bg-slate-800/50 border border-slate-700">
                  <TabsTrigger value="cards" className="data-[state=active]:bg-slate-700">
                    <LayoutList className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="data-[state=active]:bg-slate-700">
                    <LayoutGrid className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="data-[state=active]:bg-slate-700">
                    <Grid3X3 className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                <Ban className="w-4 h-4 mr-2" />
                Revoquer tout
              </Button>
            </div>
          </div>

          {/* Sessions Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              {filteredSessions.length} session{filteredSessions.length > 1 ? "s" : ""} trouvee{filteredSessions.length > 1 ? "s" : ""}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="text-slate-400 hover:text-white"
              >
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Sessions Display */}
          <AnimatePresence mode="popLayout">
            {viewMode === "cards" && (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onRevoke={() => handleRevoke(session)}
                    onViewDetails={() => setSelectedSession(session)}
                    currentSessionId={currentSessionId}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {filteredSessions.map((session) => (
                  <SessionListRow
                    key={session.id}
                    session={session}
                    onRevoke={() => handleRevoke(session)}
                    onViewDetails={() => setSelectedSession(session)}
                    currentSessionId={currentSessionId}
                  />
                ))}
              </motion.div>
            )}

            {viewMode === "grid" && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
              >
                {filteredSessions.map((session) => (
                  <SessionGridCard
                    key={session.id}
                    session={session}
                    onRevoke={() => handleRevoke(session)}
                    onViewDetails={() => setSelectedSession(session)}
                    currentSessionId={currentSessionId}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Aucune session trouvee</h3>
              <p className="text-slate-400 text-sm">Essayez de modifier vos criteres de recherche</p>
            </div>
          )}
        </div>

        {/* Session Details Dialog */}
        <SessionDetailsDialog
          session={selectedSession}
          open={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          currentSessionId={currentSessionId}
        />

        {/* Revoke Confirmation Dialog */}
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Confirmer la revocation
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Etes-vous sur de vouloir revoquer cette session ? L&apos;utilisateur sera deconnecte immediatement.
              </DialogDescription>
            </DialogHeader>
            {sessionToRevoke && (
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg my-4">
                <DeviceIcon ua={sessionToRevoke.user_agent} className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">{getBrowserName(sessionToRevoke.user_agent)} · {getOSName(sessionToRevoke.user_agent)}</p>
                  <p className="text-xs text-slate-500">{sessionToRevoke.ip_address || 'IP inconnue'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeDialogOpen(false)} className="border-slate-700 text-slate-300">
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmRevoke} className="bg-red-600 hover:bg-red-700">
                <XCircle className="w-4 h-4 mr-2" />
                Revoquer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default ActiveSessions
