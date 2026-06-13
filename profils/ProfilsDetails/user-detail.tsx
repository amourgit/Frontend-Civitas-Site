import { useState } from "react";
import type { User, RequiredAction, UserAttribute, Credential } from "@/lib/users-data";
import { ALL_GROUPS, REQUIRED_ACTIONS } from "@/lib/users-data";
import { GlassCard, SectionHeader } from "@/profils/ui/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User as UserIcon, KeyRound, Tag, Shield, Users as UsersIcon,
  CheckSquare, Activity, History, UserCog, Plus, Trash2, X, Mail,
  Smartphone, Fingerprint, Power, LogOut, AlertTriangle, Save, ChevronLeft
} from "lucide-react";

interface UserDetailProps {
  user: User;
  onBack: () => void;
  onUpdate: (u: User) => void;
}

const tabs = [
  { value: "details", label: "Details", icon: UserIcon },
  { value: "attributes", label: "Attributes", icon: Tag },
  { value: "credentials", label: "Credentials", icon: KeyRound },
  { value: "roles", label: "Role Mappings", icon: Shield },
  { value: "groups", label: "Groups", icon: UsersIcon },
  { value: "consents", label: "Consents", icon: CheckSquare },
  { value: "sessions", label: "Sessions", icon: Activity },
  { value: "events", label: "Admin Events", icon: History },
  { value: "impersonate", label: "Impersonation", icon: UserCog },
];

const credIcon = (t: Credential["type"]) => {
  if (t === "password") return KeyRound;
  if (t === "otp") return Smartphone;
  if (t === "webauthn") return Fingerprint;
  return Mail;
};

const fmtDate = (s: string) => new Date(s).toLocaleString();

