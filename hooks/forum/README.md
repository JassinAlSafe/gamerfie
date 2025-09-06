# Forum Hooks

A collection of custom React hooks for managing forum functionality in the Gamerfie application.

## Overview

These hooks provide a clean separation of concerns by extracting complex forum logic from components into reusable, testable hooks.

## Hooks

### `useForum` - Primary Hook

The main composite hook that combines all forum functionality.

```typescript
import { useForum } from '@/hooks/forum';

const MyComponent = ({ thread, initialPosts }) => {
  const {
    thread,
    posts,
    isLoadingPosts,
    isSubmitting,
    createPost,
    likePost,
    likeThread,
    isAuthenticated,
  } = useForum({
    thread: initialThread,
    initialPosts,
  });

  // Use the forum functionality
};
```

**Features:**
- Thread state management
- Posts CRUD operations with optimistic updates
- Like/unlike functionality
- Authentication state
- Loading states

### `useForumPosts` - Posts Management

Manages forum posts with hierarchical structure.

```typescript
import { useForumPosts } from '@/hooks/forum';

const {
  posts,
  isLoadingPosts,
  isSubmitting,
  createPost,
  updatePostLike,
  refreshPosts,
} = useForumPosts({
  threadId: 'uuid',
  initialPosts: [],
});
```

**Features:**
- Hierarchical post loading
- Optimistic post creation
- Parent-child relationship management
- Reply count updates
- Background data synchronization

### `useForumThread` - Thread Operations

Manages thread state and operations.

```typescript
import { useForumThread } from '@/hooks/forum';

const {
  thread,
  setThread,
  updateThreadLike,
  incrementViews,
  updateReplyCount,
} = useForumThread({
  initialThread: threadData,
});
```

**Features:**
- Thread state management
- Like status updates
- View count tracking
- Reply count management

### `useForumLikes` - Like Functionality

Handles all like/unlike operations.

```typescript
import { useForumLikes } from '@/hooks/forum';

const {
  likePost,
  likeThread,
  isLiking,
  isAuthenticated,
} = useForumLikes({
  onPostLikeUpdate: (postId, liked, count) => {
    // Handle post like update
  },
  onThreadLikeUpdate: (liked, count) => {
    // Handle thread like update
  },
});
```

**Features:**
- Authentication checks
- Optimistic UI updates
- Error handling
- Rate limiting protection

### `useForumForm` - Form State Management

Manages form state for post creation.

```typescript
import { useForumForm } from '@/hooks/forum';

const {
  content,
  setContent,
  isSubmitting,
  handleSubmit,
  handleKeyDown,
  canSubmit,
} = useForumForm({
  onSubmit: async (content) => {
    await createPost(content);
  },
});
```

**Features:**
- Form validation
- Keyboard shortcuts (Ctrl/Cmd + Enter)
- Submission state management
- Auto-clear on success

## Architecture Benefits

### 1. Separation of Concerns
- Business logic separated from UI components
- Each hook has a single responsibility
- Easy to test logic in isolation

### 2. Reusability
- Hooks can be used across different components
- Consistent behavior across the application
- Reduced code duplication

### 3. Optimistic Updates
- Immediate UI feedback for better UX
- Background synchronization ensures data consistency
- Graceful error handling with rollback

### 4. Type Safety
- Full TypeScript support
- Compile-time error checking
- Better IDE integration and autocomplete

### 5. Performance
- Optimized state updates
- Memoized callbacks prevent unnecessary re-renders
- Efficient background data fetching

## Usage Patterns

### Basic Thread Page
```typescript
export function ThreadPageClient({ thread, initialPosts }) {
  const {
    thread: currentThread,
    posts,
    createPost,
    likePost,
    likeThread,
    isAuthenticated,
  } = useForum({ thread, initialPosts });

  const handleSubmit = async (content) => {
    await createPost(content);
    setNewPostContent("");
  };

  return (
    <div>
      <ThreadHeader 
        thread={currentThread} 
        onLike={() => likeThread(currentThread.id)} 
      />
      <HierarchicalCommentList 
        posts={posts}
        onReply={createPost}
        onLike={likePost}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
```

### Standalone Post Creation
```typescript
export function PostCreationForm({ threadId }) {
  const { createPost } = useForumPosts({ threadId });
  const form = useForumForm({
    onSubmit: (content) => createPost({ content }),
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <textarea 
        value={form.content}
        onChange={(e) => form.setContent(e.target.value)}
        onKeyDown={form.handleKeyDown}
      />
      <button 
        type="submit" 
        disabled={!form.canSubmit}
      >
        {form.isSubmitting ? 'Posting...' : 'Post Reply'}
      </button>
    </form>
  );
}
```

## Testing

These hooks are designed to be easily testable:

```typescript
import { renderHook } from '@testing-library/react';
import { useForumPosts } from '@/hooks/forum';

test('creates post optimistically', async () => {
  const { result } = renderHook(() => 
    useForumPosts({ threadId: 'test-thread' })
  );

  await result.current.createPost({ content: 'Test post' });
  
  expect(result.current.posts).toHaveLength(1);
});
```

## Migration Guide

If you're migrating from the old ThreadPageClient pattern:

### Before
```typescript
// 250+ lines of mixed logic in component
const ThreadPageClient = ({ thread, initialPosts }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ... 200+ lines of handlers and effects
};
```

### After
```typescript
// Clean, focused component
const ThreadPageClient = ({ thread, initialPosts }) => {
  const forumAPI = useForum({ thread, initialPosts });
  // ... just UI rendering logic
};
```

The hooks handle all the complex state management, API calls, and optimistic updates automatically.