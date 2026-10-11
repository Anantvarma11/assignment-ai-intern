"use client";

import React from "react";
import Link from "next/link";
import { Person } from "@/lib/types";
import { ExternalLink, ShieldCheck, HeartHandshake, User, Trophy, Sparkles, AlertCircle } from "lucide-react";

interface PersonCardProps {
  person: Person;
  onSimulate?: (person: Person) => void;
}

export function PersonCard({ person, onSimulate }: PersonCardProps) {
  const confidencePercent = Math.round(person.confidenceScore * 100);

  return (
    <div className="card-luxury rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-[#D4AF37]/5 hover:-translate-y-0.5">
      <div>
        {/* Header: Avatar, Name, Verified Badges */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="w-14 h-14 rounded-xl object-cover border border-[#1E232E] group-hover:border-[#D4AF37]/40 transition-colors"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              }}
            />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#090B0E]">
              <div
                className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090B0E]"
                title="Verified Real Identity"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-100 truncate group-hover:text-[#F3E5AB] transition-colors">
                {person.name}
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            </div>

            <p className="text-xs text-slate-300 font-medium truncate">{person.role}</p>
            <p className="text-[11px] text-slate-400 truncate">{person.company} • {person.location}</p>
          </div>
        </div>

        {/* Verified Links */}
        <div className="flex items-center gap-2 mb-3.5 text-[11px]">
          <a
            href={person.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0077B5]/10 border border-[#0077B5]/30 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors"
          >
            <span>LinkedIn</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href={person.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E1306C]/10 border border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/20 transition-colors"
          >
            <span>Instagram</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
            <span className="font-mono text-slate-300">{confidencePercent}%</span>
            <span>evidence</span>
          </div>
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {person.summary}
        </p>

        {/* Interests & Hobbies Tags */}
        <div className="space-y-1.5 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {person.interests.slice(0, 3).map((interest, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {person.hobbies.slice(0, 2).map((hobby, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#F3E5AB]/90 font-medium"
              >
                ☕ {hobby}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-[#1E232E] flex items-center gap-2">
        <Link
          href={`/person/${person.id}`}
          className="flex-1 text-center py-2 px-2.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <User className="w-3 h-3 text-slate-400" />
          <span>Profile</span>
        </Link>

        <Link
          href={`/agent/${person.id}`}
          className="flex-1 text-center py-2 px-2.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[#F3E5AB] transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>Agent</span>
        </Link>

        <Link
          href={`/simulate?subject=${person.id}`}
          className="py-2 px-3 rounded-lg text-xs font-semibold gold-button flex items-center justify-center gap-1"
          title="Start Dating Simulation"
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Date</span>
        </Link>

        <Link
          href={`/rankings?subject=${person.id}`}
          className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          title="View Personalized Compatibility Rankings"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </div>
    </div>
  );
}
