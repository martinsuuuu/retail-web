import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/db/schema';
import { eq, desc, isNull, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let notificationsData;

  if (session.user.role === 'ADMIN') {
    // Admin sees all notifications (including global ones with no userId)
    notificationsData = await db.select().from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  } else {
    // Others see only their own notifications
    notificationsData = await db.select().from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  const unreadCount = notificationsData.filter(n => !n.read).length;

  return NextResponse.json({ notifications: notificationsData, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, markAllRead } = body;

  if (markAllRead) {
    if (session.user.role === 'ADMIN') {
      await db.update(notifications).set({ read: true });
    } else {
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, session.user.id));
    }
    return NextResponse.json({ success: true });
  }

  if (id) {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
