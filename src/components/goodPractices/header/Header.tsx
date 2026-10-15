import './styles.css';

interface HeaderProps {
  onAdd: () => void;
}

export default function Header({ onAdd }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-text">
        <h1>Práticas do Bem</h1>
        <p>
          Atividades sugeridas no aplicativo. O que você publicar aqui aparece na seleção do
          usuário.
        </p>
      </div>
      <div className="header-actions">
        <button className="header-button" type="button" onClick={onAdd}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Adicionar
        </button>
      </div>
    </header>
  );
}
