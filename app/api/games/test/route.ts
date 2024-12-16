import { NextResponse } from "next/server";
import { IGDBService } from "@/services/igdb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isConnected = await IGDBService.testConnection();
    return NextResponse.json({ success: isConnected });
  } catch (error) {
    console.error("Error testing IGDB connection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test IGDB connection' },
      { status: 500 }
    );
  }
} 