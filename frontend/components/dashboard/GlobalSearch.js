"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { api } from "../../lib/api";
import { setAnalysisError, setAnalysisLoading, setAnalysisResult } from "../../redux/store";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem("recentSearches") || "[]"));
    const onKey = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(id);
  }, [value]);

  const search = useQuery({
    queryKey: ["global-search", debounced],
    enabled: debounced.length > 1,
    queryFn: async ({ signal }) => (await api.get("/search", { params: { q: debounced }, signal })).data.results
  });


    const analyze = useMutation({
      mutationFn: async term =>
        (
          await api.post(
            "/assistant/analyze",
            { query: term },
            { timeout: 120000 }
          )
        ).data.analysis,

      onSuccess: data => {
        const query = value.trim();

        remember(query);

        dispatch(setAnalysisResult({
          analysis: data,
          query
        }));

        setOpen(false);
        router.push("/analysis");
      },

      onError: error => {
        dispatch(setAnalysisError(error.message));
        setOpen(true);
      }
    });


  const results = search.data || [];
  const visibleRecent = useMemo(() => recent.slice(0, 5), [recent]);

  function remember(term) {
    if (!term) return;
    const next = [term, ...recent.filter(x => x !== term)].slice(0, 6);
    setRecent(next);
    localStorage.setItem("recentSearches", JSON.stringify(next));
  }

  function runAnalyze() {
    const term = value.trim();
    if (term.length < 3 || analyze.isPending) return;
    dispatch(setAnalysisLoading(true));
    analyze.mutate(term);
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      runAnalyze();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(index => Math.min(index + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(index => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && results[active]) remember(value.trim());
  }

  return (
    <div className="relative order-3 w-full min-w-0 md:order-none md:block md:max-w-[860px] md:flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors" size={18} />
      <input
        ref={inputRef}
        value={value}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onChange={event => {
          setValue(event.target.value);
          setOpen(true);
        }}
        className="h-11 w-full rounded-xl border border-border/80 bg-card/90 px-11 pr-32 text-sm shadow-inner shadow-slate-900/5 outline-none transition-all duration-200 placeholder:text-muted-foreground/75 hover:border-border focus:border-primary/70 focus:bg-card focus:ring-2 focus:ring-primary/25 dark:bg-elevated/75 dark:shadow-black/10 dark:focus:bg-elevated/95 sm:h-12 sm:pr-36"
        placeholder="Search market, industry, company, competitor..."
        aria-label="Global search"
      />
      {value && <button className="absolute right-24 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground sm:right-28" onClick={() => setValue("")} aria-label="Clear search"><X size={16} /></button>}
      <Button className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-lg px-2.5 text-xs sm:px-3" onClick={runAnalyze} disabled={value.trim().length < 3 || analyze.isPending}>
        {analyze.isPending ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
        Analyze
      </Button>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-40 rounded-xl border border-border/80 bg-card/95 p-2 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-950/[0.03] backdrop-blur-xl dark:bg-card/95 dark:shadow-black/35 dark:ring-white/[0.03] sm:top-14">
          {search.isLoading && <p className="p-3 text-sm text-muted-foreground">Searching...</p>}
          {search.error && <p className="p-3 text-sm text-red-300">{search.error.message}</p>}
          {!debounced && (
            <div className="p-2">
              <p className="mb-2 px-2 text-xs uppercase text-muted-foreground">Recent searches</p>
              {visibleRecent.length ? visibleRecent.map(term => <button key={term} className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted" onClick={() => setValue(term)}>{term}</button>) : <p className="px-2 py-3 text-sm text-muted-foreground">No recent searches.</p>}
            </div>
          )}
          {debounced && !search.isLoading && !results.length && <p className="p-3 text-sm text-muted-foreground">No matching local result. Click Analyze to generate DeepSeek market analysis.</p>}
          {results.map((result, index) => (
            <Link key={`${result.type}-${result.id}`} href={result.href} onClick={() => { remember(value.trim()); setOpen(false); }} className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${active === index ? "bg-muted" : ""}`}>
              <span className="text-xs text-primary">{result.type}</span>
              <span className="ml-2 font-medium">{result.title}</span>
              <span className="ml-2 text-muted-foreground">{result.subtitle}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}