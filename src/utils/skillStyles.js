const SKILL_RULES = [
  {
    match: (s) => s.includes("react") || s.includes("next"),
    style: { bg: "bg-cyan-500/15", text: "text-cyan-500", border: "border-cyan-500/30", dot: "bg-cyan-400", glow: "rgba(34,211,238,0.45)" },
  },
  {
    match: (s) => s.includes("node") || s.includes("express") || s.includes("mongo"),
    style: { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30", dot: "bg-emerald-400", glow: "rgba(52,211,153,0.45)" },
  },
  {
    match: (s) => s.includes("python") || s.includes("django") || s.includes("fastapi"),
    style: { bg: "bg-yellow-500/15", text: "text-yellow-500", border: "border-yellow-500/30", dot: "bg-yellow-400", glow: "rgba(234,179,8,0.4)" },
  },
  {
    match: (s) => s.includes("typescript") || s.includes("ts"),
    style: { bg: "bg-sky-500/15", text: "text-sky-500", border: "border-sky-500/30", dot: "bg-sky-400", glow: "rgba(56,189,248,0.45)" },
  },
  {
    match: (s) => s.includes("javascript") || s.includes("js"),
    style: { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30", dot: "bg-amber-400", glow: "rgba(245,158,11,0.4)" },
  },
  {
    match: (s) => s.includes("java") || s.includes("spring") || s.includes("kotlin"),
    style: { bg: "bg-orange-500/15", text: "text-orange-500", border: "border-orange-500/30", dot: "bg-orange-400", glow: "rgba(249,115,22,0.45)" },
  },
  {
    match: (s) => s.includes("aws") || s.includes("cloud") || s.includes("docker") || s.includes("devops"),
    style: { bg: "bg-purple-500/15", text: "text-purple-500", border: "border-purple-500/30", dot: "bg-purple-400", glow: "rgba(168,85,247,0.45)" },
  },
  {
    match: (s) => s.includes("flutter") || s.includes("dart") || s.includes("swift") || s.includes("ios"),
    style: { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500/30", dot: "bg-blue-400", glow: "rgba(59,130,246,0.45)" },
  },
];

export const getSkillStyle = (skill) => {
  const s = String(skill || "").toLowerCase();
  const hit = SKILL_RULES.find((r) => r.match(s));
  return hit
    ? hit.style
    : { bg: "bg-primary/10", text: "text-primary", border: "border-primary/25", dot: "bg-primary", glow: "rgba(255,45,85,0.4)" };
};
