type AdminFooterProps = {
  documentationUrl?: string;
};

export function AdminFooter({ documentationUrl }: AdminFooterProps) {
  return (
    <footer className="admin-footer">
      <p>© {new Date().getFullYear()} SILPO · Painel administrativo</p>
      {documentationUrl ? (
        <a href={documentationUrl} target="_blank" rel="noreferrer">
          Documentação
        </a>
      ) : (
        <span>Documentação</span>
      )}
    </footer>
  );
}
