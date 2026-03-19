import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from 'lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      displayName: true,
      profilePicture: true,
      bio: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { displayName, profilePicture, bio } = await request.json();
  try {
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          displayName,
          profilePicture,
          bio,
        },
      });
    } else {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          displayName,
          profilePicture,
          bio,
        },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update profile', details: e.message || String(e) }, { status: 500 });
  }
}
