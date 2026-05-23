import { getRequestContext } from '@cloudflare/next-on-pages';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext();
  const db = (env as unknown as CloudflareEnv).DB;

  const { results } = await db
    .prepare('SELECT * FROM events ORDER BY start_date ASC')
    .all();

  const events = results.map((row) => ({
    ...row,
    all_day: row.all_day === 1,
  }));

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const db = (env as unknown as CloudflareEnv).DB;

  const body = await request.json();
  const { title, description, start_date, end_date, all_day, color, owner_email, notify_before } =
    body as Record<string, unknown>;

  if (!title || !start_date || !end_date || !owner_email) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO events (id, title, description, start_date, end_date, all_day, color, owner_email, notify_before, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      title,
      description ?? '',
      start_date,
      end_date,
      all_day ? 1 : 0,
      color,
      owner_email,
      notify_before ?? 0,
      now,
      now
    )
    .run();

  return NextResponse.json({ id }, { status: 201 });
}
