import { Button } from "@/components/ui/button";
import { GamesPaginationProps } from "@/types/index";

export function GamesPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: GamesPaginationProps) {
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <Button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="flex items-center">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
