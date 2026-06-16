"use client";
"use client";
"use client";
"use client";

type Props = { className?: string; tone?: "ink" | "light" };

export default function Logo({ className = "", tone = "ink" }: Props) {
  const textColor = tone === "ink" ? "#382898" : "#FAFAF7";
  return (
    <a href="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="Somnath NX">
      <img
        src="/logo.png"
        alt="Somnath NX Logo"
        className="h-10 w-auto object-contain transition-all duration-300"
        style={{
          filter: tone === "light" ? "brightness(0) invert(1)" : "none",
        }}
      />
      <span
        className="font-serif tracking-wide text-[18px] lg:text-[21px] font-medium transition-colors duration-300"
        style={{ color: textColor }}
      >
        Somnath Nx
      </span>
    </a>
  );
}



