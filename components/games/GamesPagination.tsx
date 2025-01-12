import { Button } from "@/components/ui/button";

interface GamesPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function GamesPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: GamesPaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
        First
      </Button>
      <Button
        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
      <Button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </Button>
    </div>
  );
}
