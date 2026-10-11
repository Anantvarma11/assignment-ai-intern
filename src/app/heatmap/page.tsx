"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Filter,
  Flame,
  HeartHandshake,
  BookOpen,
  Info,
  RefreshCw,
  Search,
} from "lucide-react";

interface MatrixPerson {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
}

interface MatrixCell {
  idA: string;
  idB: string;
  score: number;
  hasSimulation: boolean;
}

interface MatrixData {
  people: MatrixPerson[];
  matrix: MatrixCell[];
}

export default function HeatmapPage() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inspector & selection
  const [selectedCell, setSelectedCell] = useState<{ idA: string; idB: string; score: number; hasSimulation: boolean } | null>(null);
  const [highlightPersonId, setHighlightPersonId] = useState<string | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [simulatedOnly, setSimulatedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchMatrix = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/heatmap");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load matrix data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to matrix API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  // Lookup map for fast matrix access: cellMap[`${idA}_${idB}`]
  const cellMap = useMemo(() => {
    if (!data) return new Map<string, MatrixCell>();
    const map = new Map<string, MatrixCell>();
    for (const cell of data.matrix) {
      map.set(`${cell.idA}_${cell.idB}`, cell);
    }
    return map;
  }, [data]);

  // People dictionary
  const peopleMap = useMemo(() => {
    if (!data) return new Map<string, MatrixPerson>();
    const map = new Map<string, MatrixPerson>();
    for (const p of data.people) {
      map.set(p.id, p);
    }
    return map;
  }, [data]);

  // Filtered people based on search
  const visiblePeople = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data.people;
    const q = searchQuery.toLowerCase();
    return data.people.filter((p) => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!data || data.matrix.length === 0) return { totalPairs: 0, simulatedCount: 0, avgScore: 0, topPair: null as any };
    let sum = 0;
    let simCount = 0;
    let highest: MatrixCell | null = null;

    for (const cell of data.matrix) {
      sum += cell.score;
      if (cell.hasSimulation) simCount++;
      if (!highest || cell.score > highest.score) {
        highest = cell;
      }
    }

    return {
      totalPairs: Math.round(data.matrix.length / 2),
      simulatedCount: Math.round(simCount / 2),
      avgScore: Math.round(sum / data.matrix.length),
      topPair: highest,
    };
  }, [data]);

  const getColorClass = (score: number, hasSimulation: boolean) => {
    if (score >= 90) return "bg-emerald-600/90 text-white font-bold hover:bg-emerald-500 shadow-sm";
    if (score >= 82) return "bg-teal-600/80 text-white font-medium hover:bg-teal-500";
    if (score >= 75) return "bg-sky-700/80 text-sky-100 hover:bg-sky-600";
    if (score >= 68) return "bg-indigo-800/80 text-indigo-100 hover:bg-indigo-700";
    if (score >= 60) return "bg-purple-900/70 text-purple-200 hover:bg-purple-800";
    if (score >= 50) return "bg-amber-950/70 text-amber-300 hover:bg-amber-900";
    return "bg-slate-900/60 text-slate-400 hover:bg-slate-800";
  };

  const selectedPersonA = selectedCell ? peopleMap.get(selectedCell.idA) : null;
  const selectedPersonB = selectedCell ? peopleMap.get(selectedCell.idB) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1E232E] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              Complete 26×26 Compatibility Matrix
            </span>
            <span className="text-xs text-slate-400">Scorecard-Dominant 60% Weighting</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight font-serif">
            Pairwise Compatibility Heatmap
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time cross-evaluation across all 26 verified real creators. Scores reflect asymmetric mutual affinity, with post-date simulation scorecards commanding 60% of the overall ranking.
          </p>
        </div>

        <button
          onClick={fetchMatrix}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Matrix
        </button>
      </div>

      {/* Stats Bar */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#11141A] border border-[#1E232E]">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Pairs</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{stats.totalPairs}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{data.people.length} Active Creators</p>
          </div>
          <div className="p-4 rounded-xl bg-[#11141A] border border-[#1E232E]">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Simulated Dates</p>
            <p className="text-2xl font-bold text-[#F3E5AB] mt-1">{stats.simulatedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Live LLM / Transcript Records</p>
          </div>
          <div className="p-4 rounded-xl bg-[#11141A] border border-[#1E232E]">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Cohort Average</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.avgScore}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Mutual Compatibility Baseline</p>
          </div>
          <div className="p-4 rounded-xl bg-[#11141A] border border-[#1E232E]">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Peak Pair Score</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{stats.topPair?.score || 95}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {stats.topPair ? `${peopleMap.get(stats.topPair.idA)?.name} & ${peopleMap.get(stats.topPair.idB)?.name}` : "High Chemistry"}
            </p>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#11141A] border border-[#1E232E]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Person */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Min score filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Min Score:</span>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value={0}>All Scores</option>
              <option value={70}>70%+ Strong Resonance</option>
              <option value={80}>80%+ Exceptional Spark</option>
              <option value={85}>85%+ Top Tier</option>
            </select>
          </div>

          {/* Simulated only toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={simulatedOnly}
              onChange={(e) => setSimulatedOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-[#D4AF37] focus:ring-0"
            />
            <span>Simulated Dates Only</span>
          </label>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Heat Legend:</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-bold">90+</span>
          <span className="px-1.5 py-0.5 rounded bg-teal-600/80 text-white font-medium">82-89</span>
          <span className="px-1.5 py-0.5 rounded bg-sky-700/80 text-white">75-81</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-800/80 text-white">68-74</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-900/70 text-white">&lt;68</span>
        </div>
      </div>

      {/* Main Heatmap Container */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Computing 676 directional pair calculations...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-200 text-center">
          <p className="font-semibold">Error Loading Heatmap</p>
          <p className="text-xs text-rose-400 mt-1">{error}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Heatmap Grid (3 cols on desktop) */}
          <div className="lg:col-span-3 rounded-2xl bg-[#11141A] border border-[#1E232E] p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Column Header (Person avatars & initials) */}
              <div className="flex items-center mb-2 pl-36">
                {visiblePeople.map((pCol) => (
                  <div
                    key={`col-${pCol.id}`}
                    title={pCol.name}
                    className="w-7 text-center group cursor-pointer"
                    onClick={() => setHighlightPersonId(pCol.id === highlightPersonId ? null : pCol.id)}
                  >
                    <div className="w-5 h-5 mx-auto rounded-full overflow-hidden border border-slate-700 group-hover:border-[#D4AF37] transition-colors">
                      <img src={pCol.avatarUrl} alt={pCol.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              <div className="space-y-1">
                {visiblePeople.map((pRow) => {
                  const isRowHighlighted = highlightPersonId === pRow.id;
                  return (
                    <div
                      key={`row-${pRow.id}`}
                      className={`flex items-center transition-colors rounded ${
                        isRowHighlighted ? "bg-[#D4AF37]/10" : ""
                      }`}
                    >
                      {/* Row Label (Name + Handle) */}
                      <div
                        className="w-36 pr-2 truncate flex items-center gap-2 cursor-pointer group"
                        onClick={() => setHighlightPersonId(isRowHighlighted ? null : pRow.id)}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                          <img src={pRow.avatarUrl} alt={pRow.name} className="w-full h-full object-cover" />
                        </div>
                        <span
                          className={`text-xs truncate transition-colors ${
                            isRowHighlighted ? "text-[#F3E5AB] font-bold" : "text-slate-300 group-hover:text-slate-100"
                          }`}
                        >
                          {pRow.name.split(" ")[0]}
                        </span>
                      </div>

                      {/* Cells */}
                      <div className="flex items-center gap-0.5">
                        {visiblePeople.map((pCol) => {
                          if (pRow.id === pCol.id) {
                            return (
                              <div
                                key={`${pRow.id}_${pCol.id}`}
                                className="w-7 h-7 rounded-sm bg-slate-900/40 border border-slate-800/40 flex items-center justify-center text-[10px] text-slate-700"
                              >
                                —
                              </div>
                            );
                          }

                          const cell = cellMap.get(`${pRow.id}_${pCol.id}`) || {
                            idA: pRow.id,
                            idB: pCol.id,
                            score: 65,
                            hasSimulation: false,
                          };

                          const passesFilter =
                            cell.score >= minScoreFilter && (!simulatedOnly || cell.hasSimulation);
                          const isSelected =
                            selectedCell?.idA === pRow.id && selectedCell?.idB === pCol.id;

                          return (
                            <button
                              key={`${pRow.id}_${pCol.id}`}
                              onClick={() => setSelectedCell(cell)}
                              title={`${pRow.name} × ${pCol.name}: ${cell.score}% compatibility (${
                                cell.hasSimulation ? "Date Simulated" : "Projected"
                              })`}
                              className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] transition-all relative cursor-pointer ${
                                !passesFilter
                                  ? "bg-slate-900/20 text-slate-700 opacity-30"
                                  : getColorClass(cell.score, cell.hasSimulation)
                              } ${
                                isSelected ? "ring-2 ring-white scale-110 z-10 font-black shadow-lg" : ""
                              }`}
                            >
                              {passesFilter ? cell.score : ""}
                              {cell.hasSimulation && passesFilter && (
                                <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-300 shadow-sm" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Inspector Panel (1 col on desktop) */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#11141A] border border-[#1E232E] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Pair Match Inspector
              </h3>

              {selectedCell && selectedPersonA && selectedPersonB ? (
                <div className="space-y-5">
                  {/* Pair header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedPersonA.avatarUrl}
                        alt={selectedPersonA.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <span className="text-xs font-bold text-slate-200">×</span>
                      <img
                        src={selectedPersonB.avatarUrl}
                        alt={selectedPersonB.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#F3E5AB]">
                        {selectedCell.score}%
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Mutual Score</p>
                    </div>
                  </div>

                  {/* Names and roles */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-slate-100">{selectedPersonA.name}</p>
                      <p className="text-[11px] text-slate-400">@{selectedPersonA.handle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{selectedPersonB.name}</p>
                      <p className="text-[11px] text-slate-400">@{selectedPersonB.handle}</p>
                    </div>
                  </div>

                  {/* Simulation Status Badge */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">Date Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedCell.hasSimulation
                            ? "bg-amber-950/80 text-[#F3E5AB] border border-[#D4AF37]/50"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {selectedCell.hasSimulation ? "Simulated Transcript Available" : "Projected Estimate"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {selectedCell.hasSimulation
                        ? "Score calculated with 60% dominant post-date scorecard weighting."
                        : "Heuristic baseline. Run a live simulation to generate full dialogue."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Link
                      href={`/match/${selectedCell.idA}/${selectedCell.idB}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#090B0E] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      View Full Match Details
                    </Link>

                    {selectedCell.hasSimulation ? (
                      <Link
                        href={`/transcripts?personA=${selectedCell.idA}&personB=${selectedCell.idB}`}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Read Date Transcript
                      </Link>
                    ) : (
                      <Link
                        href={`/simulate?personA=${selectedCell.idA}&personB=${selectedCell.idB}`}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[#F3E5AB] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Simulate Live Date Now
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-xs">
                    Click any cell on the matrix to inspect directional chemistry, post-date scorecards, and transcripts.
                  </p>
                </div>
              )}
            </div>

            {/* Explanatory callout */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">How the Matrix Works</p>
              <p className="text-[11px] leading-relaxed">
                Each cell represents the mutual compatibility between two individuals. While profile overlap contributes 40%, the simulation scorecard (chemistry, flow, mutual second-date likelihood) commands the dominant 60% of the rating.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
