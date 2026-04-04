import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { expenses } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.select().from(expenses).orderBy(desc(expenses.date));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, category, amount, date, notes } = body;

  if (!title || !category || !amount || !date) {
    return NextResponse.json({ error: 'Title, category, amount, and date are required' }, { status: 400 });
  }

  const newExpenseArr = await db.insert(expenses).values({
    title,
    category,
    amount: parseFloat(amount),
    date: new Date(date),
    notes,
  }).returning();
  const expense = newExpenseArr[0];

  return NextResponse.json(expense, { status: 201 });
}
