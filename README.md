# PAIRWISE AI — LLM-Powered Agentic Dating Platform

> **Grounded, explainable agentic dating simulations, individual profile analysis, and hybrid compatibility intelligence.**

Pairwise AI transforms verified professional and personal profiles into autonomous conversational agents. Rather than relying on superficial questionnaires or hallucinated preferences, each person is represented by an agent grounded strictly in verified public evidence (official LinkedIn & public Instagram profiles). Agents engage in genuine multi-turn dating simulations to measure conversational rhythm, intellectual alignment, humor chemistry, and life compatibility.

---

## Key Features

1. **25 Real People Supported**
   - Curated dataset of 26 real prominent technologists, researchers, and creators (e.g. Satya Nadella, Jensen Huang, Dr. Fei-Fei Li, Demis Hassabis, Mira Murati, Sam Altman, Yann LeCun, Andrej Karpathy, Simone Giertz, Melanie Perkins).
   - Each profile contains official LinkedIn and public Instagram URLs, verified provenance audit trails, confidence scores, and missing-information indicators.
   - Strict adherence to public evidence: no sensitive attribute inference, no invented romantic claims.

2. **Provider Abstraction Architecture**
   - **Cerebras (Preferred)**: Cloud inference via `llama-3.3-70b` with structured output parsing, explicit timeouts, and bounded retries.
   - **OpenRouter (Secondary)**: Fallback LLM gateway supporting open models.
   - **Deterministic Fallback Engine (Guaranteed)**: Offline-safe heuristic engine that analyzes real profile signals, orchestrates grounded multi-turn dates, and scores compatibility without requiring live API keys.
   - **Provider Diagnostics**: Live status badge in the UI displaying active provider, model name, and fallback status. Zero fabricated model claims.

3. **Isolated Agent Runtime**
   - Shared runtime instantiating a unique persona for each individual.
   - Untrusted Data Isolation: treats counterparty statements as conversational text rather than instructions, preventing prompt injection.
   - Models distinct cognitive styles, conversational tone, and dating priority matrices (must-haves, dealbreakers, flexibilities).

4. **Genuine Dating Simulations**
   - Orchestrates multi-turn dates (4–8 alternating turns) at curated settings (*The Conservatory at Blue Bottle*, *SFMOMA Sculpture Terrace*, *The Battery Library Lounge*).
   - Records turn-by-turn dialogue, emotional vibe signals, and internal agent reflections.
   - Computes multi-dimensional evaluations: Chemistry, Intellectual alignment, Humor alignment, Vibe match, Conversational flow, Standout moments, and Potential friction points.
   - Cached in persistence layer to avoid redundant inference calls.

5. **Explainable Hybrid Matching & Rankings**
   - Directional compatibility computed separately for Person A → Person B and Person B → Person A.
   - Mutual compatibility synthesized using a balanced harmonic mean with missing-data penalties.
   - Measurable deterministic signals: Shared interests (25%), Shared hobbies (15%), Lifestyle & ambition alignment (20%), Preference fulfillment (20%), Simulation interaction (20%).
   - Grounded evidence citations for every score and ethical disclaimers.

6. **Refined Editorial Dark Interface**
   - High-contrast obsidian dark palette (`#090B0E`) with warm gold accents (`#D4AF37`, `#F3E5AB`).
   - Nine complete, fully interactive screens: Dashboard, People Directory, Add-Person Workflow, Individual Profile, Agent Analysis, Dating Simulation Theater, Simulation Transcripts Archive, Personalized Rankings, and Match Detail & Evidence.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Validation**: Zod
- **Persistence**: High-performance local JSON / in-memory storage engine (`data/pairwise-db.json`) compatible with serverless runtimes
- **Testing**: Vitest (10 test suites, 35 unit & integration tests)

---

## Getting Started

### Prerequisites

- Node.js >= 20.18.0
- npm >= 10.8.0

### Installation

```bash
git clone https://github.com/Anantvarma11/assignment-ai-intern.git
cd assignment-ai-intern
npm install
```

### Environment Configuration (Optional)

Pairwise AI operates automatically out-of-the-box using the profile-grounded **Deterministic Engine**. To enable live cloud LLM inference:

```bash
# Create .env.local
CEREBRAS_API_KEY="csk-..."
OPENROUTER_API_KEY="sk-or-..."
```

*(API keys can also be configured interactively via the in-app Provider Settings modal, which stores keys in server memory without saving them to Git).*

### Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Running Automated Tests

```bash
npm run test
```

Executes the complete Vitest test suite covering URL schemas, profile normalization, provider fallback, agent runtime differentiation, simulation generation, transcript caching, compatibility scoring, ranking generation, edge cases, and end-to-end integration.

### Production Build

```bash
npm run build
npm run start
```

---

## Test Coverage Summary

- `seed-data.test.ts`: Verifies all 25+ seed people validate strictly against `PersonSchema` with official LinkedIn & Instagram URLs.
- `url-validation.test.ts`: Tests LinkedIn and Instagram URL validation regexes and protocols.
- `profile-normalization.test.ts`: Tests structured normalization, provenance creation, and missing information penalties.
- `provider-fallback.test.ts`: Tests provider cascade (Cerebras → OpenRouter → Deterministic), classified error codes (`AUTH_ERROR`, `TIMEOUT`), and fallback guarantees.
- `agent-runtime.test.ts`: Tests persona differentiation, untrusted data isolation, and directional candidate evaluation.
- `simulation.test.ts`: Tests multi-turn date orchestration, turn alternation, transcript recording, and caching.
- `matching-scoring.test.ts`: Tests directional scores, harmonic mutual mean, missing data penalty, and ethics disclaimer.
- `rankings.test.ts`: Tests descending ranking generation across candidates with evidence generation.
- `edge-cases.test.ts`: Tests duplicate record handling, invalid inputs, and storage mutations.
- `integration-e2e.test.ts`: Complete end-to-end integration test: Profile Ingestion → Agent Creation → Date Simulation → Stored Result → Compatibility Score → Personalized Ranking.

---

## Ethical Disclaimer

Algorithmic compatibility metrics generated by Pairwise AI are exploratory conversational and lifestyle alignment indicators derived from public profile evidence and agent simulations. They do not constitute scientific predictions of interpersonal or romantic success.
