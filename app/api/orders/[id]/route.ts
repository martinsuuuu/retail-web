import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, products, notifications } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, params.id),
    with: {
      user: { columns: { id: true, name: true, email: true } },
      items: { with: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Customers can only view their own orders
  if (session.user.role === 'CUSTOMER' && order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status, depositConfirmed } = body;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, params.id),
    with: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const updateData: Partial<typeof orders.$inferInsert> = {};

  // Admin can update order status and confirm deposit
  if (session.user.role === 'ADMIN') {
    if (status) updateData.status = status;
    if (depositConfirmed !== undefined) {
      updateData.depositConfirmed = depositConfirmed;
      if (depositConfirmed) {
        updateData.status = 'CONFIRMED';

        // Release reserved stock and deduct from actual stock
        for (const item of order.items) {
          await db.update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
              reserved: sql`${products.reserved} - ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }

        // Notify customer
        await db.insert(notifications).values({
          userId: order.userId,
          title: 'Deposit Confirmed',
          message: `Your deposit for order #${order.id.slice(-8).toUpperCase()} has been confirmed. Your order is being processed.`,
          type: 'ORDER',
        });
      }
    }
  }

  // Shipper can mark as shipped
  if (session.user.role === 'SHIPPER') {
    if (status === 'SHIPPED') {
      updateData.status = 'SHIPPED';
      updateData.shippedAt = new Date();

      await db.insert(notifications).values({
        userId: order.userId,
        title: 'Order Shipped',
        message: `Your order #${order.id.slice(-8).toUpperCase()} has been shipped!`,
        type: 'ORDER',
      });
    }
  }

  await db.update(orders).set(updateData).where(eq(orders.id, params.id));

  const updatedOrder = await db.query.orders.findFirst({
    where: eq(orders.id, params.id),
    with: {
      user: { columns: { id: true, name: true, email: true } },
      items: { with: { product: true } },
    },
  });

  return NextResponse.json(updatedOrder);
}
