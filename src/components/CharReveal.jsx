import { useEffect, useRef, useState } from "react";

const CharReveal = ({ text, as = "span", className = "", delay = 0, char = false, glow = false }) => {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const Tag = as;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const units = char ? Array.from(text) : text.split(" ");
  return (
    <Tag
      ref={ref}
      className={`char-reveal ${on ? "char-reveal--on" : ""} ${glow ? "char-reveal--glow" : ""} ${className}`}
      style={{ "--crd": `${delay}ms` }}
      aria-label={text}
      role="text"
    >
      {units.map((u, i) => (
        <span key={i} className="char-reveal-unit" style={{ "--cri": i }}>
          {u}
          {!char && i < units.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
};

export default CharReveal;
