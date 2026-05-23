import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getRequestContext();
  const db = (env as unknown as CloudflareEnv).DB;

  const body = await request.json();
  const { title, description, start_date, end_date, all_day, color, notify_before } =
    body as Record<string, unknown>;
  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE events
       SET title=?, description=?, start_date=?, end_date=?, all_day=?, color=?, notify_before=?, updated_at=?
       WHERE id=?`
    )
    .bind(
      title,
      description ?? '',
      start_date,
      end_date,
      all_day ? 1 : 0,
      color,
      notify_before ?? 0,
      now,
      params.id
    )
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getRequestContext();
  const db = (env as unknown as CloudflareEnv).DB;

  await db.prepare('DELETE FROM events WHERE id = ?').bind(params.id).run();

  return NextResponse.json({ success: true });
}
