import { NextRequest, NextResponse } from "next/server";
import { withAuthenticatedUser } from "@/app/api/lib/forum-helpers";

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(async (auth) => {
    try {
      // TODO: Add admin role check here
      // For now, allowing any authenticated user to create categories
      
      const body = await request.json();
      const { name, description, icon, color } = body;

      if (!name) {
        return NextResponse.json(
          { error: "Category name is required" },
          { status: 400 }
        );
      }

      const { data, error } = await auth.supabase
        .from("forum_categories")
        .insert({
          name,
          description: description || null,
          icon: icon || "💬",
          color: color || "#3b82f6",
          threads_count: 0,
          posts_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating forum category:", error);
        return NextResponse.json(
          { error: "Failed to create category" },
          { status: 500 }
        );
      }

      return NextResponse.json({ category: data });
    } catch (error) {
      console.error("Unexpected error creating forum category:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}