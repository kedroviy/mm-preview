"use client";

import { useMemo } from "react";
import { cn } from "../../lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

export interface PaginatorProps {
  first?: number;
  rows?: number;
  totalRecords?: number;
  rowsPerPageOptions?: number[];
  onPageChange?: (event: {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
  }) => void;
  className?: string;
}

export function Paginator({
  first = 0,
  rows = 10,
  totalRecords = 0,
  rowsPerPageOptions = [5, 10, 20],
  onPageChange,
  className,
}: PaginatorProps) {
  const currentPage = Math.floor(first / rows) + 1;
  const pageCount = Math.ceil(totalRecords / rows);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pageCount) {
      return;
    }
    const newFirst = (newPage - 1) * rows;
    onPageChange?.({
      first: newFirst,
      rows,
      page: newPage,
      pageCount,
    });
  };

  const handleRowsChange = (newRows: number) => {
    const newFirst = 0; // Reset to first page when changing rows per page
    const newPageCount = Math.ceil(totalRecords / newRows);
    onPageChange?.({
      first: newFirst,
      rows: newRows,
      page: 1,
      pageCount: newPageCount,
    });
  };

  // Generate page numbers to display
  const pages = useMemo(() => {
    const pageNumbers: (number | "ellipsis")[] = [];
    const maxVisible = 7; // Maximum visible page numbers

    if (pageCount <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= pageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      if (currentPage <= 3) {
        // Show first pages
        for (let i = 2; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(pageCount);
      } else if (currentPage >= pageCount - 2) {
        // Show last pages
        pageNumbers.push("ellipsis");
        for (let i = pageCount - 3; i <= pageCount; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show middle pages
        pageNumbers.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(pageCount);
      }
    }

    return pageNumbers;
  }, [currentPage, pageCount]);

  if (pageCount <= 1) {
    return null; // Don't show pagination if there's only one page or no pages
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {pages.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Rows per page selector */}
      {rowsPerPageOptions && rowsPerPageOptions.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Строк на странице:</span>
          <select
            value={rows}
            onChange={(e) => handleRowsChange(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
