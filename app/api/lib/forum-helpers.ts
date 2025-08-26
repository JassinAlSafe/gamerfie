import { NextResponse } from "next/server";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type {
  ValidationError,
  AuthError,
  DatabaseError,
  RateLimitError,
  PaginationMeta,
  UserProfile
} from "@/types/forum";
import { authenticateRequest, type AuthResult } from "./auth";

// Standard error responses
export class ForumApiErrorHandler {
  static validationError(message: string, field?: string, errors?: Record<string, string[]>): NextResponse {
    const error: ValidationError = {
      code: 'VALIDATION_ERROR',
      message,
      field: field || 'unknown',
      validationDetails: errors || {}
    };
    
    return NextResponse.json(
      { 
        error: message,
        code: error.code,
        details: error.validationDetails 
      },
      { status: 400 }
    );
  }

  static authError(message: string = 'Authentication required'): NextResponse {
    const error: AuthError = {
      code: 'AUTH_ERROR',
      message
    };
    
    return NextResponse.json(
      { 
        error: message,
        code: error.code 
      },
      { status: 401 }
    );
  }

  static forbiddenError(message: string = 'Access forbidden'): NextResponse {
    const error: AuthError = {
      code: 'FORBIDDEN',
      message
    };
    
    return NextResponse.json(
      { 
        error: message,
        code: error.code 
      },
      { status: 403 }
    );
  }

  static notFoundError(message: string = 'Resource not found'): NextResponse {
    const error: DatabaseError = {
      code: 'NOT_FOUND',
      message
    };
    
    return NextResponse.json(
      { 
        error: message,
        code: error.code 
      },
      { status: 404 }
    );
  }

  static databaseError(message: string = 'Database operation failed', constraint?: string): NextResponse {
    const error: DatabaseError = {
      code: 'DATABASE_ERROR',
      message,
      constraint
    };
    
    return NextResponse.json(
      { 
        error: message,
        code: error.code,
        ...(constraint && { constraint })
      },
      { status: 500 }
    );
  }

  static rateLimitError(retryAfter: number = 60): NextResponse {
    const error: RateLimitError = {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded',
      retryAfter
    };
    
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString()
        }
      }
    );
  }

  static internalError(message: string = 'Internal server error'): NextResponse {
    return NextResponse.json(
      { 
        error: message,
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }

  static notFound(message: string = 'Resource not found'): NextResponse {
    return NextResponse.json(
      { 
        error: message,
        code: 'NOT_FOUND' 
      },
      { status: 404 }
    );
  }

  static forbidden(message: string = 'Access forbidden'): NextResponse {
    return NextResponse.json(
      { 
        error: message,
        code: 'FORBIDDEN' 
      },
      { status: 403 }
    );
  }

  static fromZodError(error: z.ZodError): NextResponse {
    const errors: Record<string, string[]> = {};
    error.errors.forEach(err => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    
    const message = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ');
      
    return this.validationError(message, Object.keys(errors)[0], errors);
  }

  static fromPostgrestError(error: PostgrestError): NextResponse {
    console.error('Database error:', error);
    
    // Handle specific constraint violations
    if (error.code === '23505') { // unique_violation
      return this.databaseError('Resource already exists', error.details);
    }
    
    if (error.code === '23503') { // foreign_key_violation
      return this.databaseError('Referenced resource not found', error.details);
    }
    
    if (error.code === '23502') { // not_null_violation
      return this.databaseError('Required field missing', error.details);
    }
    
    if (error.code === '42501') { // insufficient_privilege
      return this.forbiddenError('Insufficient permissions');
    }
    
    // Generic database error
    return this.databaseError(error.message, error.code);
  }
}

// Validation helper
export function validateAndHandleErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        response: ForumApiErrorHandler.fromZodError(error) 
      };
    }
    return { 
      success: false, 
      response: ForumApiErrorHandler.validationError('Invalid data format') 
    };
  }
}

// Pagination helper
export function createPaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    total: totalItems,
    totalPages,
    hasMore: page < totalPages
  };
}

// URL search params validation helper
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  validator: (data: unknown) => { success: true; data: T } | { success: false; error: string; errors?: Record<string, string[]> }
): { success: true; data: T } | { success: false; response: NextResponse } {
  const params: Record<string, string | string[]> = {};
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }
  
  const result = validator(params);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      response: ForumApiErrorHandler.validationError(result.error, undefined, result.errors)
    };
  }
}

