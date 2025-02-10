
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startIndex: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  onPageChange,
}: ProductPaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
        {totalItems} results
      </p>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(1, currentPage - 1));
              }}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                isActive={currentPage === page}
                className={
                  currentPage === page 
                    ? "bg-dgxprt-selected text-white hover:bg-dgxprt-selected/90" 
                    : "hover:bg-dgxprt-hover"
                }
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(totalPages, currentPage + 1));
              }}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
