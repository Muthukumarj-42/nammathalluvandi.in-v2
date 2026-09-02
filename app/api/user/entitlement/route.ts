import { NextResponse } from "next/server";
import { getUserEntitlement } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const entitlement = await getUserEntitlement(userId);

    return NextResponse.json({
      success: true,
      entitlement,
    });
  } catch (error: any) {
    console.error("Error fetching user entitlement:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user entitlement" },
      { status: 500 }
    );
  }
}
