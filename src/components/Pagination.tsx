import Link from "next/link";

interface Pagination {
  total: number;
  page: string;
  pathname: string;
}

export default function Pagination({ total, page, pathname }: Pagination) {
  const currentPage = parseInt(page, 10); // page를 미리 number로 변환하여 사용
  const totalPages = total;

  return (
    <div className="py-4 w-full px-10 flex justify-center items-center gap-3 bg-slate-100 my-10 flex-wrap text-black rounded-full">
      {totalPages <= 10 ? (
        [...Array(totalPages)].map((_, i) => (
          <Link
            href={{ pathname: pathname, query: { page: i + 1 } }}
            key={i}
            scroll={false}
          >
            <span
              className={`px-3 py-2 rounded-md shadow-sm bg-[--color-signature] ${
                i + 1 === currentPage
                  ? 'text-white font-semibold'
                  : 'text-gray-300'
              }`}
            >
              {i + 1}
            </span>
          </Link>
        ))
      ) : (
        <>
          {currentPage > 1 && (
            <Link
              href={{
                pathname: pathname,
                query: { page: currentPage - 1 },
              }}
            >
              <span className="px-3 py-2 rounded border shadow-sm bg-[--color-signature] text-white">
                &lt;
              </span>
            </Link>
          )}
          <Link
            href={{
              pathname: pathname,
              query: { page: currentPage },
            }}
          >
            <span className="px-3 py-2 rounded border shadow-sm bg-[--color-signature] text-white">
              {currentPage}
            </span>
          </Link>
          {currentPage < totalPages && (
            <Link
              href={{
                pathname: pathname,
                query: { page: currentPage + 1 },
              }}
            >
              <span className="px-3 py-2 rounded border shadow-sm bg-[--color-signature] text-white">
                &gt;
              </span>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
