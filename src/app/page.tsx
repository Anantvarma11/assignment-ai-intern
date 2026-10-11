"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Person, DatingSimulation } from "@/lib/types";
import { PersonCard } from "@/components/PersonCard";
import {
  Sparkles,
  Users,
  HeartHandshake,
  BookOpen,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Compass,
  Cpu,
} from "lucide-react";

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const [peopleRes, simRes] = await Promise.all([
          fetch("/api/people"),
          fetch("/api/simulations"),
        ]);
        const peopleJson = await peopleRes.json();
        const simJson = await simRes.json();

        if (peopleJson.success) {
          setPeople(peopleJson.data);
          if (peopleJson.data.length >= 2) {
            setSelectedA(peopleJson.data[0].id);
            setSelectedB(peopleJson.data[2].id);
          }
        }
        if (simJson.success) {
          setSimulations(simJson.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl card-luxury p-8 sm:p-12 border-[#D4AF37]/30 bg-gradient-to-br from-[#11141A] via-[#0D1016] to-[#080A0D]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold gold-badge mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Autonomous Agentic Dating Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 font-serif leading-tight tracking-tight">
            Algorithmic Dating Grounded in{" "}
            <span className="gold-gradient-text">Actual Public Evidence.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Pairwise AI turns verified professional and personal profiles into autonomous
            conversational agents. Each agent engages in genuine multi-turn dating simulations
            to measure authentic conversational rhythm, intellectual alignment, and mutual compatibility.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/simulate"
              className="gold-button px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Simulate a Date Now</span>
            </Link>

            <Link
              href="/directory"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Browse 25 Real People</span>
            </Link>

            <Link
              href="/rankings"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 border border-slate-800 text-[#F3E5AB] hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span>Personalized Rankings</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Actual Data Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Real People Supported",
            value: people.length > 0 ? `${people.length} Verified` : "25+ Verified",
            desc: "Official LinkedIn & Instagram URLs",
            icon: ShieldCheck,
          },
          {
            label: "Completed Simulations",
            value: simulations.length.toString(),
            desc: "Full transcripts with evaluations",
            icon: HeartHandshake,
          },
          {
            label: "Inference Engine",
            value: "Cerebras / OpenRouter",
            desc: "Deterministic profile fallback",
            icon: Cpu,
          },
          {
            label: "Matching Model",
            value: "Hybrid Explainable",
            desc: "Directional & mutual scoring",
            icon: Compass,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-luxury rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                <Icon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-slate-100">{stat.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stat.desc}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Date Simulator Launcher */}
      <section className="card-luxury rounded-2xl p-6 sm:p-8 border-[#1E232E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#D4AF37]" />
              <span>Quick Matchmaker Simulation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any two individuals to generate an authentic agent-to-agent date simulation
            </p>
          </div>

          <Link
            href="/simulate"
            className="text-xs text-[#F3E5AB] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Full Theater Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select First Person (Agent A)
            </label>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === selectedB}>
                  {p.name} — {p.role}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center font-serif italic text-slate-400 text-sm hidden md:block">
            meets for coffee at
            <div className="text-[11px] text-[#D4AF37] font-sans font-semibold not-italic mt-0.5">
              The Conservatory at Blue Bottle
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Second Person (Agent B)
            </label>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === selectedA}>
                  {p.name} — {p.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/simulate?personA=${selectedA}&personB=${selectedB}`}
            className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Dating Simulation</span>
          </Link>
        </div>
      </section>

      {/* Featured Profiles Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <span>Real Profiles Directory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Featuring 25 real prominent technologists, founders, and innovators with verified public links
            </p>
          </div>

          <Link
            href="/directory"
            className="text-xs text-[#F3E5AB] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All ({people.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.slice(0, 6).map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Date Simulations Feed */}
      {simulations.length > 0 && (
        <section className="card-luxury rounded-2xl p-6 border-[#1E232E]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <span>Recent Agent Simulations & Transcripts</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Archived multi-turn interactions with genuine dialogue and compatibility evaluations
              </p>
            </div>

            <Link
              href="/transcripts"
              className="text-xs text-[#F3E5AB] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All Transcripts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1E232E]">
            {simulations.slice(0, 4).map((sim) => (
              <div key={sim.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-[#F3E5AB]">
                    {sim.evaluation.overallSimulationScore}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">
                      {sim.personA?.name || "Participant A"} & {sim.personB?.name || "Participant B"}
                    </h4>
                    <p className="text-xs text-slate-400">{sim.venue?.name} • {sim.turns?.length} conversational turns</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {sim.providerUsed}
                  </span>
                  <Link
                    href={`/simulate?simId=${sim.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
                  >
                    Read Transcript
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
