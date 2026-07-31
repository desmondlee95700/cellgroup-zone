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
      <path d="M17 66 31 12h58l14 54-43 8Z" fill="#243028" />
      <path d="M13 60 27 6h58l14 54-43 8Z" fill="#F4B942" stroke="#243028" strokeWidth="6" strokeLinejoin="round" />
      <path d="M30 17 38 55M58 10l-2 52M80 13 72 57" stroke="#FFF3C4" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      <circle cx="55" cy="37" r="10" fill="#243028" />
      <circle cx="39" cy="27" r="6" fill="#243028" />
      <circle cx="70" cy="27" r="6" fill="#243028" />
      <circle cx="35" cy="42" r="6" fill="#243028" />
      <circle cx="74" cy="42" r="6" fill="#243028" />
    </svg>
  );
}
