import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
}

export function GlassCard({ children, className, strong, hover }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        strong ? "glass-strong" : "glass",
        hover && "glass-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function SectionHeader({ title, description, action, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="rounded-xl bg-gradient-primary p-2.5 shadow-glow">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
