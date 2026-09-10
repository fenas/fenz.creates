"use client";

import React, { useState } from "react";
import { Lock, Mail, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

export function AdminAuthModal() {
  const { loginAdmin } = usePromptStore();
  const { showToast } = useToast();

  const [email, setEmail] = useState("fenas.fnz@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(email, password);
    if (success) {
      showToast("Welcome back, Fenas!", "success", "Admin studio unlocked");
    } else {
      setError(true);
      showToast("Invalid email or password", "error", "Please check your admin credentials.");
    }
  };

  const handleAutofill = () => {
    setEmail("fenas.fnz@gmail.com");
    setPassword("fenz.creates.admin@1967");
    setError(false);
    const success = loginAdmin("fenas.fnz@gmail.com", "fenz.creates.admin@1967");
    if (success) {
      showToast("Logged in with Verified Credentials", "success");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl floating-panel bg-[#0d0f17]/95 border border-white/10 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-950/40">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Admin Studio Portal
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to upload and manage prompts, tutorials, and roadmap content.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(false);
                }}
                placeholder="fenas.fnz@gmail.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs ${
                  error ? "border-red-500/60" : ""
                }`}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="••••••••••••••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs ${
                  error ? "border-red-500/60" : ""
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span>Invalid login credentials.</span>
                <div className="text-[11px] text-red-300/80 mt-0.5 font-mono">
                  Email: fenas.fnz@gmail.com
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-violet-600 to-red-600 hover:from-red-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Sign In to Admin Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Autofill Demo Credentials */}
        <div className="pt-4 border-t border-white/5 text-center space-y-2">
          <button
            onClick={handleAutofill}
            type="button"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Click to Auto-fill & Login as fenas.fnz@gmail.com</span>
          </button>
        </div>
      </div>
    </div>
  );
}
