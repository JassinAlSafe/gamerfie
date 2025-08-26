import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Search forum content using the database function
    const { data: results, error } = await supabase
      .rpc('search_forum', { search_query: query.trim() });

    if (error) {
      console.error("Error searching forum:", error);
      return NextResponse.json(
        { error: "Failed to search forum" },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: results || [] });
  } catch (error) {
    console.error("Error in forum search:", error);
    return NextResponse.json(
      { error: "Failed to search forum" },
      { status: 500 }
    );
  }
}