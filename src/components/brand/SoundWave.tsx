const barHeights = [
  13, 49, 41, 32, 23, 14, 50, 42, 33, 24, 15, 51, 42, 33, 25, 16, 52, 43, 34, 26, 17, 53, 43, 34,
  27, 18, 54, 44, 35, 27, 19, 55, 46, 36, 28, 20, 55, 47, 39, 30, 21, 56,
];

export function SoundWave() {
  return (
    <div className="sound-wave" aria-hidden="true">
      {barHeights.map((height, index) => (
        <span
          className={
            index % 5 === 0 || index % 5 === 2
              ? 'sound-wave__bar sound-wave__bar--gold'
              : 'sound-wave__bar'
          }
          key={index}
          style={{ height }}
        />
      ))}
    </div>
  );
}
