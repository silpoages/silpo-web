import './ui.css';

export type StatusTab<T extends string> = {
  value: T;
  label: string;
  count: number;
};

type StatusTabsProps<T extends string> = {
  tabs: StatusTab<T>[];
  value: T;
  label: string;
  onChange: (value: T) => void;
};

export function StatusTabs<T extends string>({ tabs, value, label, onChange }: StatusTabsProps<T>) {
  return (
    <div className="status-tabs" role="group" aria-label={label}>
      {tabs.map((tab) => {
        const isActive = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            className={isActive ? 'status-tabs__tab status-tabs__tab--active' : 'status-tabs__tab'}
            aria-pressed={isActive}
            onClick={() => onChange(tab.value)}
          >
            {tab.label} {tab.count.toLocaleString('pt-BR')}
          </button>
        );
      })}
    </div>
  );
}
