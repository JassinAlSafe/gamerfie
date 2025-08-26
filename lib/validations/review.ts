import { z } from 'zod';

// Base review validation schema
export const createReviewSchema = z.object({
  game_id: z.string()
    .min(1, 'Game ID is required')
    .max(255, 'Game ID is too long'),
  
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating must be at most 10'),
  
  review_text: z.string()
    .max(5000, 'Review text cannot exceed 5000 characters')
    .optional(),
  
  is_public: z.boolean()
    .default(true),
  
  playtime_at_review: z.number()
    .int('Playtime must be a whole number')
    .min(0, 'Playtime cannot be negative')
    .max(100000, 'Playtime value is too large') // 100,000 hours max
    .optional(),
  
  is_recommended: z.boolean()
    .optional()
});

// Update review schema (allows partial updates)
export const updateReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating must be at most 10')
    .optional(),
  
  review_text: z.string()
    .max(5000, 'Review text cannot exceed 5000 characters')
    .optional(),
  
  is_public: z.boolean()
    .optional(),
  
  playtime_at_review: z.number()
    .int('Playtime must be a whole number')
    .min(0, 'Playtime cannot be negative')
    .max(100000, 'Playtime value is too large')
    .optional()
    .nullable(),
  
  is_recommended: z.boolean()
    .optional()
});

// Query parameters validation for GET requests
export const reviewsQuerySchema = z.object({
  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  
  offset: z.coerce.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0),
  
  gameId: z.string()
    .min(1, 'Game ID cannot be empty')
    .optional(),
  
  userId: z.string()
    .uuid('Invalid user ID format')
    .optional(),
  
  isPublic: z.enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  
  orderBy: z.enum(['created_at', 'rating', 'likes_count'])
    .default('created_at'),
  
  orderDirection: z.enum(['asc', 'desc'])
    .default('desc')
});

// UUID validation for review IDs
export const reviewIdSchema = z.string()
  .uuid('Invalid review ID format');

// Report review schema
export const reportReviewSchema = z.object({
  reason: z.enum([
    'spam',
    'harassment', 
    'inappropriate_content',
    'fake_review',
    'copyright_violation',
    'other'
  ]),
  
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
});

// Type exports for use in components and API routes
export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type UpdateReviewData = z.infer<typeof updateReviewSchema>;
export type ReviewsQueryParams = z.infer<typeof reviewsQuerySchema>;
export type ReportReviewData = z.infer<typeof reportReviewSchema>;

// Validation helper functions
export function validateCreateReview(data: unknown): { success: true; data: CreateReviewData } | { success: false; error: string } {
  try {
    const result = createReviewSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: errorMessages.join(', ') };
    }
    return { success: false, error: 'Invalid data format' };
  }
}

export function validateUpdateReview(data: unknown): { success: true; data: UpdateReviewData } | { success: false; error: string } {
  try {
    const result = updateReviewSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: errorMessages.join(', ') };
    }
    return { success: false, error: 'Invalid data format' };
  }
}

export function validateReviewsQuery(params: unknown): { success: true; data: ReviewsQueryParams } | { success: false; error: string } {
  try {
    const result = reviewsQuerySchema.parse(params);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: errorMessages.join(', ') };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}

export function validateReviewId(id: unknown): { success: true; data: string } | { success: false; error: string } {
  try {
    const result = reviewIdSchema.parse(id);
    return { success: true, data: result };
  } catch {
    return { success: false, error: 'Invalid review ID format' };
  }
}

export function validateReportReview(data: unknown): { success: true; data: ReportReviewData } | { success: false; error: string } {
  try {
    const result = reportReviewSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: errorMessages.join(', ') };
    }
    return { success: false, error: 'Invalid report data' };
  }
}