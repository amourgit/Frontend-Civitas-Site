// Composant réutilisable pour les badges de privilège
export const PrivilegeBadge = ({ level }: { level: "admin" | "vip" | "member" | "guest" }) => {
    const config = {
      admin: { color: "bg-red-500", label: "ADMIN", ariaLabel: "Privilège administrateur" },
      vip: { color: "bg-yellow-500", label: "VIP", ariaLabel: "Privilège VIP" },
      member: { color: "bg-blue-500", label: "MEMBRE", ariaLabel: "Privilège membre" },
      guest: { color: "bg-gray-500", label: "INVITÉ", ariaLabel: "Privilège invité" }
    };
  
    const privilege = config[level];
    
    return (
      <div 
        className={`${privilege.color} px-2 py-0.5 rounded-full shadow-sm`}
        role="status"
        aria-label={privilege.ariaLabel}
      >
        <span className="text-white text-xs font-bold">{privilege.label}</span>
      </div>
    );
  };