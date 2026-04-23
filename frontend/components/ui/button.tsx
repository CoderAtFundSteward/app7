import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export default function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base = "rounded px-4 py-2 text-sm font-medium";
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white hover:bg-slate-100"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
