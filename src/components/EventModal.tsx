'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, getUserColor, getUserName } from '@/lib/types';

interface Props {
  event: CalendarEvent | null;
  defaultStartDate: string;
  userEmail: string;
  onSave: (data: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const NOTIFY_OPTIONS = [
  { value: 0, label: '通知なし' },
  { value: 30, label: '30分前' },
  { value: 60, label: '1時間前' },
  { value: 180, label: '3時間前' },
  { value: 1440, label: '1日前' },
];

export default function EventModal({
  event,
  defaultStartDate,
  userEmail,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [notifyBefore, setNotifyBefore] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStartDate(event.start_date);
      setEndDate(event.end_date);
      setAllDay(event.all_day);
      setNotifyBefore(event.notify_before);
    } else {
      const base = defaultStartDate || new Date().toISOString().slice(0, 16);
      setStartDate(base);
      const end = new Date(base);
      end.setHours(end.getHours() + 1);
      setEndDate(end.toISOString().slice(0, 16));
    }
  }, [event, defaultStartDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ownerEmail = event ? event.owner_email : userEmail;
    onSave({
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: endDate,
      all_day: allDay,
      color: getUserColor(ownerEmail),
      owner_email: ownerEmail,
      notify_before: notifyBefore,
    });
  };

  const ownerEmail = event ? event.owner_email : userEmail;
  const ownerColor = getUserColor(ownerEmail);
  const ownerName = getUserName(ownerEmail);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ownerColor }} />
              <h2 className="text-lg font-bold text-gray-800">
                {event ? '予定を編集' : '予定を追加'}
              </h2>
              <span className="text-sm text-gray-400">{ownerName}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="予定のタイトルを入力"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
              終日
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startDate.slice(0, 10) : startDate}
                onChange={(e) =>
                  setStartDate(allDay ? e.target.value + 'T00:00' : e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endDate.slice(0, 10) : endDate}
                onChange={(e) =>
                  setEndDate(allDay ? e.target.value + 'T23:59' : e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細・メモ（任意）"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メール通知
            </label>
            <select
              value={notifyBefore}
              onChange={(e) => setNotifyBefore(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {NOTIFY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white font-medium text-sm transition-colors"
              style={{ backgroundColor: ownerColor }}
            >
              {event ? '更新する' : '追加する'}
            </button>
            {event && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 rounded-xl text-red-500 border border-red-300 font-medium text-sm hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 mb-2">本当に削除しますか？</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(event!.id)}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium"
                >
                  削除する
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
