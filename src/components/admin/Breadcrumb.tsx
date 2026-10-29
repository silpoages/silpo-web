import { Link } from 'react-router-dom';
import chevronRightIcon from '@/assets/icons/chevron-right.svg';

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={item.label} className="breadcrumb__item">
              {index > 0 && <img src={chevronRightIcon} alt="" width={15} height={15} />}
              {isCurrent || !item.path ? (
                <span
                  className={isCurrent ? 'breadcrumb__current' : 'breadcrumb__link'}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="breadcrumb__link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
