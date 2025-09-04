import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  ForumApiErrorHandler,
  ForumApiResponse,
  withDatabaseErrorHandling,
  validateSearchParams,
  createPaginationMeta
} from "@/app/api/lib/forum-helpers";
import { validateSearch } from "@/lib/validations/forum";
import type { SearchResponse, SearchResult } from "@/types/forum";

// Force dynamic route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Map 'q' parameter to 'query' for validation
    const queryParam = searchParams.get('q');
    if (queryParam) {
      searchParams.set('query', queryParam);
    }
    
    // Validate search parameters
    const validation = validateSearchParams(searchParams, validateSearch);
    if (!validation.success) {
      return validation.response as NextResponse<SearchResponse>;
    }
    
    const { query, type, category_id, page = 1, limit = 20 } = validation.data;
    const offset = (page - 1) * limit;
    const searchStart = performance.now();

    const supabase = await createClient();

    // Search forum content using the database function
    const dbResult = await supabase.rpc('search_forum_content', {
      p_query: query.trim(),
      p_type: type,
      p_category_id: category_id,
      p_limit: limit,
      p_offset: offset
    });

    const result = await withDatabaseErrorHandling<SearchResult[]>(
      () => Promise.resolve(dbResult)
    );

    if (!result.success) {
      return result.response as NextResponse<SearchResponse>;
    }

    const searchTime = performance.now() - searchStart;
    const pagination = createPaginationMeta(page, limit, result.data?.length ?? 0);

    return ForumApiResponse.success({
      results: result.data || [],
      pagination,
      query,
      searchTime: Math.round(searchTime)
    }) as NextResponse<SearchResponse>;
  } catch (error) {
    console.error("Unexpected error in forum search:", error);
    return ForumApiErrorHandler.internalError('Failed to search forum') as NextResponse<SearchResponse>;
  }
}