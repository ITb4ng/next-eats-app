import Link from "next/link";

interface Pagination {
    total: number;
    page: string;
    pathname: string;
}

export default function Pagination({total, page, pathname }:Pagination) {
    return(
        <div className="py-4 w-full px-10 flex justify-center items-center gap-3 bg-slate-100 my-10 flex-wrap text-black rounded-full">
              {total <= 10 ? (
                [...Array(total)].map((x, i) => (
                <Link href={{pathname: pathname, query: {page: i + 1}}} key={i} scroll={false}>
                  <span className={`
                  px-3 py-2 rounded-md shadow-sm bg-[--color-signature]
                  ${(i + 1 === parseInt(page, 10) 
                  ? 'text-white font-semibold'
                  : 'text-gray-300')
                  }`}
                  >
                    {i + 1}
                  </span>
                </Link>
              ))
            ) : (
              <>
                {parseInt(page) > 1 && (
                <Link href={{
                  pathname: pathname, 
                  query: { page: parseInt(page) - 1},
                }}>
                  <span className={`px-3 py-2 rounded border shadow-sm bg-[--color-signature] text-white`}>
                    &lt;
                  </span>
                </Link>
                )}
                <Link href={{
                  pathname: pathname, 
                  query: {page:parseInt(page)},
                }}>
                  <span className={`px-3 py-2 rounded border shadow-sm bg-[--color-signature] text-white`}>
                    {page}
                  </span>
                </Link>
                {total > parseInt(page) && (
                  <Link 
                  href={{
                    pathname: pathname, 
                    query: { page: parseInt(page) + 1},
                  }}>
                  <span className={`px-3 py-2 rounded border shadow-sm bg-[--color-signature] text-white`}>
                    &gt;
                  </span>
                </Link>  
                )}
              </>
              )}
            </div>
    )
}