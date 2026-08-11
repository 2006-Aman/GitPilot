import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getStats } from "@/lib/getStats";
import { getCachedData, setCachedData } from "@/lib/cache";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const cacheKey = `stats:${session.user.id}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const payload = await getStats(session.user.id);

    setCachedData(cacheKey, payload, 15000);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stats", details: String(err) }, { status: 500 });
  }
}