export function UserDetail({ user, onBack, onUpdate }: UserDetailProps) {
  const [tab, setTab] = useState("details");

  return (
    <div className="space-y-6 animate-tab-in">
      {/* Header */}
      <GlassCard strong className="!p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-glow">
                {user.firstName?.[0] ?? user.username[0]}
                {user.lastName?.[0] ?? ""}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>@{user.username}</span>
                  <span>•</span>
                  <span>{user.email || "no email"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.enabled ? (
              <Badge className="bg-success/20 text-success border-success/30">Active</Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground">Disabled</Badge>
            )}
            {user.emailVerified ? (
              <Badge className="bg-accent/20 text-accent border-accent/30">Verified</Badge>
            ) : (
              <Badge variant="outline" className="border-warning/40 text-warning">Unverified</Badge>
            )}
          </div>
        </div>
      </GlassCard>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <GlassCard className="!p-2">
          <TabsList className="bg-transparent h-auto w-full flex flex-wrap gap-1 p-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-xl px-4 py-2.5 transition-all duration-300 gap-2 flex-1 min-w-[120px]"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </GlassCard>

        <TabsContent value="details" className="animate-tab-in">
          <DetailsTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="attributes" className="animate-tab-in">
          <AttributesTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="credentials" className="animate-tab-in">
          <CredentialsTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="roles" className="animate-tab-in">
          <RolesTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="groups" className="animate-tab-in">
          <GroupsTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="consents" className="animate-tab-in">
          <ConsentsTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="sessions" className="animate-tab-in">
          <SessionsTab user={user} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="events" className="animate-tab-in">
          <EventsTab user={user} />
        </TabsContent>
        <TabsContent value="impersonate" className="animate-tab-in">
          <ImpersonateTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Details ---------- */
function DetailsTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [draft, setDraft] = useState(user);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <GlassCard className="lg:col-span-2">
        <SectionHeader title="General information" description="Core identity fields" icon={<UserIcon className="h-4 w-4 text-primary-foreground" />} />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Username">
            <Input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} className="glass" />
          </Field>
          <Field label="Email">
            <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="glass" />
          </Field>
          <Field label="First name">
            <Input value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} className="glass" />
          </Field>
          <Field label="Last name">
            <Input value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} className="glass" />
          </Field>
        </div>

        <div className="grid gap-3 mt-6 md:grid-cols-2">
          <ToggleRow label="Email verified" desc="Treat the email as verified" checked={draft.emailVerified} onChange={(v) => setDraft({ ...draft, emailVerified: v })} />
          <ToggleRow label="User enabled" desc="Allow this user to sign in" checked={draft.enabled} onChange={(v) => setDraft({ ...draft, enabled: v })} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => onUpdate(draft)} className="bg-gradient-primary shadow-glow gap-2">
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard>
          <SectionHeader title="Required actions" description="Forced on next login" icon={<AlertTriangle className="h-4 w-4 text-primary-foreground" />} />
          <div className="space-y-2">
            {REQUIRED_ACTIONS.map((a) => {
              const checked = draft.requiredActions.includes(a.value);
              return (
                <label key={a.value} className="flex items-center gap-3 glass rounded-xl px-3 py-2.5 cursor-pointer glass-hover">
                  <Checkbox checked={checked} onCheckedChange={(c) => {
                    const next = c ? [...draft.requiredActions, a.value as RequiredAction] : draft.requiredActions.filter(x => x !== a.value);
                    setDraft({ ...draft, requiredActions: next });
                  }} />
                  <span className="text-sm">{a.label}</span>
                </label>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Custom attributes" description="From user profile" icon={<Tag className="h-4 w-4 text-primary-foreground" />} />
          {user.attributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attributes defined.</p>
          ) : (
            <div className="space-y-2">
              {user.attributes.map((a) => (
                <div key={a.key} className="glass rounded-lg px-3 py-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{a.key}</span>
                  <span className="font-medium">{a.values.join(", ")}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between">
      <div>
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ---------- Attributes ---------- */
function AttributesTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [attrs, setAttrs] = useState<UserAttribute[]>(user.attributes);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const save = (next: UserAttribute[]) => {
    setAttrs(next);
    onUpdate({ ...user, attributes: next });
  };

  const addAttr = () => {
    if (!newKey.trim()) return;
    const existing = attrs.find(a => a.key === newKey);
    const next = existing
      ? attrs.map(a => a.key === newKey ? { ...a, values: [...a.values, newVal] } : a)
      : [...attrs, { key: newKey, values: [newVal || ""] }];
    save(next);
    setNewKey(""); setNewVal("");
  };

  return (
    <GlassCard>
      <SectionHeader
        title="Custom attributes"
        description="Add multiple values per key"
        icon={<Tag className="h-4 w-4 text-primary-foreground" />}
      />
      <div className="space-y-3 mb-6">
        {attrs.map((a, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{a.key}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => save(attrs.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.values.map((v, vi) => (
                <Badge key={vi} variant="outline" className="gap-2 py-1.5 pl-3 glass">
                  {v}
                  <button onClick={() => {
                    const nv = a.values.filter((_, x) => x !== vi);
                    const next = nv.length ? attrs.map((x, idx) => idx === i ? { ...x, values: nv } : x) : attrs.filter((_, idx) => idx !== i);
                    save(next);
                  }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={() => save(attrs.map((x, idx) => idx === i ? { ...x, values: [...x.values, ""] } : x))}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                + add value
              </button>
            </div>
          </div>
        ))}
        {attrs.length === 0 && <p className="text-sm text-muted-foreground">No attributes yet.</p>}
      </div>

      <div className="glass-strong rounded-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <Input placeholder="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="glass" />
        <Input placeholder="Value" value={newVal} onChange={(e) => setNewVal(e.target.value)} className="glass" />
        <Button onClick={addAttr} className="bg-gradient-primary gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </GlassCard>
  );
}

/* ---------- Credentials ---------- */
function CredentialsTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [pwd, setPwd] = useState("");
  const [temp, setTemp] = useState(true);

  const setPassword = () => {
    if (!pwd) return;
    const cred: Credential = {
      id: `c_${Date.now()}`,
      type: "password",
      userLabel: temp ? "Temporary password" : "Primary password",
      createdAt: new Date().toISOString(),
    };
    const next = user.credentials.filter(c => c.type !== "password").concat(cred);
    onUpdate({ ...user, credentials: next });
    setPwd("");
  };

  const removeCred = (id: string) =>
    onUpdate({ ...user, credentials: user.credentials.filter(c => c.id !== id) });

  const addOtp = () => {
    const cred: Credential = { id: `c_${Date.now()}`, type: "otp", userLabel: "OTP device", createdAt: new Date().toISOString() };
    onUpdate({ ...user, credentials: [...user.credentials, cred] });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <GlassCard className="lg:col-span-2">
        <SectionHeader
          title="Credentials"
          description="Authentication methods registered"
          icon={<KeyRound className="h-4 w-4 text-primary-foreground" />}
        />
        <div className="space-y-3">
          {user.credentials.map((c) => {
            const Icon = credIcon(c.type);
            return (
              <div key={c.id} className="glass glass-hover rounded-xl p-4 flex items-center gap-4">
                <div className="rounded-xl bg-gradient-accent p-2.5">
                  <Icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.userLabel}</span>
                    <Badge variant="outline" className="text-xs uppercase">{c.type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Created {fmtDate(c.createdAt)}
                    {c.lastUsed && ` • Last used ${fmtDate(c.lastUsed)}`}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeCred(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          {user.credentials.length === 0 && <p className="text-sm text-muted-foreground">No credentials.</p>}
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard>
          <SectionHeader title="Set password" icon={<KeyRound className="h-4 w-4 text-primary-foreground" />} />
          <div className="space-y-3">
            <Input type="password" placeholder="New password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="glass" />
            <div className="glass rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm">Temporary</span>
              <Switch checked={temp} onCheckedChange={setTemp} />
            </div>
            <Button onClick={setPassword} disabled={!pwd} className="w-full bg-gradient-primary">Set password</Button>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Quick actions" icon={<Mail className="h-4 w-4 text-primary-foreground" />} />
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start glass gap-2">
              <Mail className="h-4 w-4" /> Send reset password email
            </Button>
            <Button variant="outline" className="w-full justify-start glass gap-2" onClick={addOtp}>
              <Smartphone className="h-4 w-4" /> Create OTP credential
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ---------- Roles ---------- */
function RolesTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [scope, setScope] = useState<"realm" | "client">("realm");
  const [client, setClient] = useState("account");

  const toggleRole = (id: string) => {
    onUpdate({
      ...user,
      roles: user.roles.map(r => r.id === id ? { ...r, assigned: !r.assigned } : r),
    });
  };

  const assigned = user.roles.filter(r => r.assigned);
  const available = user.roles.filter(r => !r.assigned && r.scope === scope && (scope === "realm" || r.client === client));
  const clients = Array.from(new Set(user.roles.filter(r => r.scope === "client").map(r => r.client!)));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <SectionHeader title="Assigned roles" description={`${assigned.length} active`} icon={<Shield className="h-4 w-4 text-primary-foreground" />} />
        <div className="space-y-2">
          {assigned.map((r) => (
            <div key={r.id} className="glass glass-hover rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  <Badge variant="outline" className="text-xs">{r.scope === "realm" ? "realm" : r.client}</Badge>
                </div>
                {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => toggleRole(r.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {assigned.length === 0 && <p className="text-sm text-muted-foreground">No roles assigned.</p>}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Available roles" description="Click to assign" icon={<Plus className="h-4 w-4 text-primary-foreground" />} />
        <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
          <TabsList className="glass w-full">
            <TabsTrigger value="realm" className="flex-1 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Realm roles</TabsTrigger>
            <TabsTrigger value="client" className="flex-1 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Client roles</TabsTrigger>
          </TabsList>
          {scope === "client" && clients.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {clients.map(c => (
                <button
                  key={c}
                  onClick={() => setClient(c)}
                  className={`px-3 py-1 rounded-full text-xs glass transition-all ${client === c ? "bg-gradient-accent text-accent-foreground" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2 mt-4">
            {available.map(r => (
              <button key={r.id} onClick={() => toggleRole(r.id)} className="w-full glass glass-hover rounded-xl p-3 flex items-center justify-between text-left">
                <span className="font-medium">{r.name}</span>
                <Plus className="h-4 w-4 text-primary" />
              </button>
            ))}
            {available.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No more roles available.</p>}
          </div>
        </Tabs>
      </GlassCard>
    </div>
  );
}

/* ---------- Groups ---------- */
function GroupsTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const memberGroups = user.groups.filter(g => g.member);
  const memberIds = new Set(memberGroups.map(g => g.id));
  const available = ALL_GROUPS.filter(g => !memberIds.has(g.id));

  const join = (g: typeof ALL_GROUPS[0]) =>
    onUpdate({ ...user, groups: [...user.groups.filter(x => x.id !== g.id), { ...g, member: true }] });

  const leave = (id: string) =>
    onUpdate({ ...user, groups: user.groups.map(g => g.id === id ? { ...g, member: false } : g) });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <SectionHeader title="Member of" description={`${memberGroups.length} groups`} icon={<UsersIcon className="h-4 w-4 text-primary-foreground" />} />
        <div className="space-y-2">
          {memberGroups.map(g => (
            <div key={g.id} className="glass glass-hover rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.path}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => leave(g.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {memberGroups.length === 0 && <p className="text-sm text-muted-foreground">Not a member of any group.</p>}
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Join group" description="Available groups" icon={<Plus className="h-4 w-4 text-primary-foreground" />} />
        <div className="space-y-2">
          {available.map(g => (
            <button key={g.id} onClick={() => join(g)} className="w-full glass glass-hover rounded-xl p-3 flex items-center justify-between text-left">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.path}</div>
              </div>
              <Plus className="h-4 w-4 text-primary" />
            </button>
          ))}
          {available.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No groups available.</p>}
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------- Consents ---------- */
function ConsentsTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const revoke = (id: string) => onUpdate({ ...user, consents: user.consents.filter(c => c.id !== id) });

  return (
    <GlassCard>
      <SectionHeader title="Granted consents" description="Per client OAuth consents" icon={<CheckSquare className="h-4 w-4 text-primary-foreground" />} />
      <div className="space-y-3">
        {user.consents.map(c => (
          <div key={c.id} className="glass glass-hover rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{c.client}</div>
                    <div className="text-xs text-muted-foreground">Granted {fmtDate(c.grantedAt)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 ml-11">
                  {c.scopes.map(s => (
                    <Badge key={s} variant="outline" className="text-xs glass">{s}</Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-destructive/40 text-destructive" onClick={() => revoke(c.id)}>
                Revoke
              </Button>
            </div>
          </div>
        ))}
        {user.consents.length === 0 && <p className="text-sm text-muted-foreground">No consents granted.</p>}
      </div>
    </GlassCard>
  );
}

/* ---------- Sessions ---------- */
function SessionsTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const signOut = (id: string) => onUpdate({ ...user, sessions: user.sessions.filter(s => s.id !== id) });
  const signOutAll = () => onUpdate({ ...user, sessions: [] });

  return (
    <GlassCard>
      <SectionHeader
        title="Active sessions"
        description={`${user.sessions.length} active`}
        icon={<Activity className="h-4 w-4 text-primary-foreground" />}
        action={user.sessions.length > 0 && (
          <Button variant="outline" size="sm" onClick={signOutAll} className="gap-2 border-destructive/40 text-destructive">
            <Power className="h-4 w-4" /> Sign out all
          </Button>
        )}
      />
      <div className="space-y-3">
        {user.sessions.map(s => (
          <div key={s.id} className="glass glass-hover rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="rounded-lg bg-gradient-primary p-2">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium font-mono text-sm">{s.ip}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Started {fmtDate(s.startedAt)} • Last access {fmtDate(s.lastAccess)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.clients.map(c => (
                      <Badge key={c} variant="outline" className="text-xs glass">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => signOut(s.id)}>
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            </div>
          </div>
        ))}
        {user.sessions.length === 0 && <p className="text-sm text-muted-foreground">No active sessions.</p>}
      </div>
    </GlassCard>
  );
}

/* ---------- Events ---------- */
function EventsTab({ user }: { user: User }) {
  return (
    <GlassCard>
      <SectionHeader title="Admin events" description="Audit log" icon={<History className="h-4 w-4 text-primary-foreground" />} />
      <div className="space-y-2">
        {user.adminEvents.map(e => (
          <div key={e.id} className="glass rounded-xl p-3 flex items-center gap-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-xs">{e.operation}</Badge>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{e.resource}</div>
              <div className="text-xs text-muted-foreground">by {e.by} • {fmtDate(e.time)}</div>
            </div>
          </div>
        ))}
        {user.adminEvents.length === 0 && <p className="text-sm text-muted-foreground">No events recorded.</p>}
      </div>
    </GlassCard>
  );
}

/* ---------- Impersonate ---------- */
function ImpersonateTab({ user }: { user: User }) {
  return (
    <GlassCard strong>
      <SectionHeader title="Impersonation" description="Sign in as this user for debug or support" icon={<UserCog className="h-4 w-4 text-primary-foreground" />} />
      <div className="glass rounded-xl p-5 border border-warning/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm">
              You are about to start a session as <span className="font-semibold">{user.username}</span>.
              All actions will be performed on their behalf and recorded in the admin event log.
            </p>
            <Button className="mt-4 bg-gradient-accent text-accent-foreground gap-2 shadow-glow">
              <UserCog className="h-4 w-4" /> Impersonate {user.firstName || user.username}
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
