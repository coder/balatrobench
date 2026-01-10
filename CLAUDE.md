# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**GitHub Repository**: [`coder/balatrobench`](https://github.com/coder/balatrobench)

## Overview

BalatroBench is a benchmark analysis tool for BalatroLLM runs. It processes run data from `balatrollm` and generates structured benchmark results for leaderboards comparing models and strategies.

**Key capabilities:**

- Analyze BalatroLLM runs and compute aggregated statistics
- Generate model leaderboards (comparing models using same strategy)
- Generate strategy leaderboards (comparing strategies for same model)
- Extract per-request data (prompts, reasoning, tool calls, metadata)
- Optional PNG to WebP screenshot conversion

### Make Commands

Available make targets:

| Target           | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `make help`      | Show all available targets                              |
| `make lint`      | Run ruff linter (check only)                            |
| `make format`    | Run ruff and mdformat formatters                        |
| `make typecheck` | Run type checker                                        |
| `make quality`   | Run all code quality checks (lint + typecheck + format) |
| `make install`   | Install dependencies                                    |

**Important rules:**

1. **Only run make commands when explicitly asked.** Do not proactively run `make quality`, `make lint`, etc.
2. **Never run bare linting/formatting/typechecking tools.** Always use make targets instead:
   - Use `make lint` instead of `ruff check`
   - Use `make format` instead of `ruff format`
   - Use `make typecheck` instead of `ty check`
   - Use `make quality` for all checks combined

## Architecture

### Python Components (`src/balatrobench/`)

The package is structured as a pipeline: CLI → Analyzer → Writer.

#### CLI (`cli.py`)

Entry point for the `balatrobench` command. Parses input/output directories, infers version from path. Orchestrates analysis for both models and strategies views, generates manifests.

```bash
# Default: reads from ../balatrollm/runs/v1.0.0, writes to site/benchmarks
balatrobench

# Custom paths
balatrobench --input-dir /path/to/runs/v1.0.0 --output-dir /path/to/output

# Enable WebP conversion
balatrobench --webp
```

#### Analyzer (`analyzer.py`)

Core analysis engine. Reads BalatroLLM run directories, aggregates statistics across runs, creates leaderboard entries.

**Two analysis modes:**

- `analyze_models()`: Group runs by strategy, compare models
- `analyze_strategies()`: Group runs by model, compare strategies

Computes: run counts, win rates, round averages/std, token usage, timing, costs.

#### Writer (`writer.py`)

File I/O for benchmark output. Writes JSON files for manifests, leaderboards, runs, and per-request data. Handles PNG→WebP conversion using `cwebp`.

#### Extractor (`extractor.py`)

Parses BalatroLLM JSONL files (`requests.jsonl`, `responses.jsonl`). Extracts:

- Request content: strategy, gamestate, memory prompts
- Response data: reasoning, tool calls
- Metadata: provider, tokens, timing, cost

#### Models (`models.py`)

Output dataclasses for benchmark files. Defines the schema for all generated JSON.

#### Source (`source.py`)

TypedDicts for reading BalatroLLM source files (`task.json`, `strategy.json`, `stats.json`).

#### Enums (`enums.py`)

Balatro game enums: `Deck` (15 types) and `Stake` (8 difficulty levels).

### Relationship with BalatroLLM

**BalatroLLM** runs games and writes data to `runs/`. **BalatroBench** reads that data and generates benchmark output.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BalatroLLM (Input)                           │
│  runs/v1.0.0/{strategy}/{vendor}/{model}/{run_id}/              │
│    ├── task.json, strategy.json, stats.json                     │
│    ├── requests.jsonl, responses.jsonl                          │
│    └── screenshots/                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ balatrobench
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BalatroBench (Output)                         │
│  site/benchmarks/                                               │
│    ├── models/{version}/{strategy}/leaderboard.json             │
│    └── strategies/{version}/{vendor}/{model}/leaderboard.json   │
└─────────────────────────────────────────────────────────────────┘
```

## Output Structure

```
site/benchmarks/
├── models/                                    # Compare MODELS (same strategy)
│   ├── manifest.json
│   └── {version}/{strategy}/
│       ├── leaderboard.json                   # ModelsLeaderboard
│       └── {vendor}/{model}.json              # Runs
│           └── {run_id}/{request_id}/
│               ├── metadata.json              # Request metadata
│               ├── tool_call.json             # LLM tool calls
│               ├── reasoning.md               # LLM reasoning
│               ├── strategy.md, gamestate.md, memory.md
│               └── screenshot.webp
│
└── strategies/                                # Compare STRATEGIES (same model)
    ├── manifest.json
    └── {version}/{vendor}/{model}/
        ├── leaderboard.json                   # StrategiesLeaderboard
        └── {strategy}/runs.json               # Runs
```

## Key Files

### Python

| File                            | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `src/balatrobench/cli.py`       | CLI entry point and argument parsing    |
| `src/balatrobench/analyzer.py`  | Run analysis and statistics aggregation |
| `src/balatrobench/writer.py`    | JSON file output and WebP conversion    |
| `src/balatrobench/extractor.py` | JSONL parsing for requests/responses    |
| `src/balatrobench/models.py`    | Output dataclasses (schema definitions) |
| `src/balatrobench/source.py`    | Input TypedDicts for BalatroLLM files   |
| `src/balatrobench/enums.py`     | Deck and Stake enums                    |

### Configuration

| File             | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `pyproject.toml` | Python dependencies and tool configuration |
| `Makefile`       | Development commands                       |

## Data Models

### Leaderboard Entry

```json
{
  "run_count": 5,
  "run_wins": 0,
  "run_completed": 3,
  "avg_round": 9.0,
  "std_round": 2.5,
  "stats": {
    "calls_total": 386,
    "calls_success": 373,
    "calls_error": 8,
    "calls_failed": 5,
    "tokens_in_total": 5563840,
    "tokens_in_avg": 14414.09,
    "tokens_in_std": 551.59,
    "cost_total": 4.76,
    "cost_avg": 0.012
  },
  "model": { "vendor": "google", "name": "gemini-3-flash-preview" }
}
```

### Run

```json
{
  "id": "20260109_165752_516_RED_WHITE_AAAAAAA",
  "model": { "vendor": "openai", "name": "gpt-oss-120b" },
  "strategy": { "name": "Default", "version": "1.0.0" },
  "config": { "seed": "AAAAAAA", "deck": "RED", "stake": "WHITE" },
  "run_won": false,
  "run_completed": true,
  "final_ante": 4,
  "final_round": 10,
  "providers": { "Groq": 69, "Clarifai": 18 },
  "stats": { ... }
}
```

### Request Metadata

```json
{
  "id": "request-00031",
  "status": "success",
  "provider": "Google",
  "tokens_in": 14374,
  "tokens_out": 1584,
  "time_ms": 12435,
  "cost_in": 0.007187,
  "cost_out": 0.004752,
  "cost_total": 0.011939
}
```
