import { useMemo, useState } from "react";
import { mockUsers, type User } from "@/lib/users-data";
import { GlassCard } from "@/profils/ui/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search, UserPlus, MoreHorizontal, Trash2, Filter, Users as UsersIcon,
  Shield, Activity, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { AddUserDialog } from "@/profils/ProfilsCreation/add-user-dialog";
import { UserDetail } from "@/profils/ProfilsDetails/user-detail";


type FilterMode = "all" | "active" | "disabled";

export function ProfilsListeMainContent() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const [openAdd, setOpenAdd] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return users.filter(u => {
      if (filter === "active" && !u.enabled) return false;
      if (filter === "disabled" && u.enabled) return false;
      if (!q) return true;
      const attrHit = u.attributes.some(a =>
        a.key.toLowerCase().includes(q) || a.values.some(v => v.toLowerCase().includes(q))
      );
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        attrHit
      );
    });
  }, [users, query, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageUsers = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const allChecked = pageUsers.length > 0 && pageUsers.every(u => selected.has(u.id));

  const toggleAll = () => {
    const ids = pageUsers.map(u => u.id);
    const next = new Set(selected);
    if (allChecked) ids.forEach(id => next.delete(id));
    else ids.forEach(id => next.add(id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const deleteSelected = () => {
    setUsers(users.filter(u => !selected.has(u.id)));
    setSelected(new Set());
  };

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.enabled).length,
    sessions: users.reduce((acc, u) => acc + u.sessions.length, 0),
    pending: users.filter(u => u.requiredActions.length > 0).length,
  }), [users]);

  if (activeUser) {
    const fresh = users.find(u => u.id === activeUser.id) ?? activeUser;
    return (
      <Shell>
        <UserDetail
          user={fresh}
          onBack={() => setActiveUser(null)}
          onUpdate={(u) => setUsers(users.map(x => x.id === u.id ? u : x))}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8 animate-tab-in">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Realm administration</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            <span className="text-gradient">Accounts</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, credentials, roles and sessions.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)} className="bg-gradient-primary shadow-glow gap-2 h-11 px-5">
          <UserPlus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total users" value={stats.total} icon={UsersIcon} accent="primary" />
        <StatCard label="Active" value={stats.active} icon={Activity} accent="success" />
        <StatCard label="Live sessions" value={stats.sessions} icon={Shield} accent="accent" />
        <StatCard label="Pending actions" value={stats.pending} icon={Filter} accent="warning" />
      </div>

      {/* Toolbar */}
      <GlassCard strong className="mb-4 !p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search username, email, name, attribute…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              className="glass pl-10 h-11"
            />
          </div>
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            {(["all", "active", "disabled"] as FilterMode[]).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(0); }}
                className={`px-4 h-9 rounded-lg text-sm capitalize transition-all duration-300 ${
                  filter === f
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass gap-2 h-11" disabled={selected.size === 0}>
                Action
                <Badge className="bg-primary/30 text-primary-foreground">{selected.size}</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-strong">
              <DropdownMenuLabel>Bulk actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={deleteSelected} className="text-destructive gap-2">
                <Trash2 className="h-4 w-4" /> Delete selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard strong className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4 w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Roles</th>
                <th className="px-5 py-4">Sessions</th>
                <th className="px-5 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer"
                  onClick={() => setActiveUser(u)}
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggleOne(u.id)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-glow">
                        {(u.firstName[0] ?? u.username[0])}{(u.lastName[0] ?? "")}
                      </div>
                      <div>
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{u.email || "—"}</span>
                      {u.emailVerified ? (
                        <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">verified</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {u.enabled ? (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_oklch(0.72_0.18_155)]" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="glass">{u.roles.filter(r => r.assigned).length}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="glass">{u.sessions.length}</Badge>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-strong">
                        <DropdownMenuItem onClick={() => setActiveUser(u)}>Open</DropdownMenuItem>
                        <DropdownMenuItem onClick={() =>
                          setUsers(users.map(x => x.id === u.id ? { ...x, enabled: !x.enabled } : x))
                        }>
                          {u.enabled ? "Disable" : "Enable"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setUsers(users.filter(x => x.id !== u.id))}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {pageUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/10 text-sm">
          <span className="text-muted-foreground">
            Showing <span className="text-foreground font-medium">{pageUsers.length}</span> of{" "}
            <span className="text-foreground font-medium">{filtered.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-16 text-center">
              Page {page + 1} / {pages}
            </span>
            <Button size="icon" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      <AddUserDialog
        open={openAdd}
        onOpenChange={setOpenAdd}
        onCreate={(u) => setUsers([u, ...users])}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* floating ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-success/15 blur-[100px] animate-float" style={{ animationDelay: "4s" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: number; icon: any; accent: "primary" | "success" | "accent" | "warning";
}) {
  const accentMap = {
    primary: "from-primary/30 to-primary/10 text-primary",
    success: "from-success/30 to-success/10 text-success",
    accent: "from-accent/30 to-accent/10 text-accent",
    warning: "from-warning/30 to-warning/10 text-warning",
  };
  return (
    <GlassCard hover className="!p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`rounded-lg p-2 bg-gradient-to-br ${accentMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </GlassCard>
  );
}


export default ProfilsListeMainContent;