"use client";

import React from "react";
import { CompatibilityMatch, Person } from "@/lib/types";
import { Sparkles, ShieldAlert, CheckCircle2, ArrowRightLeft, FileText, Info } from "lucide-react";

interface ScoreBreakdownProps {
  match: CompatibilityMatch;
  subject?: Person | null;
  candidate?: Person | null;
}

export function ScoreBreakdown({ match, subject, candidate }: ScoreBreakdownProps) {
  const { signalBreakdown, directionalCompatibility, weightsUsed } = match;

  return (
    <div className="space-y-6">
      {/* Top Banner: Mutual & Directional Scores */}
      <div className="card-luxury rounded-2xl p-6 bg-gradient-to-br from-[#11141A] to-[#0A0D12]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1E232E]">
          {/* Mutual Score */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#A38424]/10 border-2 border-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10">
              <span className="text-3xl font-black font-mono text-[#F3E5AB]">
                {match.mutualCompatibility}%
              </span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">
                Mutual Compatibility Score
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                {subject?.name || "Subject"} & {candidate?.name || "Candidate"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Harmonic synthesis of directional alignment, measurable signals, and live simulation
              </p>
            </div>
          </div>

          {/* Directional Asymmetry Indicators */}
          <div className="flex items-center gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[110px]">
                {subject?.name.split(" ")[0] || "A"} → {candidate?.name.split(" ")[0] || "B"}
              </div>
              <div className="text-base font-bold font-mono text-slate-200">
                {directionalCompatibility.subjectToCandidate}%
              </div>
            </div>
            <ArrowRightLeft className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[110px]">
                {candidate?.name.split(" ")[0] || "B"} → {subject?.name.split(" ")[0] || "A"}
              </div>
              <div className="text-base font-bold font-mono text-slate-200">
                {directionalCompatibility.candidateToSubject}%
              </div>
            </div>
          </div>
        </div>

        {/* Signal Dimensions Breakdown */}
        <div className="pt-6">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
            Scored Compatibility Signals & Weight Allocation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                label: "Shared Interests",
                val: signalBreakdown.sharedInterestsScore,
                weight: `${Math.round(weightsUsed.interests * 100)}%`,
                desc: "Jaccard & semantic focus overlap",
              },
              {
                label: "Shared Hobbies",
                val: signalBreakdown.sharedHobbiesScore,
                weight: `${Math.round(weightsUsed.hobbies * 100)}%`,
                desc: "Leisure lifestyle resonance",
              },
              {
                label: "Lifestyle & Vibe",
                val: signalBreakdown.lifestyleAlignmentScore,
                weight: `${Math.round(weightsUsed.lifestyle * 100)}%`,
                desc: "Ambition & social battery parity",
              },
              {
                label: "Preferences Fit",
                val: signalBreakdown.preferenceFulfillmentScore,
                weight: `${Math.round(weightsUsed.preferences * 100)}%`,
                desc: "Must-haves & dealbreaker checks",
              },
              {
                label: "Date Interaction",
                val: signalBreakdown.simulationInteractionScore,
                weight: `${Math.round(weightsUsed.simulation * 100)}%`,
                desc: "Observed agent dialogue chemistry",
              },
            ].map((sig, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">{sig.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">wt {sig.weight}</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-[#F3E5AB]">{sig.val}%</div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{sig.desc}</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full rounded-full"
                    style={{ width: `${sig.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Data Penalty if any */}
        {match.missingDataPenalty > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-center gap-3 text-xs text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Uncertainty Adjustment Applied: -{match.missingDataPenalty}% penalty due to incomplete or unverified explicit preference attributes.
            </span>
          </div>
        )}
      </div>

      {/* Shared Evidence & Grounded Citations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-luxury rounded-2xl p-5">
          <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Grounded Evidence Statements</span>
          </h4>
          <ul className="space-y-2">
            {match.evidenceStatements.map((ev, i) => (
              <li
                key={i}
                className="text-xs text-slate-300 p-2.5 rounded-lg bg-emerald-950/15 border border-emerald-900/30 leading-relaxed"
              >
                • {ev}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-luxury rounded-2xl p-5">
          <h4 className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Risk Factors & Friction Notices</span>
          </h4>
          {match.riskOrFrictionNotice.length > 0 ? (
            <ul className="space-y-2">
              {match.riskOrFrictionNotice.map((rf, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-300 p-2.5 rounded-lg bg-amber-950/15 border border-amber-900/30 leading-relaxed"
                >
                  • {rf}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-slate-400 p-3 rounded-lg bg-slate-900 border border-slate-800">
              No significant dealbreaker conflicts or friction flags detected.
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <span className="font-semibold text-slate-300 mr-1.5">Ethical Notice:</span>
        {match.disclaimer}
      </div>
    </div>
  );
}
