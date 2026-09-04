import { NextResponse } from "next/server";
import { db } from "@/db";
import { seedChampionships } from "@/db/seeds/championships";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await seedChampionships(
      db,
      (message) => console.log(message),
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Cron seed failed:", error);

    return NextResponse.json(
      { success: false, error: "Seed failed" },
      { status: 500 },
    );
  }
}