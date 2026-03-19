import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from 'lib/prisma';

// Allows user to update notes for their own scan
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { id, notes } = await request.json();
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing scan id' }, { status: 400 });
  }
  // Only allow editing scans owned by the user
  const scan = await prisma.scan.findUnique({ where: { id } });
  if (!scan || scan.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
  }
  await prisma.scan.update({ where: { id }, data: { notes } });
  return NextResponse.json({ ok: true });
}
