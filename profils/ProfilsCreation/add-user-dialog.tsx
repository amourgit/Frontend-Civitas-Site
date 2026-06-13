import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_GROUPS, REQUIRED_ACTIONS, type RequiredAction, type User } from "@/lib/users-data";
import { UserPlus } from "lucide-react";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (u: User) => void;
}

export function AddUserDialog({ open, onOpenChange, onCreate }: AddUserDialogProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [actions, setActions] = useState<RequiredAction[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  const reset = () => {
    setUsername(""); setEmail(""); setFirstName(""); setLastName("");
    setEmailVerified(false); setEnabled(true); setActions([]); setGroups([]);
  };

  const submit = () => {
    if (!username.trim()) return;
    onCreate({
      id: `u_${Date.now()}`,
      username: username.trim(),
      email,
      firstName,
      lastName,
      emailVerified,
      enabled,
      createdAt: new Date().toISOString(),
      requiredActions: actions,
      attributes: [],
      credentials: [],
      roles: [{ id: "r2", name: "user", scope: "realm", assigned: true }],
      groups: ALL_GROUPS.filter(g => groups.includes(g.id)).map(g => ({ ...g, member: true })),
      consents: [],
      sessions: [],
      adminEvents: [{ id: "e1", time: new Date().toISOString(), operation: "CREATE", resource: "user", by: "admin" }],
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="glass-strong border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-primary p-2.5 shadow-glow">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add user</DialogTitle>
              <DialogDescription>Create a new account in this realm.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jane.doe" className="glass" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="glass" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="glass" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="glass" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <Label className="text-sm">Email verified</Label>
                <p className="text-xs text-muted-foreground">Mark email as verified</p>
              </div>
              <Switch checked={emailVerified} onCheckedChange={setEmailVerified} />
            </div>
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <Label className="text-sm">User enabled</Label>
                <p className="text-xs text-muted-foreground">Allow login</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Required user actions</Label>
            <div className="glass rounded-xl p-3 grid grid-cols-2 gap-2">
              {REQUIRED_ACTIONS.map((a) => {
                const checked = actions.includes(a.value);
                return (
                  <label key={a.value} className="flex items-center gap-2 rounded-lg p-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <Checkbox checked={checked} onCheckedChange={(c) => {
                      setActions(c ? [...actions, a.value] : actions.filter(x => x !== a.value));
                    }} />
                    <span className="text-sm">{a.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Groups</Label>
            <div className="glass rounded-xl p-3 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {ALL_GROUPS.map((g) => {
                const checked = groups.includes(g.id);
                return (
                  <label key={g.id} className="flex items-center gap-2 rounded-lg p-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <Checkbox checked={checked} onCheckedChange={(c) => {
                      setGroups(c ? [...groups, g.id] : groups.filter(x => x !== g.id));
                    }} />
                    <span className="text-sm">{g.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!username.trim()} className="bg-gradient-primary shadow-glow">
            Create user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
