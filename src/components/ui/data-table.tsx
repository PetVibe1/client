import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
  showInResponsiveCard?: boolean;
  responsiveLabel?: string;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
  rowClassName?: (item: T) => string;
  enableResponsiveCards?: boolean;
}

export function DataTable<T>({
  title,
  columns,
  data,
  className,
  emptyMessage = "Không có dữ liệu",
  rowClassName,
  enableResponsiveCards = true,
}: DataTableProps<T>) {
  return (
    <Card className={cn("border-slate-200 shadow-md overflow-hidden", className)}>
      {title && (
        <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
          <CardTitle className="text-slate-800">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-amber-50 to-slate-50 border-b border-amber-100">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={cn(
                      "border-b border-slate-100 hover:bg-amber-50/30 transition-colors",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                      rowClassName ? rowClassName(item) : ''
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex} 
                        className={cn(
                          "px-6 py-4 text-sm font-medium text-slate-700",
                          colIndex === 0 ? "font-medium" : ""
                        )}
                      >
                        {column.cell ? column.cell(item) : String(item[column.accessorKey] || '')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-slate-500 bg-slate-50/50"
                  >
                    <EmptyStateMessage message={emptyMessage} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {enableResponsiveCards && (
          <div className="md:hidden">
            {data.length > 0 ? (
              <div className="grid gap-4 p-4">
                {data.map((item, rowIndex) => (
                  <div 
                    key={rowIndex} 
                    className={cn(
                      "bg-white rounded-lg border border-amber-100 shadow-sm p-4 hover:border-amber-300 transition-colors",
                      rowClassName ? rowClassName(item) : ''
                    )}
                  >
                    {columns
                      .filter(col => col.showInResponsiveCard !== false)
                      .map((column, colIndex) => (
                        <div key={colIndex} className="mb-2 last:mb-0">
                          {column.responsiveLabel && (
                            <span className="text-xs font-medium text-slate-500 block mb-0.5">
                              {column.responsiveLabel}
                            </span>
                          )}
                          <div className={colIndex === 0 ? "font-medium text-slate-800" : "text-slate-700"}>
                            {column.cell ? column.cell(item) : String(item[column.accessorKey] || '')}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <EmptyStateMessage message={emptyMessage} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyStateMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 text-amber-300 mb-3" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
        />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  );
} 