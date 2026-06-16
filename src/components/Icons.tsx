"use client";
"use client";
"use client";
type P = { className?: string; size?: number };
const base = (size = 18) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const IconSearch = ({ className, size }: P) => <svg {...base(size)} className={className}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
export const IconHeart = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
export const IconHeartFill = ({ className, size }: P) => <svg width={size||18} height={size||18} viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
export const IconBag = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
export const IconUser = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
export const IconMenu = ({ className, size }: P) => <svg {...base(size)} className={className}><line x1="3" x2="21" y1="8" y2="8"/><line x1="3" x2="21" y1="16" y2="16"/></svg>;
export const IconX = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
export const IconArrowRight = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
export const IconArrowLeft = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
export const IconArrowDown = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
export const IconArrowUpRight = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>;
export const IconPlus = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
export const IconMinus = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M5 12h14"/></svg>;
export const IconCheck = ({ className, size }: P) => <svg {...base(size)} className={className}><polyline points="20 6 9 17 4 12"/></svg>;
export const IconInstagram = ({ className, size }: P) => <svg {...base(size)} className={className}><rect width="20" height="20" x="2" y="2" rx="0"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
export const IconGoogle = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 1 1 7.96-21l5.66-5.66A20 20 0 1 0 24 44c11 0 20-8 20-20 0-1.34-.14-2.65-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.57 4.82A12 12 0 0 1 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66A19.94 19.94 0 0 0 24 4C16.32 4 9.66 8.34 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.16 0 9.86-1.98 13.4-5.2l-6.18-5.23A11.92 11.92 0 0 1 24 36c-5.27 0-9.74-3.36-11.37-8.06l-6.52 5.02C9.4 39.55 16.13 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.78 2.24-2.21 4.16-4.08 5.57l6.18 5.23C40.45 35.16 44 30 44 24c0-1.34-.14-2.65-.4-3.5z"/></svg>
);
export const IconHome = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
export const IconPackage = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
export const IconMap = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
export const IconReturn = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>;
export const IconSettings = ({ className, size }: P) => <svg {...base(size)} className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
export const IconChart = ({ className, size }: P) => <svg {...base(size)} className={className}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
export const IconTag = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" x2="7.01" y1="7" y2="7"/></svg>;
export const IconStar = ({ className, size }: P) => <svg width={size||14} height={size||14} viewBox="0 0 24 24" className={className} fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
export const IconLogout = ({ className, size }: P) => <svg {...base(size)} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
export const IconChevron = ({ className, size }: P) => <svg {...base(size)} className={className}><polyline points="9 18 15 12 9 6"/></svg>;



