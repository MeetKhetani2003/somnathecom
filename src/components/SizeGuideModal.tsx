"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-[560px] overflow-hidden rounded-[32px] bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-6 md:p-8">
              <h3 className="font-display text-[22px] font-bold text-dark">Size Guide</h3>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-bg-base transition hover:bg-border">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>
            <div className="p-6 md:p-8 bg-bg-base">
              <p className="text-[14px] text-dark/70 mb-6 font-medium">Find your perfect fit. Our nightwear is designed for a relaxed, comfortable feel.</p>

              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-border bg-bg-base">
                      <th className="p-4 font-bold text-dark">Size</th>
                      <th className="p-4 font-bold text-dark">Chest (in)</th>
                      <th className="p-4 font-bold text-dark">Waist (in)</th>
                      <th className="p-4 font-bold text-dark">Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: "M (Medium)", chest: "38-40", waist: "30-32", hip: "40-42" },
                      { size: "L (Large)", chest: "40-42", waist: "32-34", hip: "42-44" },
                      { size: "XL (X-Large)", chest: "42-44", waist: "34-36", hip: "44-46" },
                      { size: "XXL (2X-Large)", chest: "44-46", waist: "36-38", hip: "46-48" },
                      { size: "3XL (3X-Large)", chest: "46-48", waist: "38-40", hip: "48-50" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0 transition-colors hover:bg-bg-base/50">
                        <td className="p-4 font-bold text-primary">{row.size}</td>
                        <td className="p-4 text-dark/70 font-medium">{row.chest}</td>
                        <td className="p-4 text-dark/70 font-medium">{row.waist}</td>
                        <td className="p-4 text-dark/70 font-medium">{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-surface p-4 border border-border shadow-sm">
                <Sparkles className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-relaxed text-dark/70">
                  <strong className="text-dark">Fit Advice:</strong> If you are between sizes or prefer an oversized, airy fit for sleeping, we recommend sizing up.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
