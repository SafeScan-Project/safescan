import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from 'lib/prisma';

// Allows user to delete their own scan
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { id } = await request.json();
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing scan id' }, { status: 400 });
  }
  // Only allow deleting scans owned by the user
  const scan = await prisma.scan.findUnique({ where: { id } });
  if (!scan || scan.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
  }
  await prisma.scan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
