import { db } from "@/lib/db";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const existing = await db.rateLimitCounter.findUnique({ where: { key } });

    if (!existing || existing.resetAt <= now) {
      await db.rateLimitCounter.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return true;
    }

    if (existing.count >= limit) {
      return false;
    }

    await db.rateLimitCounter.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    // Lightweight periodic cleanup.
    if (Math.random() < 0.02) {
      void db.rateLimitCounter.deleteMany({
        where: { resetAt: { lt: now } },
      });
    }

    return true;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fallback to allow traffic if rate-limit storage has an issue.
    return true;
  }
}

export async function rateLimitByIp(
  request: Request,
  scope: string,
  limit = 10,
  windowMs = 60_000
): Promise<boolean> {
  const ip = getClientIp(request);
  return rateLimit(`${scope}:ip:${ip}`, limit, windowMs);
}
