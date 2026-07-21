import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const getPageNumbers = (current, total) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const siblingsCount = 1;
  const leftSiblingIndex = Math.max(current - siblingsCount, 2);
  const rightSiblingIndex = Math.min(current + siblingsCount, total - 1);
  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < total - 1;

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('...');
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-background rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-text-muted">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 text-sm font-medium rounded-xl transition-all ${
                page === currentPage
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text hover:bg-background hover:text-primary'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-background rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <HiOutlineChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
