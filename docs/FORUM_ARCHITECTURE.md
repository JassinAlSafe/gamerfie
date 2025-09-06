# Forum System Architecture Documentation

## Overview
The Gamerfie forum system is a modern, hierarchical discussion platform built with Next.js, TypeScript, and Supabase. It supports nested comments, real-time updates, and comprehensive moderation features.

## Database Schema

### Core Tables

#### `forum_categories`
- **Purpose**: Organizes threads into topics
- **Key Fields**: `id`, `name`, `description`, `icon`, `color`
- **Relationships**: One-to-many with `forum_threads`

#### `forum_threads`
- **Purpose**: Main discussion topics
- **Key Fields**: 
  - `id`: UUID primary key
  - `category_id`: Links to category
  - `title`: Thread title
  - `content`: Main content
  - `author_id`: User who created thread
  - `is_pinned`: Admin-pinned threads
  - `is_locked`: Prevents new posts
  - `replies_count`: Cached count for performance
  - `last_post_at`: For sorting by activity
- **Indexes**: 
  - `idx_forum_threads_category_id`
  - `idx_forum_threads_created_at`
  - `idx_forum_threads_is_pinned`

#### `forum_posts`
- **Purpose**: Replies and nested comments
- **Key Fields**:
  - `id`: UUID primary key
  - `thread_id`: Parent thread
  - `parent_post_id`: For nested replies (self-referencing)
  - `depth`: Nesting level (0-5)
  - `content`: Post content
  - `replies_count`: Cached child count
- **Indexes**:
  - `idx_forum_posts_thread_id`
  - `idx_forum_posts_parent_post_id`
  - `idx_forum_posts_depth`

#### `forum_thread_likes` & `forum_post_likes`
- **Purpose**: User engagement tracking
- **Composite Indexes**: For fast duplicate checking

## Key Database Functions

### `get_thread_posts_hierarchical(thread_id, limit)`
- **Purpose**: Fetches posts in hierarchical structure using recursive CTE
- **Features**:
  - Builds comment tree with proper nesting
  - Includes author information
  - Calculates like status for current user
  - Sorts by creation path for proper display order
- **Security**: `SECURITY DEFINER` with `search_path = public`

### `create_forum_post_nested(thread_id, content, author_id, parent_post_id)`
- **Purpose**: Creates nested replies with automatic depth calculation
- **Features**:
  - Validates parent post exists
  - Calculates correct depth
  - Updates parent reply counts
  - Updates thread statistics
- **Security**: Schema-qualified table references prevent path issues

### `validate_forum_thread(thread_id)` & `validate_forum_parent_post(post_id, thread_id)`
- **Purpose**: Validation helpers for API routes
- **Features**: Schema-safe validation without direct table queries

### `toggle_thread_like(thread_id)` & `toggle_post_like(post_id)`
- **Purpose**: Manages user likes with toggle functionality
- **Returns**: JSON with new like status and count

## API Architecture

### `/api/forum/posts/hierarchical`
- **Method**: GET
- **Purpose**: Fetches hierarchical post structure
- **Parameters**: `thread_id`
- **Returns**: Nested comment tree

### `/api/forum/posts/nested`
- **Method**: POST
- **Purpose**: Creates nested replies
- **Validation**: Zod schema with UUID validation
- **Features**: 
  - Handles empty strings gracefully
  - Uses RPC functions for schema safety
  - Comprehensive error handling

### `/api/forum/threads`
- **Methods**: GET, POST
- **Purpose**: Thread CRUD operations
- **Features**: Pagination, filtering, search

## Frontend Components

### `HierarchicalCommentList`
- **Purpose**: Main component for displaying nested comments
- **Features**:
  - Progressive disclosure (expand/collapse)
  - Inline reply forms
  - Maximum depth limiting (default: 5 levels)
  - Optimistic UI updates

### `NestedComment`
- **Purpose**: Individual comment display
- **Features**:
  - Visual depth indication
  - Author information
  - Like/reply actions
  - Timestamp formatting

