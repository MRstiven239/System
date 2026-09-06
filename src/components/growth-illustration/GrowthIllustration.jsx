import { hexToRgba, lighten } from '../../domain/color';
import './growth-illustration.css';

/**
 * Renders one of 5 growth stages (seed → brotando → creciendo →
 * arbolito → florecido) as inline SVG. It only knows "which stage
 * index and which colors" — it has no idea what root depth, streaks,
 * or habits are. That mapping happens in the caller.
 */
export function GrowthIllustration({ stageIndex, color, mutedInk, size = 32, pulseKey }) {
  const soil = hexToRgba(mutedInk, 0.35);
  const bloom = lighten(color, 90);

  return (
    <span key={pulseKey} className="growth-illustration-pulse inline-block">
      <svg viewBox="0 0 60 60" width={size} height={size}>
        <ellipse cx="30" cy="51" rx="20" ry="5" fill={soil} />

        {stageIndex === 0 && <circle cx="30" cy="47" r="4" fill={color} />}

        {stageIndex === 1 && (
          <g>
            <line x1="30" y1="48" x2="30" y2="37" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="35" cy="37" rx="6" ry="3" fill={color} transform="rotate(-25 35 37)" />
          </g>
        )}

        {stageIndex === 2 && (
          <g>
            <line x1="30" y1="48" x2="30" y2="27" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="24" cy="39" rx="6.5" ry="3.2" fill={color} transform="rotate(25 24 39)" />
            <ellipse cx="36" cy="31" rx="6.5" ry="3.2" fill={color} transform="rotate(-25 36 31)" />
          </g>
        )}

        {stageIndex === 3 && (
          <g>
            <rect x="27.5" y="28" width="5" height="20" rx="2" fill={color} />
            <circle cx="30" cy="24" r="10" fill={color} />
            <circle cx="21" cy="28" r="7" fill={color} />
            <circle cx="39" cy="28" r="7" fill={color} />
          </g>
        )}

        {stageIndex === 4 && (
          <g>
            <rect x="26.5" y="26" width="7" height="22" rx="2.5" fill={color} />
            <circle cx="30" cy="20" r="13" fill={color} />
            <circle cx="18" cy="26" r="9" fill={color} />
            <circle cx="42" cy="26" r="9" fill={color} />
            <circle cx="24" cy="16" r="2.5" fill={bloom} />
            <circle cx="36" cy="14" r="2.5" fill={bloom} />
            <circle cx="30" cy="9" r="2.5" fill={bloom} />
            <circle cx="14" cy="24" r="2" fill={bloom} />
            <circle cx="46" cy="24" r="2" fill={bloom} />
          </g>
        )}
      </svg>
    </span>
  );
}
