import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentMethods } from '@/db/schema';
import { eq, asc, isNotNull, and } from 'drizzle-orm';

export async function GET() {
  const methods = await db.select().from(paymentMethods)
    .where(and(eq(paymentMethods.isActive, true), isNotNull(paymentMethods.qrCode)))
    .orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.createdAt));
  return NextResponse.json(methods);
}
