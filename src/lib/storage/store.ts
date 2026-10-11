import fs from "fs";
import path from "path";
import { Person, AgentAnalysis, DatingSimulation, CompatibilityMatch } from "@/lib/types";
import { SEED_PEOPLE } from "@/lib/data/seed-people";
import { PRECOMPUTED_SIMULATIONS } from "@/lib/data/seed-simulations";

export interface DatabaseState {
  people: Record<string, Person>;
  analyses: Record<string, AgentAnalysis>;
  simulations: Record<string, DatingSimulation>;
  matches: Record<string, CompatibilityMatch>;
}

class StorageEngine {
  private state: DatabaseState;
  private filePath: string;
  private initialized: boolean = false;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "pairwise-db.json");
    this.state = {
      people: {},
      analyses: {},
      simulations: {},
      matches: {},
    };
    this.init();
  }

  private init() {
    if (this.initialized) return;

    // Try loading from file
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        this.state = {
          people: parsed.people || {},
          analyses: parsed.analyses || {},
          simulations: parsed.simulations || {},
          matches: parsed.matches || {},
        };
      }
    } catch (err) {
      console.warn("StorageEngine: Could not read local database file, using in-memory state:", err);
    }

    // Seed people if empty or missing seed profiles
    let needsSave = false;
    for (const seed of SEED_PEOPLE) {
      if (!this.state.people[seed.id]) {
        this.state.people[seed.id] = seed;
        needsSave = true;
      }
    }

    // Seed precomputed simulations if missing
    for (const sim of PRECOMPUTED_SIMULATIONS) {
      if (!this.state.simulations[sim.id]) {
        this.state.simulations[sim.id] = sim;
        needsSave = true;
      }
    }

    this.initialized = true;

    if (needsSave) {
      this.persist();
    }
  }

  private persist() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      console.warn("StorageEngine: Note - read-only filesystem or persist error (in-memory mode preserved):", err);
    }
  }

  // People operations
  public getPeople(): Person[] {
    this.init();
    return Object.values(this.state.people);
  }

  public getPersonById(id: string): Person | null {
    this.init();
    return this.state.people[id] || null;
  }

  public savePerson(person: Person): Person {
    this.init();
    const existing = this.state.people[person.id];
    const updated = {
      ...person,
      updatedAt: new Date().toISOString(),
      createdAt: existing ? existing.createdAt : person.createdAt || new Date().toISOString(),
    };
    this.state.people[person.id] = updated;
    this.persist();
    return updated;
  }

  public deletePerson(id: string): boolean {
    this.init();
    if (this.state.people[id]) {
      delete this.state.people[id];
      this.persist();
      return true;
    }
    return false;
  }

  // Analyses operations
  public getAnalysis(personId: string): AgentAnalysis | null {
    this.init();
    return this.state.analyses[personId] || null;
  }

  public saveAnalysis(analysis: AgentAnalysis): AgentAnalysis {
    this.init();
    this.state.analyses[analysis.personId] = analysis;
    this.persist();
    return analysis;
  }

  // Simulations operations
  public getSimulations(): DatingSimulation[] {
    this.init();
    return Object.values(this.state.simulations).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  public getSimulationById(id: string): DatingSimulation | null {
    this.init();
    return this.state.simulations[id] || null;
  }

  public findSimulationForPair(idA: string, idB: string): DatingSimulation | null {
    this.init();
    const all = Object.values(this.state.simulations);
    return (
      all.find(
        (s) =>
          (s.personAId === idA && s.personBId === idB) ||
          (s.personAId === idB && s.personBId === idA)
      ) || null
    );
  }

  public saveSimulation(simulation: DatingSimulation): DatingSimulation {
    this.init();
    this.state.simulations[simulation.id] = simulation;
    this.persist();
    return simulation;
  }

  // Matches operations
  public getMatch(subjectId: string, candidateId: string): CompatibilityMatch | null {
    this.init();
    const key = `${subjectId}:${candidateId}`;
    return this.state.matches[key] || null;
  }

  public saveMatch(match: CompatibilityMatch): CompatibilityMatch {
    this.init();
    const key = `${match.subjectId}:${match.candidateId}`;
    this.state.matches[key] = match;
    this.persist();
    return match;
  }

  public getAllMatchesForSubject(subjectId: string): CompatibilityMatch[] {
    this.init();
    return Object.values(this.state.matches).filter((m) => m.subjectId === subjectId);
  }

  // Reset or clear helper for tests
  public resetToSeeds(): void {
    this.state = {
      people: {},
      analyses: {},
      simulations: {},
      matches: {},
    };
    for (const seed of SEED_PEOPLE) {
      this.state.people[seed.id] = seed;
    }
    this.persist();
  }
}

export const db = new StorageEngine();
