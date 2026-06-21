export default function GameIcon({
  className = "w-16 h-16",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`inline-block ${className}`}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hard Shadow */}
      <rect x="12" y="16" width="96" height="56" rx="20" fill="#000" />
      {/* Controller Body */}
      <rect
        x="8"
        y="8"
        width="96"
        height="56"
        rx="20"
        fill="#38BDF8"
        stroke="#000"
        strokeWidth="6"
      />

      {/* D-Pad Cross */}
      <path
        d="M 24 32 h 8 v -8 h 8 v 8 h 8 v 8 h -8 v 8 h -8 v -8 h -8 z"
        fill="#FFFDF5"
        stroke="#000"
        strokeWidth="4"
        strokeLinejoin="miter"
      />

      {/* Action Buttons */}
      <circle
        cx="72"
        cy="44"
        r="6"
        fill="#FACC15"
        stroke="#000"
        strokeWidth="4"
      />
      <circle
        cx="86"
        cy="32"
        r="6"
        fill="#F59E0B"
        stroke="#000"
        strokeWidth="4"
      />
    </svg>
  );
}
