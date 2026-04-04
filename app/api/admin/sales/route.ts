import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, expenses } from '@/db/schema';
import { inArray, and, gte, lte, asc } from 'drizzle-orm';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'monthly';

  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);

  if (period === 'daily') {
    startDate = startOfDay(subDays(now, 29));
  } else if (period === 'weekly') {
    startDate = startOfWeek(subDays(now, 83));
  } else {
    startDate = startOfMonth(subDays(now, 364));
  }

  const ordersData = await db.query.orders.findMany({
    where: and(
      inArray(orders.status, ['CONFIRMED', 'SHIPPED', 'DELIVERED']),
      gte(orders.createdAt, startDate),
      lte(orders.createdAt, endDate)
    ),
    with: { items: true },
    orderBy: asc(orders.createdAt),
  });

  // Group by period
  const salesMap = new Map<string, { revenue: number; orders: number; items: number }>();

  for (const order of ordersData) {
    let key: string;
    if (period === 'daily') {
      key = format(order.createdAt, 'MMM dd');
    } else if (period === 'weekly') {
      key = format(startOfWeek(order.createdAt), 'MMM dd');
    } else {
      key = format(order.createdAt, 'MMM yyyy');
    }

    const existing = salesMap.get(key) || { revenue: 0, orders: 0, items: 0 };
    existing.revenue += order.totalAmount;
    existing.orders += 1;
    existing.items += order.items.reduce((sum, item) => sum + item.quantity, 0);
    salesMap.set(key, existing);
  }

  const salesData = Array.from(salesMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));

  // Summary stats
  const totalRevenue = ordersData.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = ordersData.length;

  // Expenses in period
  const expensesData = await db.select().from(expenses)
    .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)));
  const totalExpenses = expensesData.reduce((sum, e) => sum + e.amount, 0);

  return NextResponse.json({
    salesData,
    summary: {
      totalRevenue,
      totalOrders,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    },
  });
}
