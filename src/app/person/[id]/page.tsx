"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Person } from "@/lib/types";
import {
  ShieldCheck,
  ExternalLink,
  Sparkles,
  HeartHandshake,
  Trophy,
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  Compass,
} from "lucide-react";

function IndividualProfileContent() {
  const params = useParams();
  const id = params?.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPerson() {
      if (!id) return;
      try {
        const res = await fetch(`/api/people/${id}`);
        const json = await res.json();
        if (json.success) {
          setPerson(json.data);
        } else {
          setError(json.error || "Profile not found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPerson();
  }, [id]);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading profile data...</div>;
  }

  if (error || !person) {
    return (
      <div className="card-luxury rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Profile Not Found</h2>
        <p className="text-xs text-slate-400">{error || "The requested individual could not be located."}</p>
        <Link
          href="/directory"
          className="inline-block mt-4 text-xs font-semibold text-[#F3E5AB] hover:underline"
        >
          Return to People Directory
        </Link>
      </div>
    );
  }

  const confidencePercent = Math.round(person.confidenceScore * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to People Directory</span>
      </Link>

      {/* Hero Profile Header */}
      <div className="card-luxury rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#11141A] via-[#0E1117] to-[#0A0D12] border-[#D4AF37]/30">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              }}
            />
            <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-[#090B0E]">
              <div
                className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090B0E]"
                title="Verified Public Profile"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-serif">
                {person.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Verified Real Identity</span>
              </span>
            </div>

            <p className="text-sm font-semibold text-[#F3E5AB]/90">{person.role}</p>
            <p className="text-xs text-slate-400 mt-0.5">{person.company} • {person.location}</p>

            {/* Official URLs */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={person.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0077B5]/15 border border-[#0077B5]/40 text-[#0077B5] hover:bg-[#0077B5]/25 transition-colors"
              >
                <span>Official LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={person.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#E1306C]/15 border border-[#E1306C]/40 text-[#E1306C] hover:bg-[#E1306C]/25 transition-colors"
              >
                <span>Public Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto font-mono">
                <span>Confidence:</span>
                <span className="text-[#F3E5AB] font-bold">{confidencePercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="mt-6 pt-6 border-t border-[#1E232E] flex flex-wrap items-center gap-3">
          <Link
            href={`/agent/${person.id}`}
            className="flex-1 min-w-[140px] text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/25 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Agent Persona Analysis</span>
          </Link>

          <Link
            href={`/simulate?subject=${person.id}`}
            className="flex-1 min-w-[140px] text-center py-2.5 px-4 rounded-xl text-xs font-bold gold-button flex items-center justify-center gap-2 shadow-lg"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Simulate Dating Interaction</span>
          </Link>

          <Link
            href={`/rankings?subject=${person.id}`}
            className="flex-1 min-w-[140px] text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Personalized Rankings</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Bio, Interests, Hobbies, Preferences */}
        <div className="md:col-span-2 space-y-6">
          {/* Summary */}
          <div className="card-luxury rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3">
              Profile Summary & Philosophy
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {person.summary}
            </p>
          </div>

          {/* Interests & Hobbies */}
          <div className="card-luxury rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Core Intellectual Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {person.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Leisure Pursuits & Hobbies
              </h3>
              <div className="flex flex-wrap gap-2">
                {person.hobbies.map((hobby, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB]"
                  >
                    ☕ {hobby}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Explicit Preferences */}
          <div className="card-luxury rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3">
              Explicit Stated Preferences
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5">Communication Style</span>
                <span className="text-slate-200 font-medium">{person.explicitPreferences.communicationStyle}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5">Core Lifestyle Values</span>
                <span className="text-slate-200 font-medium">
                  {person.explicitPreferences.lifestyleValues.join(" • ")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30">
                <span className="text-rose-400 block text-[11px] mb-0.5 font-semibold">Dealbreakers</span>
                <span className="text-rose-200 font-medium">
                  {person.explicitPreferences.dealbreakers.join(" • ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Compatibility Signals, Missing Info, Provenance */}
        <div className="space-y-6">
          {/* Compatibility Signals */}
          <div className="card-luxury rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Compatibility Signals
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Social Battery</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {person.compatibilitySignals.socialBattery}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Spontaneity Level</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {person.compatibilitySignals.spontaneityLevel}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Ambition Parity</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {person.compatibilitySignals.ambitionAlignment}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Relationship Intent</span>
                <span className="font-semibold text-[#F3E5AB] capitalize">
                  {person.explicitPreferences.relationshipIntent}
                </span>
              </div>
            </div>
          </div>

          {/* Missing Info & Uncertainty */}
          <div className="card-luxury rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Uncertainty & Gaps Notice
            </h3>
            {person.missingInformation.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-300">
                {person.missingInformation.map((info, i) => (
                  <li key={i} className="text-amber-300/90 flex items-center gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No major preference gaps detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Provenance Audit Trail */}
      <div className="card-luxury rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-slate-100">Data Provenance Audit Log</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Explicit tracking of information origin (LinkedIn vs Instagram vs User Input)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Source Channel</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-3">Evidence Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {person.provenance.map((item, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{item.field}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-mono text-[#F3E5AB]">
                    {item.source}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.verified
                          ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.verified ? "Verified" : "User Input"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                    {item.evidenceText || "Grounded public reference"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function IndividualProfilePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading profile data...</div>}>
      <IndividualProfileContent />
    </Suspense>
  );
}
