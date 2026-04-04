import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderArr = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
  const order = orderArr[0];

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (order.status !== 'PENDING_DEPOSIT') {
    return NextResponse.json({ error: 'Order is not pending deposit' }, { status: 400 });
  }

  if (new Date() > order.reservationExpiry) {
    return NextResponse.json({ error: 'Order reservation has expired' }, { status: 400 });
  }

  const body = await request.json();
  const { depositProof } = body;

  if (!depositProof) {
    return NextResponse.json({ error: 'Deposit proof is required' }, { status: 400 });
  }

  const updatedArr = await db.update(orders)
    .set({ depositProof, status: 'DEPOSIT_SUBMITTED' })
    .where(eq(orders.id, params.id))
    .returning();
  const updatedOrder = updatedArr[0];

  // Notify admin
  await db.insert(notifications).values({
    title: 'Deposit Submitted',
    message: `Customer ${session.user.name} submitted deposit proof for order #${order.id.slice(-8).toUpperCase()}`,
    type: 'ORDER',
  });

  return NextResponse.json(updatedOrder);
}
