"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { api } from "../../../lib/api";
import { setUser } from "../../../redux/store";
import { AuthExperience, AuthField } from "../../../components/AuthExperience";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      dispatch(setUser(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <AuthExperience activeMode="signup">
      <form className="grid gap-3 pt-6 sm:pt-7" onSubmit={submit}>
        <div>
          <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
            Create New Account
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#AEB8D0]">
            Join your AI-powered research workspace
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/25 bg-red-950/35 p-3 text-sm leading-6 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
            {error}
          </p>
        )}

        <AuthField
          icon={User}
          label="Full Name"
          autoComplete="name"
          placeholder="Enter your name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          minLength={2}
          required
        />
        <AuthField
          icon={Mail}
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <AuthField
          icon={Lock}
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          minLength={8}
          required
        />

        <p className="rounded-xl border border-[#263E62] bg-[#061528]/58 p-3 text-sm leading-6 text-[#AEB8D0]">
          New accounts start as Consultants. Reviewer and administrator access is assigned separately by an authorized administrator.
        </p>

        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#6D3DFF] via-[#695CFF] to-[#2F7DFF] px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(64,93,255,0.30)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(64,93,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AA2FF]"
        >
          Create Account
          <ArrowRight className="size-4" />
        </button>

        <p className="border-t border-[#263E62] pt-4 text-center text-sm leading-6 text-[#AEB8D0]">
          Already registered?{" "}
          <Link className="font-semibold text-[#8F73FF] transition-colors hover:text-white" href="/login">
            Sign In
          </Link>
        </p>
      </form>
    </AuthExperience>
  );
}
