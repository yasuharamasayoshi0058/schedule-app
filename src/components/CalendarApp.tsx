'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import EventModal from './EventModal';
import { CalendarEvent, ViewMode, USER_CONFIG, getUserColor, getUserName } from '@/lib/types';

interface Props {
  userEmail: string;
}

export default function CalendarApp({ userEmail }: Props) {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultStartDate, setDefaultStartDate] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json() as { events?: CalendarEvent[] };
      setEvents(data.events ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate((d) => subMonths(d, 1));
    else if (view === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate((d) => addMonths(d, 1));
    else if (view === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  };

  const handleDateClick = (date: Date) => {
    const d = new Date(date);
    if (d.getHours() === 0) d.setHours(9, 0, 0, 0);
    setEditingEvent(null);
    setDefaultStartDate(format(d, "yyyy-MM-dd'T'HH:mm"));
    setShowModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultStartDate('');
    setShowModal(true);
  };

  const handleSave = async (data: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingEvent) {
      await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, owner_email: userEmail }),
      });
    }
    setShowModal(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    setShowModal(false);
    fetchEvents();
  };

  const openNewEvent = () => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    setEditingEvent(null);
    setDefaultStartDate(format(d, "yyyy-MM-dd'T'HH:mm"));
    setShowModal(true);
  };

  const titleDisplay = () => {
    if (view === 'month') return format(currentDate, 'yyyy年M月', { locale: ja });
    if (view === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 0 });
      const e = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(s, 'M月d日', { locale: ja })} – ${format(e, 'M月d日', { locale: ja })}`;
    }
    return format(currentDate, 'yyyy年M月d日（E）', { locale: ja });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-800">📅 家族カレンダー</h1>
              <div className="hidden sm:flex items-center gap-3">
                {Object.entries(USER_CONFIG).map(([email, cfg]) => (
                  <div key={email} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-xs text-gray-500">{cfg.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {getUserName(userEmail)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                今日
              </button>
              <button
                onClick={handlePrev}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg"
              >
                ›
              </button>
              <span className="text-sm font-semibold text-gray-700 ml-1">{titleDisplay()}</span>
            </div>

            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    view === v
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v === 'month' ? '月' : v === 'week' ? '週' : '日'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            読み込み中...
          </div>
        ) : (
          <>
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
          </>
        )}
      </main>

      <button
        onClick={openNewEvent}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg text-white text-2xl flex items-center justify-center hover:scale-105 transition-transform z-30"
        style={{ backgroundColor: getUserColor(userEmail) }}
        aria-label="予定を追加"
      >
        +
      </button>

      {showModal && (
        <EventModal
          event={editingEvent}
          defaultStartDate={defaultStartDate}
          userEmail={userEmail}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
