"use client";

import { IconArrowRight } from "@/components/Icons";
import { navigate } from "@/store";

export default function NotFound() {
  return (
    <div className="page-enter pt-32 pb-32 min-h-[80vh] grid place-items-center">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">— Page Not Found</p>
        <h1 className="editorial-h text-ink text-[80px] md:text-[140px] lg:text-[200px] mt-6 leading-none">
          404
        </h1>
        <p className="serif-h text-[22px] lg:text-[28px] text-muted mt-8 max-w-md mx-auto leading-[1.4]">
          The page you were looking for has been moved, or never existed.
        </p>
        <button onClick={() => navigate("/")} className="mt-12 btn-line">Return Home <IconArrowRight size={14}/></button>
      </div>
    </div>
  );
}
