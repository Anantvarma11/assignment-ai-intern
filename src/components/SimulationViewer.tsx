"use client";

import React, { useState } from "react";
import { DatingSimulation, Person } from "@/lib/types";
import { MessageSquare, Sparkles, MapPin, Eye, ThumbsUp, AlertTriangle, ShieldCheck } from "lucide-react";

interface SimulationViewerProps {
  simulation: DatingSimulation;
  personA?: Person | null;
  personB?: Person | null;
}

export function SimulationViewer({ simulation, personA, personB }: SimulationViewerProps) {
  const [showInternalThoughts, setShowInternalThoughts] = useState(true);

  const getAvatar = (speakerId: string) => {
    if (personA && personA.id === speakerId) return personA.avatarUrl;
    if (personB && personB.id === speakerId) return personB.avatarUrl;
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
  };

  const getVibeBadgeColor = (vibe?: string) => {
    switch (vibe) {
      case "delighted":
        return "bg-rose-950/50 text-rose-300 border-rose-800/40";
      case "playful":
        return "bg-amber-950/50 text-amber-300 border-amber-800/40";
      case "engaged":
        return "bg-emerald-950/50 text-emerald-300 border-emerald-800/40";
      case "curious":
        return "bg-sky-950/50 text-sky-300 border-sky-800/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Venue & Ambient Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#11141A] to-slate-900 border border-[#1E232E] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Date Setting
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-400">{simulation.venue.setting}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{simulation.venue.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
              Provider: <span className="text-[#F3E5AB] font-semibold">{simulation.providerUsed}</span>
            </span>
            <button
              onClick={() => setShowInternalThoughts(!showInternalThoughts)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showInternalThoughts
                  ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#F3E5AB]"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Internal Cognition</span>
            </button>
          </div>
        </div>
      </div>

      {/* Turn by Turn Transcript */}
      <div className="space-y-4">
        {simulation.turns.map((turn, index) => {
          const isA = turn.speakerId === simulation.personAId;
          const avatar = getAvatar(turn.speakerId);

          return (
            <div
              key={index}
              className={`flex gap-4 items-start ${isA ? "flex-row" : "flex-row-reverse"}`}
            >
              {/* Avatar */}
              <img
                src={avatar}
                alt={turn.speakerName}
                className="w-10 h-10 rounded-xl object-cover border border-[#1E232E] shrink-0 mt-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                }}
              />

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isA ? "text-left" : "text-right"}`}>
                <div className={`flex items-center gap-2 ${isA ? "justify-start" : "justify-end"}`}>
                  <span className="text-xs font-bold text-slate-200">{turn.speakerName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Turn {turn.turnIndex + 1}</span>
                  {turn.vibeSignal && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getVibeBadgeColor(
                        turn.vibeSignal
                      )}`}
                    >
                      {turn.vibeSignal}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                    isA
                      ? "bg-[#11141A] border-[#1E232E] text-slate-100 rounded-tl-sm"
                      : "bg-[#161B24] border-[#222B3A] text-slate-100 rounded-tr-sm"
                  }`}
                >
                  <p>{turn.message}</p>
                </div>

                {/* Agent Internal Monologue */}
                {showInternalThoughts && turn.internalMonologue && (
                  <div
                    className={`text-[11px] text-slate-400 italic px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800/80 inline-block max-w-full ${
                      isA ? "text-left" : "text-right"
                    }`}
                  >
                    <span className="text-[#D4AF37] font-medium not-italic mr-1.5">Agent Reflection:</span>
                    {turn.internalMonologue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post-Date Compatibility Evaluation Summary */}
      <div className="card-luxury rounded-2xl p-6 mt-8 border-[#D4AF37]/30 bg-gradient-to-br from-[#11141A] to-[#0A0D12]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1E232E]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h4 className="text-lg font-bold text-slate-100">Interaction Analysis & Second Date Verdict</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Grounded simulation evaluation synthesized from dialogue flow and mutual responsiveness
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Overall Chemistry
              </div>
              <div className="text-2xl font-black text-[#F3E5AB] font-mono">
                {simulation.evaluation.overallSimulationScore}%
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-bold uppercase tracking-wider">
              {simulation.evaluation.secondDateLikelihood.replace("_", " ")}
            </div>
          </div>
        </div>

        {/* 5-Dimension Radar Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Chemistry", val: simulation.evaluation.chemistryScore },
            { label: "Intellectual", val: simulation.evaluation.intellectualScore },
            { label: "Humor", val: simulation.evaluation.humorAlignmentScore },
            { label: "Vibe Match", val: simulation.evaluation.vibeMatchScore },
            { label: "Flow & Rhythm", val: simulation.evaluation.conversationalFlowScore },
          ].map((dim, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 mb-1">{dim.label}</div>
              <div className="text-base font-bold font-mono text-slate-100">{dim.val}%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full rounded-full"
                  style={{ width: `${dim.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Narrative & Standout Moments */}
        <div className="space-y-4 text-xs">
          <div>
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
              Narrative Summary
            </h5>
            <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
              {simulation.evaluation.narrativeSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Standout Moments</span>
              </h5>
              <ul className="space-y-1.5">
                {simulation.evaluation.standoutMoments.map((moment, i) => (
                  <li key={i} className="text-slate-300 p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                    • {moment}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Potential Friction Points</span>
              </h5>
              <ul className="space-y-1.5">
                {simulation.evaluation.potentialFrictionPoints.map((point, i) => (
                  <li key={i} className="text-slate-300 p-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
