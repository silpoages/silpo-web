export function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Silpo, painel administrativo">
      <span className="brand-mark__icon" aria-hidden="true">
        <svg viewBox="0 0 34 34" fill="none">
          <path
            d="M22.6 10.1c-6.7.3-11.1 4.8-11.1 10.7 0 1.4.3 2.8.9 4 6.9-.5 12.2-5.8 12.4-14.7-.7 0-1.4 0-2.2 0Z"
            fill="currentColor"
          />
          <path
            d="M12.5 24.7c1.7-5.2 5.2-8.5 9.4-10.8"
            stroke="#203d2c"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="brand-mark__wording">
        <strong>Silpo</strong>
        <span>PAINEL ADMINISTRATIVO</span>
      </span>
    </div>
  );
}
