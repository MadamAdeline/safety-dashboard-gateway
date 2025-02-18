
import { Button } from "@/components/ui/button";

interface GHSHazardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GHSHazardPagination({
  currentPage,
  totalPages,
  onPageChange
}: GHSHazardPaginationProps) {
  return (
    <nav>
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            Previous
          </Button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li key={page}>
            <Button
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </li>
        ))}
        <li>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
}
