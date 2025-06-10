export interface SearchResult {
    id: number;
    title: string;
    name?: string;
    category?: string;
    rating?: number;
    cover?: {
      url: string;
    };
  }
  
  export interface BaseSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => Promise<void>;
    isLoading: boolean;
    results: SearchResult[];
    placeholder?: string;
  }