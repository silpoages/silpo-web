type ContinueJourneyCardProps = {
  daysRegistered?: number;
};

export function ContinueJourneyCard({ daysRegistered = 8 }: ContinueJourneyCardProps) {
  return (
    <article className="continue-journey-card" aria-labelledby="continue-journey-title">
      <span className="continue-journey-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 20V9m0 5c-3.4 0-5.5-1.8-5.5-4.5C9.2 9.5 12 10.8 12 14Zm0-3c0-3.2 2.1-5.2 5.5-5.5.2 3.2-1.9 5.5-5.5 5.5Z" />
        </svg>
      </span>
      <span className="continue-journey-card__content">
        <strong id="continue-journey-title">Continue sua jornada</strong>
        <span>Você registrou como estava se sentindo em {daysRegistered} dias este mês.</span>
      </span>
      <span className="continue-journey-card__chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
    </article>
  );
}
