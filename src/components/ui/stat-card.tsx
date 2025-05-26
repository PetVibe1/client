import React from "react";
import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  className?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  className,
  subtitle,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-lg bg-slate-800 p-3 shadow-lg">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-slate-500">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-slate-800">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        {(change || subtitle) && (
          <div className="mt-4">
            {change && (
              <div
                className={cn(
                  "text-sm font-medium",
                  changeType === 'increase' && "text-green-600",
                  changeType === 'decrease' && "text-red-600",
                  changeType === 'neutral' && "text-amber-600"
                )}
              >
                {change}
              </div>
            )}
            {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 