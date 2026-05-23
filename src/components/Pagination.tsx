import Link from "next/link";

interface PaginationProps {
  total: number;
  page: string;
  pathname: string;
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export default function Pagination({ total, page, pathname }: PaginationProps) {
  const totalPages = Math.max(0, total);
  const currentPage = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages || 1);

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);
  const pageLink = (targetPage: number) => ({
    pathname,
    query: { page: targetPage },
  });

  return (
    <nav className="my-8 flex w-full justify-center" aria-label="페이지 이동">
      <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm">
        <Link
          href={pageLink(currentPage - 1)}
          scroll={false}
          aria-disabled={currentPage === 1}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
            currentPage === 1
              ? "pointer-events-none text-gray-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          이전
        </Link>

        {visiblePages[0] > 1 && (
          <>
            <Link
              href={pageLink(1)}
              scroll={false}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              1
            </Link>
            {visiblePages[0] > 2 && <span className="px-1 text-sm text-gray-400">...</span>}
          </>
        )}

        {visiblePages.map((pageNumber) => {
          const isCurrent = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={pageLink(pageNumber)}
              scroll={false}
              aria-current={isCurrent ? "page" : undefined}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                isCurrent
                  ? "bg-[--color-signature] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {pageNumber}
            </Link>
          );
        })}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-sm text-gray-400">...</span>
            )}
            <Link
              href={pageLink(totalPages)}
              scroll={false}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {totalPages}
            </Link>
          </>
        )}

        <Link
          href={pageLink(currentPage + 1)}
          scroll={false}
          aria-disabled={currentPage === totalPages}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
            currentPage === totalPages
              ? "pointer-events-none text-gray-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          다음
        </Link>
      </div>
    </nav>
  );
}
