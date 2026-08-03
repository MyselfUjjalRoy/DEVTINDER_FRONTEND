const Marquee = ({ items, className = "", speed = 24 }) => {
  const row = items.length > 0 ? items.concat(items) : [];
  if (row.length === 0) return null;
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {row.map((it, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-text">{it}</span>
            <span className="marquee-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
