import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const createBadgeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  icon_url: z.string().url().optional(),
});

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: badges, error } = await supabase
      .from("badges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to verify admin status" },
        { status: 500 }
      );
    }

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createBadgeSchema.parse(body);

    // Create the badge
    const { data: badge, error: insertError } = await supabase
      .from("badges")
      .insert([validatedData])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting badge:", insertError);
      throw insertError;
    }

    if (!badge) {
      throw new Error("Failed to create badge - no data returned");
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error("Error in POST /api/badges:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create badge",
        details: error
      },
      { status: 500 }
    );
  }
} 