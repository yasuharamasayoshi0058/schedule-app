'use client';

import { format, parseISO, isSameDay, differenceInMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarEvent } from '@/lib/types';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_HEIGHT = 56;

export default function DayView({ currentDate, events, onDateClick, onEventClick }: Props) {
  const timedEvents = events.filter(
    (e) => !e.all_day && isSameDay(parseISO(e.start_date), currentDate)
  );
  const allDayEvents = events.filter(
    (e) => e.all_day && isSameDay(parseISO(e.start_date), currentDate)
  );

  const getEventStyle = (ev: CalendarEvent) => {
    const start = parseISO(ev.start_date);
    const end = parseISO(ev.end_date);
    const startMins = start.getHours() * 60 + start.getMinutes();
    const duration = Math.max(differenceInMinutes(end, start), 30);
    return {
      top: (startMins / 60) * CELL_HEIGHT,
      height: (duration / 60) * CELL_HEIGHT,
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">
          {format(currentDate, 'M月d日（E）', { locale: ja })}
        </h3>
        {allDayEvents.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-400 mb-1">終日</div>
            {allDayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className="px-2 py-1 rounded text-white text-sm cursor-pointer hover:opacity-90"
                style={{ backgroundColor: ev.color }}
              >
                {ev.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        <div className="relative" style={{ height: CELL_HEIGHT * 24 }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute w-full flex"
              style={{ top: h * CELL_HEIGHT }}
              onClick={() => {
                const d = new Date(currentDate);
                d.setHours(h, 0, 0, 0);
                onDateClick(d);
              }}
            >
              <div className="w-12 text-right pr-2 text-xs text-gray-400 flex-shrink-0">
                {h === 0 ? '' : `${h}:00`}
              </div>
              <div className="flex-1 border-t border-gray-100 cursor-pointer hover:bg-gray-50" style={{ height: CELL_HEIGHT }} />
            </div>
          ))}

          {timedEvents.map((ev) => {
            const { top, height } = getEventStyle(ev);
            return (
              <div
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className="absolute left-14 right-3 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:opacity-90 z-10 shadow-sm"
                style={{ top, height: Math.max(height, 28), backgroundColor: ev.color }}
              >
                <div className="font-semibold text-sm truncate">{ev.title}</div>
                {height >= 44 && (
                  <div className="text-xs opacity-80">
                    {format(parseISO(ev.start_date), 'H:mm')} –{' '}
                    {format(parseISO(ev.end_date), 'H:mm')}
                  </div>
                )}
                {height >= 64 && ev.description && (
                  <div className="text-xs opacity-70 truncate">{ev.description}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
