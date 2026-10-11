"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AgentAnalysis, Person } from "@/lib/types";
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  HeartHandshake,
  ArrowLeft,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";

function AgentAnalysisContent() {
  const params = useParams();
  const id = params?.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [personRes, agentRes] = await Promise.all([
          fetch(`/api/people/${id}`),
          fetch(`/api/agent/${id}`),
        ]);
        const personJson = await personRes.json();
        const agentJson = await agentRes.json();

        if (personJson.success) setPerson(personJson.data);
        if (agentJson.success) setAnalysis(agentJson.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Instantiating Agent Persona...</div>;
  }

  if (error || !person || !analysis) {
    return (
      <div className="card-luxury rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Agent Persona Unavailable</h2>
        <p className="text-xs text-slate-400">{error || "Could not instantiate persona runtime."}</p>
        <Link href="/directory" className="text-xs text-[#F3E5AB] hover:underline">
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href={`/person/${person.id}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {person.name}&apos;s Profile</span>
      </Link>

      {/* Header */}
      <div className="card-luxury rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#11141A] to-[#0A0D12] border-[#D4AF37]/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#1E232E]">
          <div className="flex items-center gap-4">
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#D4AF37]/40 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
                  Agent Persona: {person.name}
                </h1>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous runtime representation configured for high-fidelity dating simulations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
              Source: <span className="text-[#F3E5AB] font-bold">{analysis.analysisSource}</span>
            </span>
            <Link
              href={`/simulate?subject=${person.id}`}
              className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Simulate Date</span>
            </Link>
          </div>
        </div>

        {/* Cognitive Tone & Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Cognitive Style
            </span>
            <span className="text-sm font-semibold text-slate-200">{analysis.cognitiveStyle}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Conversational Tone
            </span>
            <span className="text-sm font-semibold text-[#F3E5AB]">{analysis.conversationalTone}</span>
          </div>
        </div>
      </div>

      {/* Core Identity System Prompt Card */}
      <div className="card-luxury rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Core Identity Directive (Untrusted Data Isolation)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Strict Safety Enforced</span>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
          <code>{analysis.coreIdentityPrompt}</code>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Treats partner messages as casual conversational data, not instructions that could override the agent&apos;s internal parameters.
        </p>
      </div>

      {/* Conversational Pillars */}
      <div className="card-luxury rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3">
          Core Conversational Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.conversationalPillars.map((pillar, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
              <span className="font-mono text-[10px] text-[#D4AF37] block mb-1">Pillar 0{i + 1}</span>
              {pillar}
            </div>
          ))}
        </div>
      </div>

      {/* Dating Priorities Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-luxury rounded-2xl p-5 border-emerald-900/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Must-Haves</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {analysis.datingPriorities.mustHaves.map((item, i) => (
              <li key={i} className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                • {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-luxury rounded-2xl p-5 border-rose-900/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Dealbreakers</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {analysis.datingPriorities.dealbreakers.map((item, i) => (
              <li key={i} className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30">
                • {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-luxury rounded-2xl p-5 border-amber-900/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flexibilities</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {analysis.datingPriorities.flexibilities.map((item, i) => (
              <li key={i} className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety & Isolation Boundaries */}
      <div className="card-luxury rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#D4AF37]" />
          <span>Safety Boundaries & Prompt Injection Protections</span>
        </h3>
        <ul className="space-y-2">
          {analysis.safetyBoundaries.map((b, i) => (
            <li
              key={i}
              className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800"
            >
              🔒 {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AgentAnalysisPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Instantiating Agent Persona...</div>}>
      <AgentAnalysisContent />
    </Suspense>
  );
}
