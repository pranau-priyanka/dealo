import type { ButtonHTMLAttributes, ReactNode } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
};
export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: Props) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-strong",
    secondary: "border bg-surface hover:bg-surface-muted",
    quiet: "text-foreground-muted hover:bg-surface-muted",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
