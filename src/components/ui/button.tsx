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
    primary: "bg-brand text-white shadow-sm hover:bg-brand-strong",
    secondary: "border bg-surface text-foreground hover:bg-surface-muted",
    quiet: "text-foreground-muted hover:bg-surface-muted",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
