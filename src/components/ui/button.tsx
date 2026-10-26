import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_100%,white_18%),var(--color-primary))] text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_rgba(183,245,0,0)] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,var(--shadow-glow-primary)]",
        accent:
          "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_100%,white_18%),var(--color-accent))] text-accent-foreground shadow-[0_1px_0_rgba(255,255,255,0.25)_inset] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,var(--shadow-glow-accent)]",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-surface",
        ghost: "bg-transparent text-foreground hover:bg-surface",
        destructive: "bg-negative text-white hover:brightness-110",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
