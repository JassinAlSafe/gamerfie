# Gaming Journal Feature Documentation

The Gaming Journal is a feature that allows users to document their gaming journey through different types of entries. This document explains how the feature works, its components, and provides code examples.

## Table of Contents

- [Entry Types](#entry-types)
- [Components](#components)
- [State Management](#state-management)
- [User Flows](#user-flows)
- [Code Examples](#code-examples)
- [Database Integration](#database-integration)

## Entry Types

### 1. Progress Update

Track progress in specific games with:

- Progress percentage (slider)
- Hours played
- Optional description
- Game selection with cover image

Example entry:

```typescript
{
  id: "123",
  type: "progress",
  game: "Elden Ring",
  game_id: "456",
  cover_url: "https://...",
  progress: "75%",
  hoursPlayed: 40,
  content: "Defeated Malenia after countless attempts. Moving on to the final area.",
  date: "2024-01-15"
}
```

### 2. Game Review

Write detailed reviews with:

- Rating (1-10 slider)
- Detailed review text
- Game selection with cover image

Example entry:

```typescript
{
  id: "124",
  type: "review",
  game: "Baldur's Gate 3",
  game_id: "789",
  cover_url: "https://...",
  rating: 9,
  content: "An incredible RPG that sets new standards...",
  date: "2024-01-16"
}
```

### 3. Daily Log

Quick updates about gaming sessions:

- Free-form text content
- Character limit: 500

Example entry:

```typescript
{
  id: "125",
  type: "daily",
  content: "Spent the evening trying different builds in Path of Exile...",
  date: "2024-01-17"
}
```

### 4. Custom List

Create curated game lists:

- Custom title
- List of games with covers
- Reorderable entries

Example entry:

```typescript
{
  id: "126",
  type: "list",
  title: "Top RPGs of 2023",
  content: "[{\"id\":\"123\",\"name\":\"Baldur's Gate 3\",\"cover_url\":\"https://...\"}, ...]",
  date: "2024-01-18"
}
```

## Components

### JournalTab

Main container component that:

- Displays the journal header
- Handles entry filtering
- Manages the timeline view

```typescript
function JournalTab() {
  const [filter, setFilter] = useState({
    search: "",
    type: "all",
    date: "all",
  });

  // Filter entries based on search, type, and date
  const filteredEntries = entries.filter((entry) => {
    const searchMatch =
      filter.search === "" ||
      Object.values(entry).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(filter.search.toLowerCase())
      );
    const typeMatch = filter.type === "all" || entry.type === filter.type;
    const dateMatch = filter.date === "all" || entry.date === filter.date;

    return searchMatch && typeMatch && dateMatch;
  });

  return (
    <div>
      <FilterDropdown filter={filter} setFilter={setFilter} />
      <TimelineView entries={filteredEntries} />
    </div>
  );
}
```

### NewEntryModal

Modal for creating new entries:

1. Select entry type
2. Fill in type-specific form
3. Save to journal store

```typescript
function NewEntryModal({ isOpen, onClose }) {
  const [entryType, setEntryType] = useState(null);
  const addEntry = useJournalStore((state) => state.addEntry);

  const handleSave = (formData) => {
    const entryData = {
      type: entryType,
      date: new Date().toISOString().split("T")[0],
      ...formData,
    };
    addEntry(entryData);
    onClose();
  };

  return (
    <Dialog open={isOpen}>
      {!entryType ? (
        <EntryTypeSelector onSelect={setEntryType} />
      ) : (
        <EntryForm
          type={entryType}
          onSave={handleSave}
          onCancel={() => setEntryType(null)}
        />
      )}
    </Dialog>
  );
}
```

## User Flows

### Creating a Progress Update

1. Click "New Entry"
2. Select "Progress Update"
3. Select game from library/search
4. Set progress percentage using slider
5. Enter hours played
6. Add optional description
7. Save entry

### Creating a Game List

1. Click "New Entry"
2. Select "Custom List"
3. Enter list title
4. Click "Add Game" to search and select games
5. Reorder games if needed
6. Save list

### Editing an Entry

1. Click edit icon on entry
2. Modify entry details in modal
3. Save changes

### Deleting an Entry

1. Click delete icon on entry
2. Confirm deletion in dialog
3. Entry is removed from timeline

## State Management

The journal uses Zustand for state management:

```typescript
interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  addEntry: (entry: Omit<JournalEntry, "id">) => void;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...state.entries,
      ],
    })),

  updateEntry: (id, updatedEntry) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id
          ? { ...entry, ...updatedEntry, updatedAt: new Date() }
          : entry
      ),
    })),

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),
}));
```

## Best Practices

1. Entry Creation

   - Always validate required fields
   - Ensure game data is complete for game-related entries
   - Format dates consistently
   - Use `getCoverImageUrl` utility for game covers to ensure high-quality images
   - Handle missing cover images with placeholders

2. UI/UX

   - Show loading states during operations
   - Provide clear feedback for actions
   - Use consistent styling
   - Implement responsive design
   - Display game covers with proper sizing and quality
   - Use proper image optimization with Next.js Image component

3. State Management

   - Keep entries sorted by date
   - Handle errors gracefully
   - Maintain data consistency
   - Use optimistic updates
   - Properly transform game data between Supabase and client

4. Performance
   - Lazy load images with proper `sizes` prop
   - Use quality={90} for game covers
   - Implement pagination if needed
   - Cache game data
   - Optimize re-renders

## Database Integration

### Supabase Schema

```sql
-- Journal entries table
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  type text not null check (type in ('progress', 'daily', 'review', 'list')),
  date text not null,
  title text,
  content text,
  game_id text,
  game text,
  cover_url text,
  progress integer check (progress >= 0 and progress <= 100),
  hours_played integer,
  rating integer check (rating >= 1 and rating <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Data Transformation

The store transforms Supabase data to match our interface:

```typescript
// Transform database entry to JournalEntry
const transformEntry = (entry: any): JournalEntry => ({
  id: entry.id,
  type: entry.type,
  date: entry.date,
  title: entry.title,
  content: entry.content,
  game: entry.game_id
    ? {
        id: entry.game_id,
        name: entry.game,
        cover_url: entry.cover_url,
      }
    : undefined,
  progress: entry.progress,
  hoursPlayed: entry.hours_played,
  rating: entry.rating,
  createdAt: entry.created_at,
  updatedAt: entry.updated_at,
});
```

### Game Cover Handling

Game covers are handled using the `getCoverImageUrl` utility:

```typescript
// In components using game covers
import { getCoverImageUrl } from "@/utils/image-utils";

// Usage in Image component
<Image
  src={
    game.cover_url
      ? getCoverImageUrl(game.cover_url)
      : "/images/placeholders/game-cover.jpg"
  }
  alt={`Cover for ${game.name}`}
  fill
  className="object-cover"
  sizes="64px"
  quality={90}
/>;
```

### Progress Tracking

Progress is stored as a number (0-100) and displayed with proper formatting:

```typescript
// In TimelineView
<div
  className="h-full bg-white rounded-full"
  style={{
    width: `${parseInt(entry.progress || "0")}%`,
  }}
/>
<span className="text-sm font-medium text-white">
  {parseInt(entry.progress || "0")}%
</span>
```

### Integration with Zustand Store

The journal store needs to be updated to work with Supabase:

```typescript
interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, "id">) => Promise<void>;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ entries: data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("journal_entries")
        .insert([
          {
            ...entry,
            user_id: userData.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        entries: [data, ...state.entries],
      }));
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateEntry: async (id, updatedEntry) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .update({
          ...updatedEntry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        entries: state.entries.map((entry) => (entry.id === id ? data : entry)),
      }));
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

### Data Flow

1. Initial Load

   ```typescript
   // In JournalTab component
   useEffect(() => {
     useJournalStore.getState().fetchEntries();
   }, []);
   ```

2. Creating Entries

   ```typescript
   // In NewEntryModal
   const handleSave = async (formData) => {
     try {
       await addEntry({
         type: entryType,
         ...formData,
       });
       onClose();
     } catch (error) {
       // Handle error
     }
   };
   ```

3. Real-time Updates

   ```typescript
   // In JournalTab component
   useEffect(() => {
     const supabase = createClientComponentClient();

     const channel = supabase
       .channel("journal_changes")
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "journal_entries",
         },
         (payload) => {
           // Refresh entries on changes
           useJournalStore.getState().fetchEntries();
         }
       )
       .subscribe();

     return () => {
       supabase.removeChannel(channel);
     };
   }, []);
   ```

### Error Handling

```typescript
// In components
const { error } = useJournalStore();

useEffect(() => {
  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }
}, [error]);
```

### Optimistic Updates

The store implements optimistic updates for better UX:

1. Update local state immediately
2. Make API call
3. Revert on error

Example for deletion:

```typescript
deleteEntry: async (id) => {
  // Store current entries for potential rollback
  const previousEntries = get().entries;

  // Optimistically update UI
  set((state) => ({
    entries: state.entries.filter((entry) => entry.id !== id),
  }));

  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    // Revert on error
    set({ entries: previousEntries, error: error.message });
  }
},
```

## Type Safety

Using Supabase's generated types:

```typescript
import { Database } from "@/types/supabase";
type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

// Use throughout the application
const entries: JournalEntry[] = useJournalStore((state) => state.entries);
```
