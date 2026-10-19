"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { api } from "../../../lib/api";
import { setUser } from "../../../redux/store";
import { AuthExperience, AuthField } from "../../../components/AuthExperience";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setForm(current => ({ ...current, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      dispatch(setUser(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthExperience activeMode="login">
      <form className="grid gap-3.5 pt-6 sm:pt-7" onSubmit={submit}>
        <div>
          <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
            Welcome Back! <span aria-hidden="true">{"\uD83D\uDC4B"}</span>
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#AEB8D0]">
            Sign in to continue your research journey
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/25 bg-red-950/35 p-3 text-sm leading-6 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
            {error}
          </p>
        )}

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
          rightIcon={showPassword ? Eye : EyeOff}
          rightIconLabel={showPassword ? "Hide password" : "Show password"}
          rightIconPressed={showPassword}
          onRightIconClick={() => setShowPassword(current => !current)}
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />

        <div className="flex flex-col gap-3 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="size-4 rounded border-[#6A7EA1] bg-[#061528] text-[#6D5DF6] focus:ring-[#6D5DF6]"
            />
            Remember me
          </label>
          <Link className="font-medium text-[#8F73FF] hover:text-white" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#6D3DFF] via-[#695CFF] to-[#2F7DFF] px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(64,93,255,0.30)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(64,93,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AA2FF]"
        >
          Sign In
          <ArrowRight className="size-4" />
        </button>

        <p className="border-t border-[#263E62] pt-4 text-center text-sm leading-6 text-[#AEB8D0]">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-[#8F73FF] transition-colors hover:text-white" href="/signup">
            Create Account
          </Link>
        </p>
      </form>
    </AuthExperience>
  );
}
