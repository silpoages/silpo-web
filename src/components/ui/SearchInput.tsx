import type { ComponentProps } from 'react';
import searchIcon from '@/assets/icons/search.svg';
import './ui.css';

type SearchInputProps = Omit<ComponentProps<'input'>, 'type' | 'onChange'> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ id, label, value, onChange, ...props }: SearchInputProps) {
  return (
    <div className="search-input">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <img src={searchIcon} alt="" width={18} height={18} className="search-input__icon" />
      <input
        id={id}
        type="search"
        className="search-input__field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </div>
  );
}
