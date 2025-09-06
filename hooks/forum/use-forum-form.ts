import { useState, useCallback } from "react";

interface UseForumFormOptions {
  onSubmit: (content: string) => Promise<void> | void;
}

/**
 * Hook for managing forum post form state
 */
export function useForumForm({ onSubmit }: UseForumFormOptions) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent(""); // Clear form after successful submission
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return {
    content,
    setContent,
    isSubmitting,
    handleSubmit,
    handleKeyDown,
    canSubmit: content.trim().length > 0 && !isSubmitting,
  };
}