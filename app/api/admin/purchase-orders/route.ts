import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { purchaseOrders, purchaseOrderItems } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.query.purchaseOrders.findMany({
    with: {
      items: { with: { product: true } },
    },
    orderBy: desc(purchaseOrders.createdAt),
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { supplier, items } = body;

  if (!supplier || !items || items.length === 0) {
    return NextResponse.json({ error: 'Supplier and items are required' }, { status: 400 });
  }

  let totalCost = 0;
  for (const item of items) {
    totalCost += item.quantity * item.unitCost;
  }

  const newPOArr = await db.insert(purchaseOrders).values({
    supplier,
    totalCost,
    status: 'PENDING',
  }).returning();
  const purchaseOrder = newPOArr[0];

  for (const item of items) {
    await db.insert(purchaseOrderItems).values({
      purchaseOrderId: purchaseOrder.id,
      productId: item.productId,
      quantity: parseInt(item.quantity),
      unitCost: parseFloat(item.unitCost),
    });
  }

  const fullPO = await db.query.purchaseOrders.findFirst({
    where: (po, { eq }) => eq(po.id, purchaseOrder.id),
    with: {
      items: { with: { product: true } },
    },
  });

  return NextResponse.json(fullPO, { status: 201 });
}
