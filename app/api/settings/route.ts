import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storeSettings } from '@/db/schema';
import { inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Public: returns only the settings customers need
const PUBLIC_KEYS = ['shopee_checkout_link'];

export async function GET() {
  const rows = await db.select().from(storeSettings)
    .where(inArray(storeSettings.key, PUBLIC_KEYS));

  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json(settings);
}
