import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  status?: 'pending' | 'completed' | 'canceled';
  description?: string;
}

interface ScheduleProps {
  events: ScheduleEvent[];
  title?: string;
  className?: string;
  onEventClick?: (event: ScheduleEvent) => void;
}

export function Schedule({ events, title = "Lịch", className, onEventClick }: ScheduleProps) {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  
  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  // Group events by day
  const eventsByDay = weekDays.map(day => ({
    date: day,
    events: events.filter(event => isSameDay(new Date(event.date), day))
  }));

  // Get current day name in Vietnamese
  const currentDayName = format(today, 'EEEE', { locale: vi });

  return (
    <Card className={className}>
      <CardHeader className="bg-white">
        <CardTitle className="text-slate-800">{title}</CardTitle>
        <CardDescription className="text-slate-500">
          {format(today, "dd/MM/yyyy")} • {currentDayName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-slate-500 uppercase">
                {format(day, 'EEE', { locale: vi })}
              </div>
              <div className={cn(
                "text-sm font-semibold rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                isSameDay(day, today) 
                  ? "bg-amber-500 text-white" 
                  : "text-slate-700 hover:bg-amber-100"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
          
          {/* Events */}
          {eventsByDay.map((dayData, dayIndex) => (
            <div key={dayIndex} className="min-h-24 border-t mt-2 pt-2">
              {dayData.events.length > 0 ? (
                dayData.events.map((event) => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "mb-1 p-1.5 text-xs rounded-md cursor-pointer transition-colors",
                      event.status === 'completed' && "bg-green-50 border-l-2 border-green-500 hover:bg-green-100",
                      event.status === 'canceled' && "bg-red-50 border-l-2 border-red-500 hover:bg-red-100",
                      (!event.status || event.status === 'pending') && "bg-amber-50 border-l-2 border-amber-500 hover:bg-amber-100",
                    )}
                    onClick={() => onEventClick && onEventClick(event)}
                  >
                    <div className="font-medium truncate text-slate-800">{event.title}</div>
                    <div className="text-slate-500">{format(new Date(event.date), 'HH:mm')}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-2">Không có sự kiện</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 