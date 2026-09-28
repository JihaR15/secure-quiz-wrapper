import { NextResponse } from "next/server";
import { findAdminByEmail, getStorageKind } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Reports which storage backend is live and whether it can actually be
 * reached. Useful for verifying a Supabase connection after deploy: the
 * difference between "not logged in" and "the database is unreachable" is
 * otherwise invisible from the outside.
 */
export async function GET() {
  const storage = getStorageKind();
  const isProduction = process.env.NODE_ENV === "production";

  if (storage === "json") {
    return NextResponse.json({
      storage,
      reachable: true,
      detail: "DATABASE_URL is not set, using .data/db.json. Serverless hosts cannot write here.",
    });
  }

  const startedAt = Date.now();
  try {
    await findAdminByEmail("health-check@__none__.invalid");
    return NextResponse.json({
      storage,
      reachable: true,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        storage,
        reachable: false,
        // The driver error can echo parts of the connection string, so it is
        // only surfaced outside production.
        detail: isProduction ? null : error instanceof Error ? error.message : String(error),
        hint: "Check DATABASE_URL, port 5432 (Session pooler), and that supabase/schema.sql has been run.",
      },
      { status: 503 }
    );
  }
}
