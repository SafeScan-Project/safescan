import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);
const ALLOWED_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
};
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json(
            { error: "No file uploaded" },
            { status: 400 },
        );
    }

    // Validate MIME type against the browser-reported value first (cheap check)
    if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
            { error: "Only JPEG, PNG, GIF, and WebP images are allowed" },
            { status: 400 },
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Enforce size limit
    if (buffer.byteLength > MAX_BYTES) {
        return NextResponse.json(
            { error: "Image must be 2 MB or smaller" },
            { status: 400 },
        );
    }

    // Validate magic bytes to prevent MIME spoofing.
    // We check the actual file header, not just the Content-Type the browser reported.
    if (!hasValidMagicBytes(buffer, file.type)) {
        return NextResponse.json(
            { error: "File content does not match declared type" },
            { status: 400 },
        );
    }

    // Use a server-chosen extension — never trust the client's filename
    const ext = ALLOWED_EXT[file.type];
    const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Create the uploads directory if it doesn't exist (idempotent)
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buffer);
    return NextResponse.json({ url: `/uploads/${fileName}` });
}

/** Verify the first bytes of the buffer match the expected image format. */
function hasValidMagicBytes(buf: Buffer, mime: string): boolean {
    if (buf.length < 4) return false;
    switch (mime) {
        case "image/jpeg":
            return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        case "image/png":
            return (
                buf[0] === 0x89 &&
                buf[1] === 0x50 &&
                buf[2] === 0x4e &&
                buf[3] === 0x47
            );
        case "image/gif":
            return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46;
        case "image/webp":
            // RIFF????WEBP
            return (
                buf.subarray(0, 4).toString("ascii") === "RIFF" &&
                buf.subarray(8, 12).toString("ascii") === "WEBP"
            );
        default:
            return false;
    }
}
