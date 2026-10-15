import nextIcon from '@/assets/icons/pagination-next.svg';
import previousIcon from '@/assets/icons/pagination-prev.svg';
import selectChevronIcon from '@/assets/icons/select-chevron.svg';
import './ui.css';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div className="pagination">
      <div className="pagination__page-size">
        <label htmlFor="pagination-page-size">Itens por página</label>
        <span className="pagination__select">
          <select
            id="pagination-page-size"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <img src={selectChevronIcon} alt="" width={10} height={6} />
        </span>
      </div>

      <nav aria-label="Paginação">
        <ul className="pagination__pages">
          <li>
            <button
              type="button"
              className="pagination__button"
              aria-label="Página anterior"
              disabled={isFirstPage}
              onClick={() => onPageChange(page - 1)}
            >
              <img src={previousIcon} alt="" width={16} height={16} />
            </button>
          </li>
          {pages.map((pageNumber) => {
            const isCurrent = pageNumber === page;

            return (
              <li key={pageNumber}>
                <button
                  type="button"
                  className={
                    isCurrent
                      ? 'pagination__button pagination__button--current'
                      : 'pagination__button'
                  }
                  aria-label={`Página ${pageNumber}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="pagination__button"
              aria-label="Próxima página"
              disabled={isLastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <img src={nextIcon} alt="" width={16} height={16} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
