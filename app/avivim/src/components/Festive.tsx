export function Bunting() {
  return (
    <div className="bunting" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          style={
            {
              "--flag-color": [
                "#ffca43",
                "#ff696a",
                "#29c4aa",
                "#9e80ee",
                "#4895ee",
              ][i % 5],
              animationDelay: `${i * 0.12}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
export function Confetti() {
  return (
    <div className="confetti-rain" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${i * 2.8}%`,
              background: ["#ffca43", "#ff696a", "#29c4aa", "#bca1ff", "#fff"][
                i % 5
              ],
              animationDelay: `${(i % 9) * 0.17}s`,
              animationDuration: `${2.5 + (i % 4) * 0.3}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
