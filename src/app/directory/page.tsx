"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Person } from "@/lib/types";
import { PersonCard } from "@/components/PersonCard";
import { Search, UserPlus, Users, Filter, ShieldCheck } from "lucide-react";

const CATEGORIES = [
  "All",
  "AI & Frontier",
  "Executive Leadership",
  "Robotics & Hardware",
  "Science & Biology",
  "Design & Media",
];

export default function DirectoryPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchPeople() {
      try {
        const res = await fetch("/api/people");
        const json = await res.json();
        if (json.success) {
          setPeople(json.data);
        }
      } catch (err) {
        console.error("Failed to load people directory", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPeople();
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      // Query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.interests.some((i) => i.toLowerCase().includes(q)) ||
        p.hobbies.some((h) => h.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      // Category filter
      if (selectedCategory === "All") return true;
      if (selectedCategory === "AI & Frontier") {
        return (
          p.interests.some((i) => i.toLowerCase().includes("ai") || i.toLowerCase().includes("intelligence") || i.toLowerCase().includes("neural")) ||
          p.role.toLowerCase().includes("ai") ||
          p.headline.toLowerCase().includes("ai")
        );
      }
      if (selectedCategory === "Executive Leadership") {
        return (
          p.role.toLowerCase().includes("ceo") ||
          p.role.toLowerCase().includes("president") ||
          p.role.toLowerCase().includes("founder") ||
          p.role.toLowerCase().includes("chief")
        );
      }
      if (selectedCategory === "Robotics & Hardware") {
        return (
          p.interests.some((i) => i.toLowerCase().includes("robot") || i.toLowerCase().includes("hardware") || i.toLowerCase().includes("gpu") || i.toLowerCase().includes("physics")) ||
          p.hobbies.some((h) => h.toLowerCase().includes("robot") || h.toLowerCase().includes("mechanical"))
        );
      }
      if (selectedCategory === "Science & Biology") {
        return (
          p.interests.some((i) => i.toLowerCase().includes("protein") || i.toLowerCase().includes("genom") || i.toLowerCase().includes("biophysic") || i.toLowerCase().includes("neuro"))
        );
      }
      if (selectedCategory === "Design & Media") {
        return (
          p.interests.some((i) => i.toLowerCase().includes("design") || i.toLowerCase().includes("creator") || i.toLowerCase().includes("podcast") || i.toLowerCase().includes("cinema") || i.toLowerCase().includes("art"))
        );
      }
      return true;
    });
  }, [people, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1E232E]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-serif">
              People Directory
            </h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F3E5AB]">
              {people.length} Real People
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every person has official LinkedIn and Instagram profile links, structured evidence provenance, and a unique agent persona.
          </p>
        </div>

        <Link
          href="/add"
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Real Profile</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, interest (e.g. 'Chess', 'Deep Learning', 'Urdu Poetry')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-[#D4AF37] placeholder:text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#F3E5AB] font-semibold"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Provenance Notice */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredPeople.length} of {people.length} profiles</span>
        <div className="flex items-center gap-1.5 text-[11px] text-[#F3E5AB]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>100% Genuine Identities (No Fabricated Links)</span>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-sm text-slate-400">Loading directory...</div>
      ) : filteredPeople.length === 0 ? (
        <div className="card-luxury rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm">No profiles match &quot;{searchQuery}&quot;.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-3 text-xs text-[#F3E5AB] hover:underline"
          >
            Clear search filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
