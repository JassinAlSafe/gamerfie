import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { 
  ForumApiErrorHandler,
  ForumApiResponse,
  withAuthenticatedUser,
  withDatabaseErrorHandling,
  validateRequestBody
} from "@/app/api/lib/forum-helpers";
import { validateCreateCategory } from "@/lib/validations/forum";
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
      return result.response as NextResponse<CategoriesResponse>;
    }

    const response = ForumApiResponse.success({
      categories: result.data
    }) as NextResponse<CategoriesResponse>;
    
    // Add caching headers for performance (5 min cache, 10 min stale)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Unexpected error fetching forum categories:", error);
    return ForumApiErrorHandler.internalError('Failed to fetch categories') as NextResponse<CategoriesResponse>;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CategoryResponse>> {
  const result = await withAuthenticatedUser(async (auth: AuthResult): Promise<NextResponse<CategoryResponse>> => {
    try {
      // Validate request body
      const validation = await validateRequestBody(request, validateCreateCategory);
      if (!validation.success) {
        return validation.response as NextResponse<CategoryResponse>;
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
        return result.response as NextResponse<CategoryResponse>;
      }

      return ForumApiResponse.created({
        category: result.data
      }) as NextResponse<CategoryResponse>;
    } catch (error) {
      console.error("Unexpected error creating forum category:", error);
      return ForumApiErrorHandler.internalError('Failed to create category') as NextResponse<CategoryResponse>;
    }
  });
  
  return result as NextResponse<CategoryResponse>;
}