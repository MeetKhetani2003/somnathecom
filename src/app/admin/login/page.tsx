"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as env admin → redirect to admin dashboard
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.isEnvAdmin) {
      router.replace("/admin");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("admin-login", {
        username,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.replace("/admin");
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-[#2D1030] to-[#1A0F1C] flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#E91E7A]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          
          {/* Header strip */}
          <div className="bg-gradient-to-r from-primary to-[var(--color-secondary)] px-8 py-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Admin Console</h1>
            <p className="mt-1 text-[13px] text-white/70">Somnath NX Shrungar — Secure Access</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-[13px] text-red-300">
                  <Lock className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-semibold text-white/60 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    id="admin-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full rounded-xl border border-white/10 bg-white/8 pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-primary focus:bg-white/10 transition backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-semibold text-white/60 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full rounded-xl border border-white/10 bg-white/8 pl-10 pr-12 py-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-primary focus:bg-white/10 transition backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="admin-login-submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-[var(--color-secondary)] py-3.5 text-[15px] font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In to Admin Console"
                )}
              </button>
            </form>

            {/* Divider & back link */}
            <div className="mt-6 pt-5 border-t border-white/8 text-center">
              <p className="text-[12px] text-white/35">
                Not an admin?{" "}
                <a href="/" className="text-[#E491C8] hover:text-white transition font-medium">
                  Return to Store →
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Security note */}
        <p className="mt-5 text-center text-[11.5px] text-white/25">
          🔒 This portal is restricted to authorised administrators only.
        </p>
      </div>
    </div>
  );
}
