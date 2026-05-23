'use client';

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
  isToday,
  differenceInMinutes,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarEvent } from '@/lib/types';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_HEIGHT = 48;

export default function WeekView({ currentDate, events, onDateClick, onEventClick }: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTimedEventsForDay = (date: Date) =>
    events.filter((e) => !e.all_day && isSameDay(parseISO(e.start_date), date));

  const getAllDayEventsForDay = (date: Date) =>
    events.filter((e) => e.all_day && isSameDay(parseISO(e.start_date), date));

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
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-gray-100">
        <div className="py-2" />
        {days.map((day, i) => (
          <div
            key={day.toISOString()}
            className="py-2 text-center border-l border-gray-100 cursor-pointer hover:bg-gray-50"
            onClick={() => onDateClick(day)}
          >
            <div
              className={`text-xs mb-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {format(day, 'E', { locale: ja })}
            </div>
            <div
              className={`text-sm font-semibold mx-auto w-7 h-7 flex items-center justify-center rounded-full
                ${isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-700'}
              `}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-gray-100">
        <div className="text-xs text-gray-400 p-1 text-right">終日</div>
        {days.map((day) => {
          const allDayEvs = getAllDayEventsForDay(day);
          return (
            <div key={day.toISOString()} className="border-l border-gray-100 p-0.5 min-h-[28px]">
              {allDayEvs.map((ev) => (
                <div
                  key={ev.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  className="px-1 py-0.5 rounded text-white text-xs truncate cursor-pointer"
                  style={{ backgroundColor: ev.color }}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-[48px_repeat(7,1fr)]" style={{ height: CELL_HEIGHT * 24 }}>
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-1 text-xs text-gray-400"
                style={{ top: h * CELL_HEIGHT - 8 }}
              >
                {h === 0 ? '' : `${h}:00`}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const timedEvs = getTimedEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-gray-100 cursor-pointer"
                onClick={() => {
                  const d = new Date(day);
                  d.setHours(9, 0, 0, 0);
                  onDateClick(d);
                }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: h * CELL_HEIGHT, height: CELL_HEIGHT }}
                  />
                ))}
                {timedEvs.map((ev) => {
                  const { top, height } = getEventStyle(ev);
                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-white text-xs overflow-hidden cursor-pointer hover:opacity-90 z-10"
                      style={{ top, height: Math.max(height, 20), backgroundColor: ev.color }}
                    >
                      <div className="font-medium truncate">{ev.title}</div>
                      {height >= 36 && (
                        <div className="opacity-80">
                          {format(parseISO(ev.start_date), 'H:mm')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
