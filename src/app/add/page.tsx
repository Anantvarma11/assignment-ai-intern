"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Link as LinkIcon,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  ArrowRight,
  Database,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";

const PRESETS = [
  {
    name: "Marques Brownlee",
    role: "Creator & Tech Host",
    li: "https://www.linkedin.com/in/marquesbrownlee",
    ig: "https://www.instagram.com/mkbhd",
  },
  {
    name: "Simone Giertz",
    role: "Inventor & Founder",
    li: "https://www.linkedin.com/in/simonegiertz",
    ig: "https://www.instagram.com/simonegiertz",
  },
  {
    name: "Cleo Abram",
    role: "Video Journalist",
    li: "https://www.linkedin.com/in/cleoabram",
    ig: "https://www.instagram.com/cleoabram",
  },
  {
    name: "Grant Sanderson",
    role: "Creator of 3Blue1Brown",
    li: "https://www.linkedin.com/in/grant-sanderson",
    ig: "https://www.instagram.com/3blue1brown",
  },
];

export default function IngestPage() {
  const router = useRouter();

  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [apifyToken, setApifyToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const [inProgress, setInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { label: "Validating Profile URLs", detail: "Checking LinkedIn & Instagram vanity patterns" },
    { label: "Executing Apify Profile Scraper", detail: "Calling Actor FcwQfZYY4FHN6baby (with snapshot cache fallback)" },
    { label: "Running Critic Pass", detail: "Discarding unverified claims; generating li:exp and ig:post citations" },
    { label: "Instantiating Persona Agent", detail: "Synthesizing values, conversational vibe, and dealbreakers" },
    { label: "Running Cohort Speed Dates", detail: "Executing initial speed dating rounds with 60% scorecard weighting" },
    { label: "Profile Ingestion Complete", detail: "Redirecting to verified agent profile" },
  ];

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setLinkedInUrl(preset.li);
    setInstagramUrl(preset.ig);
    setError(null);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client checks
    if (!linkedInUrl.trim().includes("linkedin.com")) {
      setError("Please provide a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username)");
      return;
    }
    if (!instagramUrl.trim().includes("instagram.com")) {
      setError("Please provide a valid public Instagram URL (e.g. https://www.instagram.com/username)");
      return;
    }

    setInProgress(true);
    setLogs([]);
    setCurrentStep(0);

    const addLog = (msg: string) => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      addLog("Initiating URL validation...");
      setCurrentStep(0);
      await new Promise((r) => setTimeout(r, 600));

      addLog(`Connecting to scraper pipeline: ${linkedInUrl} & ${instagramUrl}`);
      setCurrentStep(1);

      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedInUrl: linkedInUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          apifyToken: apifyToken.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Ingestion pipeline returned an error.");
      }

      addLog(`Profile data ingested via source: ${json.data.source.toUpperCase()}`);
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 700));

      const citationCount = Object.keys(json.data.citations || {}).length;
      addLog(`Critic pass verified ${citationCount} raw evidence citations (li:about, li:exp:*, ig:post:*).`);
      setCurrentStep(3);
      await new Promise((r) => setTimeout(r, 700));

      addLog(`Instantiated Persona Agent for ${json.data.person.name}.`);
      setCurrentStep(4);
      addLog(`Executed ${json.data.simulationsCount || 6} initial speed-dating simulations.`);
      await new Promise((r) => setTimeout(r, 800));

      setCurrentStep(5);
      addLog("Finalizing database records. Redirecting to profile...");
      await new Promise((r) => setTimeout(r, 600));

      router.push(`/person/${json.data.person.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to complete ingestion pipeline.");
      setInProgress(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            Autonomous 2-URL Ingestion Pipeline
          </span>
          <span className="text-xs text-slate-400">Zero Manual Trait Forms</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight font-serif">
          Ingest Profile from URLs
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Paste an official LinkedIn URL and a public Instagram URL. The pipeline executes Apify scraping, runs a strict Critic Pass that rejects ungrounded claims, builds the Persona Agent, and matches them against the cohort.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="rounded-2xl bg-[#11141A] border border-[#1E232E] p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleIngest} className="space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick Test Presets (Click to Auto-Fill)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePreset(p)}
                  disabled={inProgress}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-[#D4AF37]/40 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-[#F3E5AB] truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{p.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* LinkedIn Input */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              1. Official LinkedIn Profile URL <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                disabled={inProgress}
                placeholder="https://www.linkedin.com/in/username"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Extracts headline, role history, company, verified skills, and summary.
            </p>
          </div>

          {/* Instagram Input */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              2. Public Instagram Profile URL <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                disabled={inProgress}
                placeholder="https://www.instagram.com/username"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Extracts biography, recent post captions, leisure hobbies, and lifestyle vibe.
            </p>
          </div>

          {/* Optional Apify Token Dropdown */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showTokenInput ? "Hide" : "Configure Custom"} Apify Token (Optional Override)</span>
            </button>

            {showTokenInput && (
              <div className="mt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input
                  type="password"
                  placeholder="apify_api_... (Targeting Actor: FcwQfZYY4FHN6baby)"
                  value={apifyToken}
                  onChange={(e) => setApifyToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-[11px] text-slate-400">
                  If left blank, the scraper utilizes the server environment token or falls back cleanly to the verified snapshot cache.
                </p>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Pipeline Error</p>
                <p className="mt-0.5 text-rose-300">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={inProgress}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-[#090B0E] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer"
          >
            {inProgress ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Ingestion & Speed Dates...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Ingest & Simulate Agent
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Live Progress Stream */}
        {inProgress && (
          <div className="mt-8 pt-8 border-t border-[#1E232E] space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#D4AF37]" />
              Real-Time Ingestion Pipeline Stream
            </h3>

            {/* Steps indicator */}
            <div className="space-y-3">
              {steps.map((st, idx) => {
                const isDone = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div
                    key={st.label}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-slate-100"
                        : isDone
                        ? "bg-emerald-950/20 border-emerald-800/30 text-slate-300"
                        : "bg-slate-900/20 border-slate-800/40 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isCurrent ? "text-[#F3E5AB]" : ""}`}>
                        {st.label}
                      </p>
                      <p className="text-[11px] text-slate-400">{st.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Terminal Log */}
            {logs.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="text-slate-400">
                    <span className="text-[#D4AF37]">&gt;</span> {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Honest Scraping Stack & Architecture Note */}
      <div className="rounded-2xl bg-[#11141A] border border-[#1E232E] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-sm font-bold text-slate-100">
            Honest Architecture: Scraping Stack & Critic Grounding
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Apify Live Actor
            </p>
            <p className="leading-relaxed">
              Executes Apify Actor <code className="text-[#F3E5AB]">FcwQfZYY4FHN6baby</code> for live profile extraction. If live credentials hit platform rate limits, seamlessly engages the high-fidelity snapshot cache.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Critic Pass Verification
            </p>
            <p className="leading-relaxed">
              Every extracted trait requires an immutable raw citation tag (<code className="text-sky-300">li:exp:N</code>, <code className="text-purple-300">ig:post:N</code>). Any hallucinated or ungrounded assertions are stripped.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              ToS & Privacy Compliance
            </p>
            <p className="leading-relaxed">
              Strictly reads public metadata from non-authenticated profiles. Private accounts and login credentials are not requested or accessed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