// User profile management helper
export async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  userMetadata?: { username?: string; full_name?: string; avatar_url?: string; email?: string }
): Promise<UserProfile | NextResponse> {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user profile:', fetchError);
      return ForumApiErrorHandler.fromPostgrestError(fetchError);
    }

    if (existingProfile) {
      return existingProfile as UserProfile;
    }

    // Create profile if it doesn't exist
    const username = userMetadata?.username || 
                    userMetadata?.full_name || 
                    userMetadata?.email?.split('@')[0] || 
                    'User';

    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username,
        avatar_url: userMetadata?.avatar_url || null,
        bio: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return ForumApiErrorHandler.fromPostgrestError(insertError);
    }

    return newProfile as UserProfile;
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error);
    return ForumApiErrorHandler.internalError('Failed to manage user profile');
  }
}

// Thread permission helpers
export async function checkThreadPermissions(
  supabase: SupabaseClient,
  threadId: string,
  userId: string,
  action: 'read' | 'write' | 'moderate'
): Promise<{ allowed: boolean; thread?: any } | NextResponse> {
  try {
    const { data: thread, error } = await supabase
      .from('forum_threads')
      .select('id, is_locked, author_id')
      .eq('id', threadId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return ForumApiErrorHandler.notFoundError('Thread not found');
      }
      return ForumApiErrorHandler.fromPostgrestError(error);
    }

    // Check specific permissions
    switch (action) {
      case 'read':
        return { allowed: true, thread };
      
      case 'write':
        if (thread.is_locked) {
          return { allowed: false };
        }
        return { allowed: true, thread };
      
      case 'moderate':
        // Only thread author or admin can moderate (admin check would be added here)
        return { allowed: thread.author_id === userId, thread };
      
      default:
        return { allowed: false };
    }
  } catch (error) {
    console.error('Error checking thread permissions:', error);
    return ForumApiErrorHandler.internalError('Failed to check permissions');
  }
}

// Standard success responses
export class ForumApiResponse {
  static success<T>(data: T, meta?: PaginationMeta): NextResponse {
    return NextResponse.json({
      ...data,
      ...(meta && { meta })
    });
  }

  static created<T>(data: T): NextResponse {
    return NextResponse.json(data, { status: 201 });
  }

  static noContent(): NextResponse {
    return NextResponse.json(null, { status: 204 });
  }

  static paginated<T extends Record<string, any>>(
    data: T,
    pagination: PaginationMeta
  ): NextResponse {
    return NextResponse.json({
      ...data,
      pagination
    });
  }
}

// Request body validation helper
export async function validateRequestBody<T>(
  request: Request,
  validator: (data: unknown) => { success: true; data: T } | { success: false; error: string; errors?: Record<string, string[]> }
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = validator(body);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        response: ForumApiErrorHandler.validationError(result.error, undefined, result.errors)
      };
    }
  } catch {
    return {
      success: false,
      response: ForumApiErrorHandler.validationError('Invalid JSON in request body')
    };
  }
}

// Authenticated request wrapper
export async function withAuthenticatedUser<T>(
  handler: (auth: AuthResult) => Promise<NextResponse | T>
): Promise<NextResponse | T> {
  const authResult = await authenticateRequest();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  return handler(authResult);
}

// Database operation wrapper with error handling
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return {
        success: false,
        response: ForumApiErrorHandler.fromPostgrestError(error)
      };
    }
    
    if (!data) {
      return {
        success: false,
        response: ForumApiErrorHandler.notFoundError()
      };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected database error:', error);
    return {
      success: false,
      response: ForumApiErrorHandler.internalError('Database operation failed')
    };
  }
}

// Permission utility functions
/**
 * Check if user can delete a forum post
 */
export function canDeletePost(
  post: { author_id: string },
  userId: string,
  userRole?: string
): boolean {
  // Admins and moderators can delete anything
  if (userRole === 'admin' || userRole === 'moderator') {
    return true;
  }
  
  // Authors can delete their own posts
  if (post.author_id === userId) {
    return true;
  }
  
  return false;
}

/**
 * Check if user can delete a forum thread
 */
export function canDeleteThread(
  thread: { author_id: string; replies_count: number; created_at: string },
  userId: string,
  userRole?: string
): { canDelete: boolean; reason?: string } {
  // Admins and moderators can delete anything
  if (userRole === 'admin' || userRole === 'moderator') {
    return { canDelete: true };
  }
  
  // Users can only delete their own threads
  if (thread.author_id !== userId) {
    return { canDelete: false, reason: 'You can only delete your own threads' };
  }
  
  // Check if thread has replies and time limit
  if (thread.replies_count > 0) {
    const createdAt = new Date(thread.created_at);
    const now = new Date();
    const timeDifferenceHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const gracePeriodHours = 1;
    
    if (timeDifferenceHours > gracePeriodHours) {
      return { 
        canDelete: false, 
        reason: 'Cannot delete threads with replies after 1 hour' 
      };
    }
  }
  
  return { canDelete: true };
}

/**
 * Check if user can moderate forum content (lock, pin, etc.)
 */
export function canModerate(userRole?: string): boolean {
  return userRole === 'admin' || userRole === 'moderator';
}