import { NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  // Validate token and update password
  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: reset.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.delete({ where: { token } });
  return NextResponse.json({ ok: true });
}
