'use client';

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
  isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarEvent } from '@/lib/types';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

export default function MonthView({ currentDate, events, onDateClick, onEventClick }: Props) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (date: Date) =>
    events.filter((e) => {
      const start = parseISO(e.start_date);
      const end = parseISO(e.end_date);
      return date >= new Date(start.toDateString()) && date <= new Date(end.toDateString());
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-semibold ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-gray-100">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const isSun = idx % 7 === 0;
          const isSat = idx % 7 === 6;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`min-h-[80px] p-1 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                ${!inMonth ? 'bg-gray-50' : ''}
              `}
            >
              <div className="flex justify-center mb-1">
                <span
                  className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium
                    ${today ? 'bg-blue-500 text-white' : ''}
                    ${!today && isSun ? 'text-red-400' : ''}
                    ${!today && isSat ? 'text-blue-400' : ''}
                    ${!today && !isSun && !isSat && inMonth ? 'text-gray-700' : ''}
                    ${!inMonth ? 'text-gray-300' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(ev);
                    }}
                    className="px-1.5 py-0.5 rounded text-white text-xs truncate cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: ev.color }}
                  >
                    {ev.all_day ? '' : format(parseISO(ev.start_date), 'H:mm') + ' '}
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400 px-1">
                    +{dayEvents.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
