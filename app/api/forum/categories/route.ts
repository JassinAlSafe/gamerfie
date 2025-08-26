import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { 
  ForumApiErrorHandler,
  ForumApiResponse,
  withAuthenticatedUser,
  withDatabaseErrorHandling,
  validateRequestBody
} from "@/app/api/lib/forum-helpers";
import { createCategorySchema } from "@/lib/validations/forum";
import type { CategoriesResponse, CategoryResponse, CategoriesWithStatsResult } from "@/types/forum";
import type { AuthResult } from "@/app/api/lib/auth";

export async function GET(): Promise<NextResponse<CategoriesResponse>> {
  try {
    const supabase = await createClient();

    const result = await withDatabaseErrorHandling<CategoriesWithStatsResult[]>(
      async () => await supabase
        .from('forum_categories_with_stats')
        .select('*')
        .order('name')
    );

    if (!result.success) {
      return result.response;
    }

    return ForumApiResponse.success({
      categories: result.data
    });
  } catch (error) {
    console.error("Unexpected error fetching forum categories:", error);
    return ForumApiErrorHandler.internalError('Failed to fetch categories');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CategoryResponse>> {
  return withAuthenticatedUser(async (auth: AuthResult) => {
    try {
      // Validate request body
      const validation = await validateRequestBody(request, createCategorySchema);
      if (!validation.success) {
        return validation.response;
      }

      const categoryData = validation.data;

      // Create category in database
      const result = await withDatabaseErrorHandling(
        async () => await auth.supabase
          .from('forum_categories')
          .insert(categoryData)
          .select()
          .single()
      );

      if (!result.success) {
        return result.response;
      }

      return ForumApiResponse.created({
        category: result.data
      });
    } catch (error) {
      console.error("Unexpected error creating forum category:", error);
      return ForumApiErrorHandler.internalError('Failed to create category');
    }
  });
}