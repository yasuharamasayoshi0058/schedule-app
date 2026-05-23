export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  color: string;
  owner_email: string;
  notify_before: number;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'month' | 'week' | 'day';

export const USER_CONFIG: Record<string, { color: string; name: string }> = {
  'yasuhara@zei-eikoh.com': { color: '#3B82F6', name: '自分' },
  'yasuharamasayoshi0058@hotmail.com': { color: '#F43F5E', name: '妻' },
};

export const DEFAULT_COLOR = '#8B5CF6';

export function getUserColor(email: string): string {
  return USER_CONFIG[email]?.color ?? DEFAULT_COLOR;
}

export function getUserName(email: string): string {
  return USER_CONFIG[email]?.name ?? email;
}
