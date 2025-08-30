# Auth Store Migration Guide

## Overview
This guide helps migrate from `useAuthStore` to `useAuthStoreOptimized` for better performance and reliability.

## Key Improvements

### 1. **Zustand `combine` Middleware**
- Better TypeScript inference
- Cleaner action/state separation
- Improved developer experience

### 2. **Optimistic UI Updates**
- Immediate UI feedback on auth actions
- Background profile loading
- No blocking waits

### 3. **Proper Auth State Listener**
- Handles all auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
- Automatic session refresh
- Clean subscription management

### 4. **Performance Optimizations**
- `useShallow` selector hooks prevent unnecessary re-renders
- Separate hooks for different concerns
- Cached profile fetching

## Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import { useAuthStore } from '@/stores/useAuthStore'
```

**After:**
```typescript
import { 
  useAuthUser,
  useAuthStatus,
  useAuthActions,
  useIsAuthenticated 
} from '@/stores/useAuthStoreOptimized'
```

### Step 2: Replace Direct Store Access

**Before:**
```typescript
function MyComponent() {
  const { user, profile, isLoading, signIn, signOut } = useAuthStore()
  // Component re-renders on ANY store change
}
```

**After:**
```typescript
function MyComponent() {
  // Only re-renders when user/profile changes
  const { user, profile } = useAuthUser()
  
  // Only re-renders when loading/error changes
  const { isLoading } = useAuthStatus()
  
  // Stable action references
  const { signIn, signOut } = useAuthActions()
}
```

### Step 3: Update Initialization

**Before:**
```typescript
// In AuthInitializer.tsx
useEffect(() => {
  useAuthStore.getState().initialize()
}, [])
```

**After:**
```typescript
// In AuthInitializer.tsx
import { useAuthActions, cleanupAuthSubscription } from '@/stores/useAuthStoreOptimized'

function AuthInitializer() {
  const { initialize } = useAuthActions()
  
  useEffect(() => {
    initialize()
    
    return () => {
      cleanupAuthSubscription()
    }
  }, [initialize])
}
```

### Step 4: Update Auth Checks

**Before:**
```typescript
const user = useAuthStore(state => state.user)
const isAuthenticated = !!user
```

**After:**
```typescript
const isAuthenticated = useIsAuthenticated()
// Or if you need user data too:
const { user } = useAuthUser()
```

### Step 5: Handle Loading States

**Before:**
```typescript
const { isLoading, isInitialized } = useAuthStore()

if (!isInitialized) {
  return <LoadingSpinner />
}
```

**After:**
```typescript
const { isLoading, isInitialized } = useAuthStatus()

if (!isInitialized) {
  return <LoadingSpinner />
}
```

## Component Examples

### Protected Route Component

```typescript
import { useIsAuthenticated, useAuthStatus } from '@/stores/useAuthStoreOptimized'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const { isInitialized } = useAuthStatus()

  if (!isInitialized) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    redirect('/login')
  }

  return <>{children}</>
}
```

### User Profile Display

```typescript
import { useAuthUser } from '@/stores/useAuthStoreOptimized'

export function UserProfile() {
  const { user, profile } = useAuthUser()
  
  if (!user) return null
  
  return (
    <div>
      <img src={profile?.avatar_url} alt={profile?.display_name} />
      <h3>{profile?.display_name || user.email}</h3>
      <p>@{profile?.username}</p>
    </div>
  )
}
```

### Sign In Form

```typescript
import { useAuthActions, useAuthStatus } from '@/stores/useAuthStoreOptimized'

export function SignInForm() {
  const { signIn } = useAuthActions()
  const { isLoading, error } = useAuthStatus()
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    try {
      await signIn(
        formData.get('email') as string,
        formData.get('password') as string
      )
      // Success - user is immediately available
      router.push('/dashboard')
    } catch (error) {
      // Error is also in store, but you can handle it here
      console.error('Sign in failed:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert message={error.userMessage} />}
      {/* form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

## Performance Benefits

### Before (Direct Store Access)
- Component re-renders on ANY store change
- All components using the store re-render together
- No optimization for stable action references

### After (Selector Hooks)
- Components only re-render for relevant changes
- `useAuthUser` - only when user/profile changes
- `useAuthStatus` - only when loading/error changes  
- `useAuthActions` - stable references, never causes re-renders

## Testing the Migration

1. **Check Re-renders:**
   - Use React DevTools Profiler
   - Verify components only re-render when necessary

2. **Test Auth Flows:**
   - Sign in - should show user immediately
   - Sign out - should clear UI immediately
   - Profile updates - should be optimistic

3. **Test Edge Cases:**
   - Token refresh
   - Session expiry
   - Network errors

## Gradual Migration

You can migrate gradually by:

1. Keep both stores temporarily
2. Migrate components one by one
3. Test thoroughly
4. Remove old store when complete

## Rollback Plan

If issues arise:

1. Components can be reverted individually
2. Both stores can coexist
3. No database changes required

## Common Issues

### Issue: Component not updating
**Solution:** Check you're using the right selector hook

### Issue: Too many re-renders
**Solution:** Use selector hooks instead of direct store access

### Issue: Actions undefined
**Solution:** Use `useAuthActions()` hook for stable references

## Next Steps

1. Start with non-critical components
2. Test each migration thoroughly
3. Monitor performance improvements
4. Remove old store once complete