### `ThreadPageClient`
- **Purpose**: Thread detail page
- **Features**:
  - Real-time post updates
  - CSRF protection
  - Authentication integration
  - Error handling with toast notifications

## Security Architecture

### Row Level Security (RLS)
- **Read Access**: Public for all forum content
- **Write Access**: Authenticated users only
- **Update/Delete**: Users can only modify their own content
- **Admin Override**: Special policies for moderators

### CSRF Protection
- Custom hook: `useCsrfProtectedFetch`
- Token generation and validation
- Automatic header injection

### Function Security
- All functions use `SECURITY DEFINER`
- Explicit `search_path = public` prevents schema injection
- Input validation at multiple layers

## Performance Optimizations

### Database Indexes
- Strategic indexes on foreign keys
- Composite indexes for like lookups
- Partial indexes for filtered queries (pinned, locked)
- Descending indexes for time-based sorting

### Caching Strategy
- Reply counts cached in parent records
- Last post information cached in threads
- Client-side caching with React Query

### Query Optimization
- Recursive CTEs for efficient tree building
- Schema-qualified queries prevent lookup failures
- Batch operations where possible

## Best Practices Implemented

### 2025 Forum Standards
- **Self-referencing tables** for unlimited nesting
- **Recursive CTEs** for efficient hierarchical queries
- **Progressive disclosure** UI pattern
- **Optimistic updates** for better UX

### TypeScript Type Safety
- Comprehensive interfaces for all data structures
- Zod validation for API inputs
- Discriminated unions for state management

### Error Handling
- Graceful degradation for connection issues
- User-friendly error messages
- Detailed logging for debugging

## Maintenance Guidelines

### Adding New Features
1. Update database schema with migration
2. Add TypeScript types to `/types/forum.ts`
3. Create/update RPC functions with schema qualification
4. Update API routes with validation
5. Implement frontend components with error handling

### Common Issues & Solutions

#### "relation does not exist" Error
- **Cause**: Schema path corruption in connection pool
- **Solution**: Use fully qualified table names (`public.table_name`)

#### 400 Bad Request on API Calls
- **Cause**: Validation failure (often empty strings vs null)
- **Solution**: Transform empty strings to null in Zod schema

#### Nested Comments Not Displaying
- **Cause**: Missing hierarchical query function
- **Solution**: Ensure `get_thread_posts_hierarchical` exists and works

### Performance Monitoring
- Check index usage with `EXPLAIN ANALYZE`
- Monitor function execution times
- Track API response times
- Review React component re-renders

## Future Enhancements

### Planned Features
- Real-time updates with Supabase subscriptions
- Rich text editor for post content
- Image/file attachments
- User mentions and notifications
- Thread following/watching
- Advanced moderation tools

### Scalability Considerations
- Implement pagination for very long threads
- Consider caching layer for hot threads
- Add read replicas for heavy read loads
- Implement rate limiting at database level

## Migration History
1. `create_forum_schema.sql` - Initial schema creation
2. `fix_schema_qualified_forum_function` - Schema path fixes
3. `forum_cleanup_step1_remove_duplicates` - Remove redundant functions
4. `forum_cleanup_step2_remove_duplicate_policies` - Clean up RLS policies
5. `forum_cleanup_step3_add_performance_indexes` - Add performance indexes

## Testing Checklist
- [ ] Create new thread
- [ ] Reply to thread (root level)
- [ ] Reply to reply (nested)
- [ ] Like/unlike posts and threads
- [ ] Edit own posts
- [ ] Delete own posts
- [ ] Admin pin/lock threads
- [ ] Search functionality
- [ ] Pagination
- [ ] Error states (network, validation)

## Support & Documentation
- Supabase Dashboard: Check RLS policies and function definitions
- Database Linter: Run security advisors regularly
- Performance Monitoring: Use Supabase's built-in analytics
- Error Tracking: Monitor application logs for issues