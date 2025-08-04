import React from 'react';

const Pagination = ({ page, total, limit, onPageChange }) => {
  const validTotal = Number.isInteger(total) ? total : 0;
  const validPage = Number.isInteger(page) ? page : 1;
  const validLimit = Number.isInteger(limit) ? limit : 10;
  const totalPages = Math.max(1, Math.ceil(validTotal / validLimit));

  if (validTotal === 0) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">No entries to show</span>
      </div>
    );
  }

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (validPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (validPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = validPage - 1; i <= validPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const startEntry = ((validPage - 1) * validLimit) + 1;
  const endEntry = Math.min(validPage * validLimit, validTotal);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        {`Showing ${startEntry} to ${endEntry} of ${validTotal} entries`}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(validPage - 1)}
          disabled={validPage === 1}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
        >
          Previous
        </button>

        {getPageNumbers().map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className="px-3 py-2">...</span>
            ) : (
              <button
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-lg transition-colors ${validPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(validPage + 1)}
          disabled={validPage === totalPages}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
