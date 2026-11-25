import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function SearchIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </svg>
  );
}

export function CopyIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" />
    </svg>
  );
}

export function CheckIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ArrowRightIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function PlusIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function PlayIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...p}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...p}>
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function UploadIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function TrashIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function MenuIcon(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}
