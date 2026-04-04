import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { expenses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, category, amount, date, notes } = body;

  const updatedArr = await db.update(expenses).set({
    title,
    category,
    amount: parseFloat(amount),
    date: new Date(date),
    notes,
  }).where(eq(expenses.id, params.id)).returning();
  const expense = updatedArr[0];

  return NextResponse.json(expense);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.delete(expenses).where(eq(expenses.id, params.id));

  return NextResponse.json({ success: true });
}
