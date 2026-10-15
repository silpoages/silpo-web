import './SideBar.css';
import { useState } from 'react';

const sections = [
  {
    label: 'Visão Geral',
    options: [
      {
        label: 'Dashboard',
        link: '/',
        icon: null,
      },
    ],
  },
  {
    label: 'Conteúdo do App',
    options: [
      {
        label: 'Práticas do Bem',
        link: '/good-practices',
        icon: null,
      },
      {
        label: 'Mensagens diárias',
        link: '/good-practices',
        icon: null,
      },
      {
        label: 'Meditações',
        link: '/good-practices',
        icon: null,
      },
    ],
  },
];

export function SideBar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`sidebar-container ${isOpen ? '' : 'closed'}`}>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label={isOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Fechar menu' : '☰'}
      </button>
      <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
        <div className="sidebar-content">
          <nav>
            {sections.map((section, index) => (
              <div key={index}>
                <h3>{section.label}</h3>
                <ul>
                  {section.options.map((option, idx) => (
                    <li key={idx}>
                      <a className="sidebar-item" href={option.link}>
                        {option.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
