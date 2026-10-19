"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { AuthExperience, AuthField } from "../../../components/AuthExperience";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <AuthExperience activeMode="login">
      <form className="grid gap-3.5 pt-6 sm:pt-7" onSubmit={submit}>
        <div>
          <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
            Reset Password
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#AEB8D0]">
            Enter your email address to continue
          </p>
        </div>

        {sent && (
          <p className="rounded-xl border border-emerald-400/25 bg-emerald-950/25 p-3 text-sm leading-6 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
            Password reset instructions are ready for {email}.
          </p>
        )}

        <AuthField
          icon={Mail}
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#6D3DFF] via-[#695CFF] to-[#2F7DFF] px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(64,93,255,0.30)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(64,93,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AA2FF]"
        >
          Send Reset Link
          <ArrowRight className="size-4" />
        </button>

        <p className="border-t border-[#263E62] pt-4 text-center text-sm leading-6 text-[#AEB8D0]">
          <Link className="inline-flex items-center justify-center gap-2 font-semibold text-[#8F73FF] transition-colors hover:text-white" href="/login">
            <ArrowLeft className="size-4" />
            Back to Login
          </Link>
        </p>
      </form>
    </AuthExperience>
  );
}
