import { useRef } from "react";

const Magnetic = ({ children, strength = 0.32, className = "", as = "span" }) => {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate3d(0,0,0)";
  };

  const Tag = as;
  return (
    <Tag ref={ref} data-magnetic onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </Tag>
  );
};

export default Magnetic;
