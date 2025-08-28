import { NextRequest, NextResponse } from "next/server";
import { withAuthenticatedUser } from "@/app/api/lib/forum-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  return withAuthenticatedUser(async (auth) => {
    try {
      const { categoryId } = params;
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
        .update({
          name,
          description: description || null,
          icon: icon || "💬",
          color: color || "#3b82f6",
          updated_at: new Date().toISOString()
        })
        .eq("id", categoryId)
        .select()
        .single();

      if (error) {
        console.error("Error updating forum category:", error);
        return NextResponse.json(
          { error: "Failed to update category" },
          { status: 500 }
        );
      }

      return NextResponse.json({ category: data });
    } catch (error) {
      console.error("Unexpected error updating forum category:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  return withAuthenticatedUser(async (auth) => {
    try {
      const { categoryId } = params;

      // First check if there are any threads in this category
      const { data: threads, error: threadsError } = await auth.supabase
        .from("forum_threads")
        .select("id")
        .eq("category_id", categoryId)
        .limit(1);

      if (threadsError) {
        console.error("Error checking threads:", threadsError);
        return NextResponse.json(
          { error: "Failed to check category usage" },
          { status: 500 }
        );
      }

      if (threads && threads.length > 0) {
        return NextResponse.json(
          { error: "Cannot delete category with existing threads" },
          { status: 400 }
        );
      }

      const { error } = await auth.supabase
        .from("forum_categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("Error deleting forum category:", error);
        return NextResponse.json(
          { error: "Failed to delete category" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Unexpected error deleting forum category:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}