import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn'in Badge'inden uyarlandı — class-variance-authority eklemeden,
 * bu projede zaten kullanılan (NavBar vb.) düz ternary sınıf deseniyle. */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default"
          ? "border border-transparent bg-surface-card/90 text-foreground"
          : "border border-surface-border text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
