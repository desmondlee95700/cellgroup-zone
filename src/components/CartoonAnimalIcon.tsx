import React from "react";

interface CartoonAnimalIconProps {
  animal: string;
  className?: string;
}

export function CartoonAnimalIcon({ animal, className = "w-full h-full" }: CartoonAnimalIconProps) {
  const normalized = animal.toLowerCase();

  if (normalized.includes("lion")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <circle cx="20" cy="20" r="16.5" fill="#D97706" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="12" cy="11" r="3.5" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        <circle cx="28" cy="11" r="3.5" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        <circle cx="20" cy="20" r="11.5" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        <circle cx="16" cy="19" r="1.5" fill="#18181B" />
        <circle cx="24" cy="19" r="1.5" fill="#18181B" />
        <ellipse cx="20" cy="23.5" rx="3.5" ry="2.5" fill="#FFFDF5" stroke="#18181B" strokeWidth="1.5" />
        <polygon points="18.5,22 21.5,22 20,24" fill="#18181B" />
      </svg>
    );
  }

  if (normalized.includes("elephant")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <ellipse cx="9" cy="20" rx="7.5" ry="9.5" fill="#38BDF8" stroke="#18181B" strokeWidth="2.5" />
        <ellipse cx="31" cy="20" rx="7.5" ry="9.5" fill="#38BDF8" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="12" fill="#7DD3FC" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="15" cy="18" r="1.5" fill="#18181B" />
        <circle cx="25" cy="18" r="1.5" fill="#18181B" />
        <path d="M 18 22 C 18 31, 26 31, 25 25" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (normalized.includes("cheetah") || normalized.includes("leopard")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <circle cx="12" cy="11" r="3.5" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
        <circle cx="28" cy="11" r="3.5" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
        <circle cx="20" cy="20" r="13" fill="#F59E0B" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="12" cy="16" r="1.2" fill="#18181B" />
        <circle cx="28" cy="16" r="1.2" fill="#18181B" />
        <circle cx="20" cy="11" r="1.2" fill="#18181B" />
        <path d="M 16 20 Q 15 25 17 27" fill="none" stroke="#18181B" strokeWidth="1.5" />
        <path d="M 24 20 Q 25 25 23 27" fill="none" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="16" cy="19" r="1.5" fill="#18181B" />
        <circle cx="24" cy="19" r="1.5" fill="#18181B" />
        <ellipse cx="20" cy="24" rx="3.5" ry="2.5" fill="#FFFDF5" stroke="#18181B" strokeWidth="1.5" />
        <polygon points="18.5,23 21.5,23 20,25" fill="#18181B" />
      </svg>
    );
  }

  if (normalized.includes("flaming")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <path d="M 14 36 Q 14 18 22 18 C 28 18 30 24 24 28" fill="none" stroke="#18181B" strokeWidth="11" strokeLinecap="round" />
        <path d="M 14 36 Q 14 18 22 18 C 28 18 30 24 24 28" fill="none" stroke="#FB7185" strokeWidth="7" strokeLinecap="round" />
        <path d="M 24 22 Q 32 23 30 30 L 25 27 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        <path d="M 28 25 Q 32 26 30 30 Z" fill="#18181B" />
        <circle cx="21" cy="20" r="1.8" fill="#18181B" />
        <circle cx="21.5" cy="19.5" r="0.6" fill="#FFFDF5" />
      </svg>
    );
  }

  if (normalized.includes("hippo")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <circle cx="12" cy="12" r="3" fill="#A78BFA" stroke="#18181B" strokeWidth="2" />
        <circle cx="28" cy="12" r="3" fill="#A78BFA" stroke="#18181B" strokeWidth="2" />
        <circle cx="20" cy="18" r="11" fill="#C4B5FD" stroke="#18181B" strokeWidth="2.5" />
        <ellipse cx="20" cy="26" rx="12" ry="8" fill="#DDD6FE" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="15" cy="25" r="1.8" fill="#18181B" />
        <circle cx="25" cy="25" r="1.8" fill="#18181B" />
        <circle cx="15" cy="16" r="1.5" fill="#18181B" />
        <circle cx="25" cy="16" r="1.5" fill="#18181B" />
      </svg>
    );
  }

  if (normalized.includes("croc") || normalized.includes("gator")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <circle cx="14" cy="13" r="4" fill="#4ADE80" stroke="#18181B" strokeWidth="2" />
        <circle cx="26" cy="13" r="4" fill="#4ADE80" stroke="#18181B" strokeWidth="2" />
        <circle cx="14" cy="13" r="1.5" fill="#18181B" />
        <circle cx="26" cy="13" r="1.5" fill="#18181B" />
        <path d="M 8 18 C 8 15 32 15 32 18 L 30 32 C 30 35 10 35 10 32 Z" fill="#22C55E" stroke="#18181B" strokeWidth="2.5" />
        <polygon points="12,28 14,33 16,28" fill="#FFFDF5" stroke="#18181B" strokeWidth="1.5" />
        <polygon points="24,28 26,33 28,28" fill="#FFFDF5" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="16" cy="20" r="1.2" fill="#18181B" />
        <circle cx="24" cy="20" r="1.2" fill="#18181B" />
      </svg>
    );
  }

  if (normalized.includes("zebra")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <path d="M 10 14 L 14 6 L 16 14 Z" fill="#FFFDF5" stroke="#18181B" strokeWidth="2" />
        <path d="M 30 14 L 26 6 L 24 14 Z" fill="#FFFDF5" stroke="#18181B" strokeWidth="2" />
        <rect x="18" y="5" width="4" height="10" rx="2" fill="#18181B" />
        <circle cx="20" cy="20" r="12" fill="#FFFDF5" stroke="#18181B" strokeWidth="2.5" />
        <path d="M 10 16 L 16 18 L 10 20 Z" fill="#18181B" />
        <path d="M 30 16 L 24 18 L 30 20 Z" fill="#18181B" />
        <path d="M 12 24 L 16 25 L 12 27 Z" fill="#18181B" />
        <path d="M 28 24 L 24 25 L 28 27 Z" fill="#18181B" />
        <circle cx="15" cy="18" r="1.5" fill="#18181B" />
        <circle cx="25" cy="18" r="1.5" fill="#18181B" />
        <ellipse cx="20" cy="25" rx="5" ry="3.5" fill="#3F3F46" stroke="#18181B" strokeWidth="1.5" />
      </svg>
    );
  }

  if (normalized.includes("parrot")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <circle cx="20" cy="18" r="12" fill="#10B981" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="15" cy="22" r="3.5" fill="#EF4444" opacity="0.8" />
        <path d="M 24 16 Q 34 18 31 28 Q 24 25 24 22 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        <circle cx="18" cy="16" r="2.5" fill="#FFFDF5" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="18.5" cy="16" r="1" fill="#18181B" />
        <path d="M 18 6 Q 22 2 24 6 Q 20 8 18 6 Z" fill="#F59E0B" stroke="#18181B" strokeWidth="1.5" />
      </svg>
    );
  }

  if (normalized.includes("rhino")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <ellipse cx="11" cy="12" rx="2.5" ry="4" fill="#94A3B8" stroke="#18181B" strokeWidth="2" />
        <ellipse cx="29" cy="12" rx="2.5" ry="4" fill="#94A3B8" stroke="#18181B" strokeWidth="2" />
        <path d="M 10 18 C 10 12 30 12 30 18 L 28 30 C 28 33 12 33 12 30 Z" fill="#CBD5E1" stroke="#18181B" strokeWidth="2.5" />
        <path d="M 18 22 Q 20 12 25 18 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        <circle cx="14" cy="18" r="1.5" fill="#18181B" />
        <circle cx="26" cy="18" r="1.5" fill="#18181B" />
      </svg>
    );
  }

  if (normalized.includes("giraffe")) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <line x1="16" y1="12" x2="16" y2="6" stroke="#18181B" strokeWidth="2" />
        <circle cx="16" cy="5" r="2" fill="#B45309" stroke="#18181B" strokeWidth="1.5" />
        <line x1="24" y1="12" x2="24" y2="6" stroke="#18181B" strokeWidth="2" />
        <circle cx="24" cy="5" r="2" fill="#B45309" stroke="#18181B" strokeWidth="1.5" />
        <ellipse cx="10" cy="14" rx="4" ry="2" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" transform="rotate(-20 10 14)" />
        <ellipse cx="30" cy="14" rx="4" ry="2" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" transform="rotate(20 30 14)" />
        <path d="M 12 16 C 12 11 28 11 28 16 L 25 32 C 25 35 15 35 15 32 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="15" cy="20" r="2" fill="#B45309" />
        <circle cx="25" cy="22" r="2" fill="#B45309" />
        <circle cx="18" cy="27" r="1.5" fill="#B45309" />
        <circle cx="16" cy="17" r="1.5" fill="#18181B" />
        <circle cx="24" cy="17" r="1.5" fill="#18181B" />
      </svg>
    );
  }

  // Default Sheep / Universal Animal Fallback
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <circle cx="20" cy="20" r="14" fill="#FFFDF5" stroke="#18181B" strokeWidth="2.5" />
      <ellipse cx="20" cy="22" rx="7" ry="6" fill="#E58C72" stroke="#18181B" strokeWidth="2" />
      <ellipse cx="11" cy="20" rx="3.5" ry="2" fill="#D97A60" stroke="#18181B" strokeWidth="1.5" transform="rotate(-20 11 20)" />
      <ellipse cx="29" cy="20" rx="3.5" ry="2" fill="#D97A60" stroke="#18181B" strokeWidth="1.5" transform="rotate(20 29 20)" />
      <circle cx="17" cy="21" r="1.2" fill="#18181B" />
      <circle cx="23" cy="21" r="1.2" fill="#18181B" />
      <circle cx="20" cy="15" r="4.5" fill="#FFFDF5" stroke="#18181B" strokeWidth="2" />
    </svg>
  );
}
