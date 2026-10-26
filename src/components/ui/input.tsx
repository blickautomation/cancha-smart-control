import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out)] focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(183,245,0,0.15)]",
        className
      )}
      {...props}
    />
  );
}
