import bcrypt from 'bcryptjs';
import { prisma } from "./prisma";

export type UserRole = "USER" | "ADMIN" | "STUDENT";

export type User = {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    displayName?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
};

export async function createUser(
    email: string,
    password: string,
    role: UserRole = "USER"
): Promise<User> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, role } });
    return user as User;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            createdAt: true,
            displayName: true,
            profilePicture: true,
            bio: true,
        },
    });
    return user as User | null;
}

export async function isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    return user?.role === "ADMIN";
}
