import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
  dotColor?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      withDot = false,
      dotColor,
      children,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-full";
    
    // Variant classes
    const variantClasses = {
      primary: "bg-amber-100 text-amber-800 border border-amber-200",
      secondary: "bg-slate-100 text-slate-800 border border-slate-200",
      success: "bg-green-100 text-green-800 border border-green-200",
      danger: "bg-red-100 text-red-800 border border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      info: "bg-blue-100 text-blue-800 border border-blue-200",
      outline: "bg-white border border-slate-200 text-slate-700",
    };
    
    // Size classes
    const sizeClasses = {
      sm: "text-xs px-2 py-0.5",
      md: "text-xs px-3 py-1.5",
      lg: "text-sm px-3 py-1.5",
    };

    // Default dot colors based on variant
    const defaultDotColors = {
      primary: "bg-amber-500",
      secondary: "bg-slate-500",
      success: "bg-green-500",
      danger: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
      outline: "bg-slate-400",
    };
    
    // Combine all classes
    const badgeClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    // Determine dot color
    const dotColorClass = dotColor || defaultDotColors[variant];
    
    return (
      <span className={badgeClasses} ref={ref} {...props}>
        {withDot && (
          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", dotColorClass)}></span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge"; 