import { NextResponse } from "next/server";
import { db } from "@/db";
import { runMaintenanceSeed } from "@/db/seeds";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const year = new Date().getFullYear();

    const result = await runMaintenanceSeed(db, year, (message) => {
      console.log(`[cron-seed] ${message}`);
    });

    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Cron seed failed:", error);

    return NextResponse.json(
      { success: false,
        error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 },
    );
  }
}