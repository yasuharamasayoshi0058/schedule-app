import { headers } from 'next/headers';
import CalendarApp from '@/components/CalendarApp';

export const runtime = 'edge';

export default async function Home() {
  const headersList = await headers();
  const userEmail =
    headersList.get('CF-Access-Authenticated-User-Email') ?? 'yasuhara@zei-eikoh.com';

  return <CalendarApp userEmail={userEmail} />;
}
