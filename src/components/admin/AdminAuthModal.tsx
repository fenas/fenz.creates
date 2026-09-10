"use client";

import React, { useState } from "react";
import { Lock, KeyRound, ShieldAlert, ArrowRight } from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

export function AdminAuthModal() {
  const { loginAdmin } = usePromptStore();
  const { showToast } = useToast();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passcode);
    if (success) {
      showToast("Welcome back, Admin!", "success");
    } else {
      setError(true);
      showToast("Invalid admin passcode", "error", "Try 'fenz2026' or 'admin'");
    }
  };

  const handleQuickDemo = () => {
    loginAdmin("fenz2026");
    showToast("Logged in with Studio Demo Passcode", "success");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl glass-panel bg-[#0d0f17] border border-white/10 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Admin Studio Portal
          </h2>
          <p className="text-xs text-slate-400">
            Enter your secret key to manage prompt showcases and categories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Passcode (e.g. fenz2026 or admin)"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm ${
                  error ? "border-red-500/60 focus:border-red-500" : ""
                }`}
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Incorrect passcode. Hint: &apos;fenz2026&apos;
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-amber-500 hover:from-amber-400 hover:to-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Unlock Admin Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/5 text-center">
          <button
            onClick={handleQuickDemo}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            ⚡ Quick 1-Click Studio Login (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
