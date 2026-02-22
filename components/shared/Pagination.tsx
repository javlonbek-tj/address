import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        Jami: <span className="font-semibold text-primary">{totalItems}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-sm ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 4) {
              pageNum = i + 1;
            } else if (currentPage <= 2) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNum = totalPages - 3 + i;
            } else {
              pageNum = currentPage - 1 + i;
            }

            return (
              <button
                key={i}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-7 h-7 text-sm rounded-sm ${
                  currentPage === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {totalPages > 4 && currentPage < totalPages - 1 && (
          <>
            <span className="px-1 text-gray-400">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded min-w-7 h-7 text-gray-700 dark:text-gray-300 text-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-sm ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="ml-4" size="xs">
            <SelectValue placeholder={itemsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent className="w-20">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
