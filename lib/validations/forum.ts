import { z } from 'zod';

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format');
const contentSchema = z.string()
  .min(1, 'Content cannot be empty')
  .max(10000, 'Content cannot exceed 10,000 characters')
  .refine(content => content.trim().length > 0, 'Content cannot be only whitespace');

const titleSchema = z.string()
  .min(1, 'Title cannot be empty')
  .max(200, 'Title cannot exceed 200 characters')
  .refine(title => title.trim().length > 0, 'Title cannot be only whitespace');

const usernameSchema = z.string()
  .min(1, 'Username cannot be empty')
  .max(50, 'Username cannot exceed 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.coerce.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .max(10000, 'Page cannot exceed 10,000')
    .default(1),
  
  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20)
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name cannot be empty')
    .max(100, 'Category name cannot exceed 100 characters')
    .refine(name => name.trim().length > 0, 'Category name cannot be only whitespace'),
  
  description: z.string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters')
    .refine(desc => desc.trim().length > 0, 'Description cannot be only whitespace'),
  
  icon: z.string()
    .max(10, 'Icon cannot exceed 10 characters')
    .regex(/^[\p{Emoji}\p{Symbol}\p{So}]$/u, 'Icon must be a single emoji or symbol')
    .default('📁'),
  
  color: z.enum([
    'blue', 'green', 'purple', 'red', 'yellow', 'orange', 'pink', 'indigo', 'gray'
  ]).default('blue')
});

export const updateCategorySchema = createCategorySchema.partial();

// Thread validation schemas
export const createThreadSchema = z.object({
  category_id: uuidSchema,
  title: titleSchema,
  content: contentSchema
});

export const updateThreadSchema = z.object({
  title: titleSchema.optional(),
  content: contentSchema.optional(),
  is_pinned: z.boolean().optional(),
  is_locked: z.boolean().optional()
});

export const threadQuerySchema = paginationSchema.extend({
  category_id: uuidSchema.optional(),
  search: z.string()
    .max(100, 'Search query cannot exceed 100 characters')
    .optional(),
  
  sort: z.enum(['newest', 'oldest', 'popular', 'most_replies'])
    .default('newest'),
  
  pinned_only: z.enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

// Post validation schemas
export const createPostSchema = z.object({
  thread_id: uuidSchema,
  content: contentSchema,
  parent_post_id: uuidSchema.optional().nullable().transform(val => val === null ? undefined : val)
});

export const updatePostSchema = z.object({
  content: contentSchema
});

export const postQuerySchema = paginationSchema.extend({
  thread_id: uuidSchema
});

// Like validation schemas
export const toggleLikeSchema = z.object({
  target_id: uuidSchema,
  target_type: z.enum(['thread', 'post'])
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query cannot exceed 100 characters')
    .refine(query => query.trim().length > 0, 'Search query cannot be only whitespace'),
  
  type: z.enum(['all', 'threads', 'posts']).default('all'),
  category_id: uuidSchema.optional(),
  ...paginationSchema.shape
});

// Report validation schema
export const reportContentSchema = z.object({
  target_id: uuidSchema,
  target_type: z.enum(['thread', 'post']),
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate_content',
    'off_topic',
    'copyright_violation',
    'misinformation',
    'other'
  ]),
  
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
});

// User profile validation for forum context
export const forumUserProfileSchema = z.object({
  username: usernameSchema,
  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .nullable(),
  
  avatar_url: z.string()
    .url('Invalid avatar URL')
    .optional()
    .nullable()
});

// Type exports for use in components and API routes
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type CreateThreadData = z.infer<typeof createThreadSchema>;
export type UpdateThreadData = z.infer<typeof updateThreadSchema>;
export type ThreadQueryParams = z.infer<typeof threadQuerySchema>;
export type CreatePostData = z.infer<typeof createPostSchema>;
export type UpdatePostData = z.infer<typeof updatePostSchema>;
export type PostQueryParams = z.infer<typeof postQuerySchema>;
export type ToggleLikeData = z.infer<typeof toggleLikeSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type ReportContentData = z.infer<typeof reportContentSchema>;
export type ForumUserProfileData = z.infer<typeof forumUserProfileSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;

// Validation result type for consistent error handling
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

// Generic validation helper
function createValidator<T>(schema: z.ZodType<T>) {
  return (data: unknown): ValidationResult<T> => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        
        const errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
          
        return { 
          success: false, 
          error: errorMessage,
          errors 
        };
      }
      return { success: false, error: 'Invalid data format' };
    }
  };
}

// Validation helper functions
export const validateCreateCategory = createValidator(createCategorySchema);
export const validateUpdateCategory = createValidator(updateCategorySchema);
export const validateCreateThread = createValidator(createThreadSchema);
export const validateUpdateThread = createValidator(updateThreadSchema);
export const validateThreadQuery = (data: unknown): ValidationResult<ThreadQueryParams> => {
  try {
    const result = threadQuerySchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      const errorMessage = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
        
      return { 
        success: false, 
        error: errorMessage,
        errors 
      };
    }
    return { success: false, error: 'Invalid data format' };
  }
};
export const validateCreatePost = createValidator(createPostSchema);
export const validateUpdatePost = createValidator(updatePostSchema);
export const validatePostQuery = createValidator(postQuerySchema);
export const validateToggleLike = createValidator(toggleLikeSchema);
export const validateSearch = createValidator(searchSchema);
export const validateReportContent = createValidator(reportContentSchema);
export const validateForumUserProfile = createValidator(forumUserProfileSchema);
export const validatePagination = createValidator(paginationSchema);

// UUID validation helper
export function validateUUID(id: unknown): ValidationResult<string> {
  return createValidator(uuidSchema)(id);
}

// Custom validation for URL search params
export function validateSearchParams(searchParams: URLSearchParams, schema: z.ZodSchema) {
  const params: Record<string, string | string[]> = {};
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      // Handle multiple values for the same key
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }
  
  return createValidator(schema)(params);
}