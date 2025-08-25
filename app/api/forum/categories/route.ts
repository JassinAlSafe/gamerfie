import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    // const supabase = await createClient();

    // Mock data for now - will be replaced with actual database queries
    const categories = [
      {
        id: "general",
        name: "General Discussion",
        description: "Talk about anything gaming related",
        icon: "💬",
        color: "blue",
        threads_count: 45,
        posts_count: 312,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "game-reviews",
        name: "Game Reviews & Recommendations",
        description: "Share your thoughts on games you've played",
        icon: "⭐",
        color: "yellow",
        threads_count: 28,
        posts_count: 156,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "help-support",
        name: "Help & Support",
        description: "Get help with games, technical issues, and more",
        icon: "🆘",
        color: "red",
        threads_count: 12,
        posts_count: 67,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "showcases",
        name: "Screenshots & Showcases",
        description: "Show off your gaming achievements and screenshots",
        icon: "📸",
        color: "purple",
        threads_count: 34,
        posts_count: 89,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, description, icon, color } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual database creation
    // For now, return success response
    const newCategory = {
      id: `category-${Date.now()}`,
      name,
      description,
      icon: icon || "📁",
      color: color || "blue",
      threads_count: 0,
      posts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating forum category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}