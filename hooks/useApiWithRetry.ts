import { useState, useEffect } from "react";

export function useApiWithRetry<T>(url: string, maxRetries = 3) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        const response = await fetch(url, { method: "POST" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (e) {
        console.error(`Error fetching data (attempt ${retryCount + 1}):`, e);
        if (retryCount < maxRetries) {
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          setError(
            e instanceof Error ? e : new Error("An unknown error occurred")
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, maxRetries]);

  return { data, error, isLoading };
}
