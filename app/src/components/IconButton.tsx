import type { ReactNode } from "react";

export type ActionIcon = "plus" | "write" | "trash" | "pencil" | "check" | "x";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function ActionGlyph({ icon }: { icon: ActionIcon }) {
  if (icon === "plus") {
    return (
      <Glyph>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </Glyph>
    );
  }
  if (icon === "write") {
    return (
      <Glyph>
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </Glyph>
    );
  }
  if (icon === "trash") {
    return (
      <Glyph>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
      </Glyph>
    );
  }
  if (icon === "pencil") {
    return (
      <Glyph>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </Glyph>
    );
  }
  if (icon === "check") {
    return (
      <Glyph>
        <path d="M20 6 9 17l-5-5" />
      </Glyph>
    );
  }
  return (
    <Glyph>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </Glyph>
  );
}

export function IconButton({
  icon,
  label,
  className = "",
  type = "button",
  showLabel = false,
  onClick,
}: {
  icon: ActionIcon;
  label: string;
  className?: string;
  type?: "button" | "submit";
  showLabel?: boolean;
  onClick?: () => void;
}) {
  const classes = ["icon-button", showLabel ? "with-label" : "", className].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} aria-label={label} title={label} onClick={onClick}>
      <ActionGlyph icon={icon} />
      {showLabel ? <span>{label}</span> : null}
    </button>
  );
}
