import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { env } = getRequestContext();
  const cfEnv = env as unknown as CloudflareEnv;

  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${cfEnv.NOTIFY_SECRET}`) {
    return NextResponse.json({ error: '認証エラー' }, { status: 401 });
  }

  const db = cfEnv.DB;
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { results } = await db
    .prepare(
      `SELECT * FROM events WHERE notify_before > 0 AND start_date >= ? AND start_date <= ?`
    )
    .bind(now.toISOString(), tomorrow.toISOString())
    .all();

  const sent: { event: string; email: string }[] = [];

  for (const row of results) {
    const startDate = new Date(row.start_date as string);
    const notifyTime = new Date(startDate.getTime() - (row.notify_before as number) * 60 * 1000);

    if (notifyTime <= now) {
      await sendEmail(
        cfEnv.RESEND_API_KEY,
        row.owner_email as string,
        `予定リマインダー: ${row.title}`,
        `<h2>${row.title}</h2>
         <p>開始: ${startDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</p>
         ${row.description ? `<p>${row.description}</p>` : ''}`
      );
      sent.push({ event: row.title as string, email: row.owner_email as string });
    }
  }

  return NextResponse.json({ sent: sent.length, emails: sent });
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'calendar@resend.dev',
      to: [to],
      subject,
      html,
    }),
  });
}
