"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

export function AdminAuthModal() {
  const { loginAdmin } = usePromptStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const success = await loginAdmin(email, password);
      if (!success) {
        setErrorMsg("Access Denied: Invalid credentials or unauthorized account.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[22px] bg-[var(--surface)] border border-[var(--border)] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-5 h-5 text-[var(--icon-primary)] stroke-[1.75]" />
          </div>
          <h1 className="text-lg font-medium text-[var(--text-primary)] tracking-tight">
            Arenae Admin Studio
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Sign in with your administrator credentials to access the studio.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-primary)]">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="admin@arenae.online"
                className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[var(--text-primary)]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 font-mono"
              >
                {showPassword ? <EyeOff className="w-3 h-3 stroke-[1.75]" /> : <Eye className="w-3 h-3 stroke-[1.75]" />}
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="••••••••••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5 stroke-[1.75]" />
              <div>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium shadow-sm disabled:opacity-60"
          >
            <span>{loading ? "Signing in..." : "Sign In to Studio"}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </form>
      </div>
    </div>
  );
}
