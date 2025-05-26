import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "../../lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ShadcnBarChartProps {
  title: string;
  description?: string;
  data: any[];
  categories: { name: string; color: string }[];
  index: string;
  className?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export function ShadcnBarChart({
  title,
  description,
  data,
  categories,
  index,
  className,
  valueFormatter = (value: number) => value.toLocaleString(),
  height = 350,
  showLegend = true,
  showTooltip = true,
}: ShadcnBarChartProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-white px-6 py-5">
        <CardTitle className="text-slate-800">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="h-[350px] w-full p-0">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                left: 0,
                bottom: 30,
              }}
              barSize={28}
            >
              <XAxis
                dataKey={index}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#000000', fontSize: 13, fontWeight: 600 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#1e293b', fontSize: 13, fontWeight: 500 }}
                tickMargin={8}
                tickFormatter={valueFormatter}
              />
              {showTooltip && (
                <Tooltip
                  cursor={{ fill: 'rgba(249, 250, 251, 0.5)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-100 bg-white shadow-md p-3">
                          <div className="mb-2 font-medium text-black">{label}</div>
                          <div className="flex flex-col gap-1.5">
                            {payload.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-black font-medium">
                                  {item.name}: {valueFormatter(item.value as number)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              )}
              {showLegend && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-black">{value}</span>
                  )}
                />
              )}
              {categories.map((category, index) => (
                <Bar
                  key={category.name}
                  dataKey={category.name}
                  name={category.name}
                  fill={category.color}
                  radius={[4, 4, 0, 0]}
                  stackId={category.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 