"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, User, Shield, Compass } from "lucide-react";
import { signIn } from "next-auth/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="pointer-events-auto w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#F0E6F2] bg-white p-7 shadow-2xl shadow-[#8B1D8F]/10"
              style={{ fontFamily: "Plus Jakarta Sans, Outfit, Inter, sans-serif" }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 rounded-full bg-[#FCF7FD] px-3 py-1 text-[12px] font-medium text-[#8B1D8F] border border-[#F5E6F7]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Welcome to Saheli Shrungar</span>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#F0E6F2] text-[#8B7A8F] hover:bg-[#F8F0F9] hover:text-[#8B1D8F] transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Title / Description */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-white shadow-lg shadow-[#8B1D8F]/15">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-[22px] font-bold text-[#1A0F1C] tracking-tight">Sign In / Register</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B5A6F]">
                  Access your profile to sync your wishlist, view order history, and track deliveries.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => signIn("google")}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[#EEDDF0] bg-white py-3.5 text-[14.5px] font-semibold text-[#3A2A3D] transition hover:bg-[#FCF7FD] hover:border-[#E1BFE6] active:scale-[0.98]"
                >
                  {/* Google Colorful Icon */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 15.01 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.83 2.97C6.01 7.27 8.78 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.4-4.92 3.4-8.54z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.08 14.73c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1L1.25 7.56C.45 9.17 0 10.97 0 12.87c0 1.9.45 3.7 1.25 5.31l3.83-3.45z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-4.27 1.09-3.22 0-5.99-2.23-6.96-5.26l-3.83 2.97C3.2 20.26 7.24 23 12 23z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Developer Options Separator */}
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-[#F0E6F2]"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-[#A38AA6] uppercase tracking-wider">
                    Developer Quick Sign-In
                  </span>
                  <div className="flex-grow border-t border-[#F0E6F2]"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      signIn("bypass-login", {
                        email: "tester@example.com",
                        name: "Tester User",
                        role: "user",
                      })
                    }
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#FCF7FD] hover:bg-[#F3E7F5] border border-[#F0E6F2] hover:border-[#E1BFE6] py-3 text-[13px] font-semibold text-[#8B1D8F] transition active:scale-[0.97]"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Tester Bypass</span>
                  </button>

                  <button
                    onClick={() =>
                      signIn("bypass-login", {
                        email: "admin@example.com",
                        name: "Admin User",
                        role: "admin",
                      })
                    }
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-100 py-3 text-[13px] font-semibold text-purple-700 transition active:scale-[0.97]"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin Bypass</span>
                  </button>
                </div>
              </div>

              {/* Secure note */}
              <p className="mt-6 text-center text-[11px] text-[#A38AA6]">
                Secure login powered by NextAuth.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
