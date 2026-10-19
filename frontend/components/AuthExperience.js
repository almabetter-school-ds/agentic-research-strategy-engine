"use client";

import Link from "next/link";
import {
  BrainCircuit,
  LineChart,
  Sparkles,
  Target
} from "lucide-react";
import { cn } from "../lib/utils";

const features = [
  {
    icon: LineChart,
    label: "Real-time Market Intelligence",
    detail: "Access live data and emerging trends.",
    color: "text-[#9D5CFF]",
    ring: "border-[#9D5CFF]/35 bg-[#9D5CFF]/10"
  },
  {
    icon: Target,
    label: "Competitor Deep Dive",
    detail: "Track, analyze and compare competitors.",
    color: "text-[#2CB7FF]",
    ring: "border-[#2CB7FF]/30 bg-[#2CB7FF]/10"
  },
  {
    icon: Sparkles,
    label: "AI-Powered Reports",
    detail: "Generate comprehensive reports in seconds.",
    color: "text-[#32D979]",
    ring: "border-[#32D979]/30 bg-[#32D979]/10"
  }
];

export function AuthExperience({ activeMode, children }) {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#020716] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,#031326_0%,#020716_42%,#030517_65%,#170747_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_74%,rgba(37,99,235,0.20),transparent_24rem),radial-gradient(circle_at_84%_10%,rgba(124,58,237,0.24),transparent_26rem)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(45,127,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(45,127,255,0.18)_1px,transparent_1px)] [background-size:86px_86px]" />

      <div className="relative mx-auto grid min-h-[100dvh] w-full max-w-[1180px] grid-cols-1 items-center gap-7 px-5 py-5 sm:px-8 lg:grid-cols-[484px_minmax(500px,540px)] lg:gap-12 lg:px-6 xl:gap-12">
        <section className="flex h-full flex-col justify-between gap-6 py-1 lg:h-[calc(100dvh-2.5rem)] lg:max-h-[760px]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-[#7C5CFF]/45 bg-[#1E1B4B]/45 shadow-[0_0_28px_rgba(124,92,255,0.18)]">
                <BrainCircuit className="size-7 text-[#7C5CFF]" />
              </span>
              <span className="max-w-[270px] text-lg font-bold leading-tight sm:text-xl">
                AI Market Research & Strategy Engine
              </span>
            </Link>
          </div>

          <div className="max-w-[390px]">
            <div className="mb-5 inline-flex rounded-lg border border-[#31517D] bg-[#08162B]/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8F73FF]">
              AI-Powered Insights
            </div>
            <h1 className="text-[32px] font-extrabold leading-[1.08] text-white sm:text-[34px] lg:text-[33px]">
              Smarter Research.
              <span className="block bg-gradient-to-r from-[#2CB7FF] via-[#5864FF] to-[#B456FF] bg-clip-text text-transparent">
                Stronger Strategies.
              </span>
            </h1>
            <p className="mt-4 max-w-[370px] text-sm leading-6 text-[#B7C0D7] sm:text-base">
              Uncover market opportunities, analyze competitors, and make data-driven decisions with the power of AI.
            </p>

            <div className="mt-7 grid gap-4">
              {features.map(feature => {
                const Icon = feature.icon;
                return (
                  <div key={feature.label} className="flex items-center gap-3.5">
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full border", feature.ring)}>
                      <Icon className={cn("size-5", feature.color)} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{feature.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[#AAB4CC]">{feature.detail}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <ResearchIllustration />

          <p className="hidden text-xs text-[#71809C] lg:block">
            &copy; 2024 AI Market Research & Strategy Engine. All rights reserved.
          </p>
        </section>

        <section className="flex w-full flex-col items-center gap-6 pb-4 pt-2 lg:pb-0">
          <div className="w-full max-w-[540px] rounded-[18px] border border-[#31517D]/80 bg-[#07182F]/72 p-5 shadow-[0_26px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-7 lg:p-8">
            <div className="grid grid-cols-2 border-b border-[#263E62] text-center text-sm">
              <Link
                href="/login"
                className={cn(
                  "relative pb-4 font-medium transition-colors",
                  activeMode === "login" ? "text-white" : "text-[#AEB8D0] hover:text-white"
                )}
              >
                Login
                {activeMode === "login" && (
                  <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-gradient-to-r from-[#24C8FF] via-[#7C5CFF] to-transparent" />
                )}
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "relative pb-4 font-medium transition-colors",
                  activeMode === "signup" ? "text-white" : "text-[#AEB8D0] hover:text-white"
                )}
              >
                Create Account
                {activeMode === "signup" && (
                  <span className="absolute bottom-[-1px] right-0 h-[2px] w-full bg-gradient-to-l from-[#24C8FF] via-[#7C5CFF] to-transparent" />
                )}
              </Link>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function ResearchIllustration() {
  return (
    <div className="relative mx-auto hidden h-[230px] w-full max-w-[390px] items-end justify-center lg:flex">
      <div className="absolute bottom-5 h-20 w-[88%] rounded-[50%] bg-[#245BFF]/20 blur-2xl" />
      <div className="relative h-40 w-[88%] rounded-[18px] border border-[#2B63D9]/70 bg-[#081832]/80 shadow-[0_30px_70px_rgba(37,99,235,0.28)] [transform:perspective(900px)_rotateX(58deg)]">
        <div className="absolute inset-x-8 top-10 h-px bg-[#2B63D9]/55" />
        <div className="absolute inset-y-7 left-12 w-px bg-[#2B63D9]/55" />
        <div className="absolute bottom-10 left-48 right-9 flex items-end gap-3">
          {[28, 42, 58, 76].map(height => (
            <span
              key={height}
              className="w-4 rounded-t-md bg-gradient-to-t from-[#245BFF] to-[#35C8FF] shadow-[0_0_18px_rgba(44,183,255,0.35)]"
              style={{ height }}
            />
          ))}
        </div>
        <div className="absolute left-8 top-10 h-16 w-[48%]">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 240 100" aria-hidden="true">
            <path
              d="M4 78 C34 54 58 92 88 58 S137 50 160 24 S196 58 232 12"
              fill="none"
              stroke="#9D5CFF"
              strokeLinecap="round"
              strokeWidth="6"
            />
            <circle cx="232" cy="12" r="6" fill="#B456FF" />
          </svg>
        </div>
        <div className="absolute right-8 top-7 flex size-12 items-center justify-center rounded-full border-[9px] border-[#245BFF] border-r-[#32D979] border-t-[#9D5CFF] bg-[#07182F]" />
      </div>
      <div className="absolute bottom-0 h-12 w-[92%] rounded-[50%] border border-[#3D64FF]/50 bg-[#061528]/85 shadow-[0_0_55px_rgba(88,100,255,0.42)]" />
      <div className="absolute bottom-5 h-7 w-[48%] rounded-[50%] bg-[#5B6DFF]/45 blur-sm" />
    </div>
  );
}

export function AuthField({
  icon: Icon,
  rightIcon: RightIcon,
  rightIconLabel,
  rightIconPressed,
  onRightIconClick,
  label,
  className = "",
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B7C0D7]" />
        <input
          {...props}
          className={cn(
            "auth-input h-10 w-full rounded-xl border border-[#263E62] bg-[#061528]/78 py-2 pl-10 pr-4 text-sm text-white outline-none shadow-inner shadow-black/20 transition-all duration-200 placeholder:text-[#9AA7C0] hover:border-[#3C5F91] focus:border-[#6D5DF6]/80 focus:bg-[#071A34] focus:ring-2 focus:ring-[#3B82F6]/25",
            RightIcon && "pr-10",
            className
          )}
        />
        {RightIcon && onRightIconClick && (
          <button
            type="button"
            aria-label={rightIconLabel}
            aria-pressed={rightIconPressed}
            onClick={onRightIconClick}
            className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#B7C0D7] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AA2FF]"
          >
            <RightIcon className="size-4" />
          </button>
        )}
        {RightIcon && !onRightIconClick && (
          <RightIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B7C0D7]" />
        )}
      </span>
    </label>
  );
}
