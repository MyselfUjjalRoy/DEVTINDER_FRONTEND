import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../utils/constants";

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80";

const initialsAvatar = (name) => {
  const initials =
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "?";
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0%' stop-color='#f43f5e'/>` +
    `<stop offset='55%' stop-color='#d946ef'/>` +
    `<stop offset='100%' stop-color='#a855f7'/>` +
    `</linearGradient></defs>` +
    `<rect width='400' height='400' fill='url(#g)'/>` +
    `<text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Segoe UI, Arial, sans-serif' font-size='150' font-weight='700' fill='white'>${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const MediaImage = ({
  src,
  alt = "",
  fallback = DEFAULT_AVATAR,
  className = "",
  onError,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolved = resolveMediaUrl(src);

  const handleError = (e) => {
    setFailed(true);
    if (onError) onError(e);
  };

  if (!resolved) {
    return <img src={fallback} alt={alt} className={className} {...rest} />;
  }

  if (failed) {
    return (
      <img src={initialsAvatar(alt)} alt={alt} className={className} {...rest} />
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={className}
      {...rest}
    />
  );
};

export default MediaImage;
