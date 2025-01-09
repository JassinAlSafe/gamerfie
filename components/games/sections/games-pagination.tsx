"use client";

import { Button } from "@/components/ui/button";
import { useGamesStore } from "@/stores/useGamesStore";

export function GamesPagination() {
  const { currentPage, totalPages, setCurrentPage } = useGamesStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNavigate(1)}
        disabled={currentPage === 1}
        className="text-white"
      >
        First
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNavigate(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-white"
      >
        Previous
      </Button>
      <span className="text-gray-400">
        Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNavigate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-white"
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNavigate(totalPages)}
        disabled={currentPage === totalPages}
        className="text-white"
      >
        Last
      </Button>
    </div>
  );
}
