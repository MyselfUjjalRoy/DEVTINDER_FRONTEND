import { useId } from "react";

const CircularBadge = ({ text, radius = 88, speed = 16, className = "" }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = `circ-${uid}`;
  return (
    <svg
      viewBox="0 0 200 200"
      className={`circular-badge ${className}`}
      style={{ animationDuration: `${speed}s` }}
      aria-hidden="true"
    >
      <defs>
        <path
          id={id}
          d={`M 100,100 m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          fill="none"
        />
      </defs>
      <text>
        <textPath href={`#${id}`} startOffset="0%">
          {text}
        </textPath>
      </text>
    </svg>
  );
};

export default CircularBadge;
