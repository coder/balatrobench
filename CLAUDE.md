# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BalatroBench is a static web application that displays performance leaderboards for LLMs playing the card game Balatro. It's a frontend-only project without build tools - the site uses vanilla JavaScript with Tailwind CSS loaded from CDN.

## Architecture

### Core Components

- **index.html**: Main leaderboard page with responsive table layout using Tailwind CSS
- **script.js**: Fetches and renders leaderboard data from JSON files in the data directory
- **data/**: Contains benchmark results organized by version and strategy
  - `data/benchmarks/v0.8.0/default/leaderboard.json`: Primary leaderboard data
  - Individual model result files in vendor subdirectories (e.g., `openai/gpt-oss-120b.json`)

### Data Structure

The leaderboard displays AI model performance with metrics including:
- Final round reached (with standard deviation)
- Success/failure/error rates for API calls
- Token usage (input/output)
- Execution time and cost per game
- Multiple provider usage statistics

Models are identified by `vendor/model` format and ranked by performance metrics.

## Development Commands

### Local Development

```bash
# Serve the application locally (Python 3)
python3 -m http.server 8000

# Then visit http://localhost:8000
```

### File Structure Conventions

- All files use UTF-8 encoding with LF line endings
- JavaScript: 2-space indentation, 100 character line limit
- HTML: 2-space indentation, 120 character line limit
- JSON: 2-space indentation

## Data Management

### Adding New Results

- Leaderboard data is loaded from `data/benchmarks/v0.8.0/default/leaderboard.json`
- Individual model results stored in `data/benchmarks/v0.8.0/default/[vendor]/[model].json`
- The application automatically parses `vendor/model` from the `config.model` field

### Result Format

Each entry contains:
- Run statistics (runs, wins, completion rate)
- Performance averages and standard deviations
- API call success metrics
- Provider usage breakdown
- Token usage and cost analysis

## Community Contributions

The project accepts AI strategy submissions through a community form process. Contributors develop strategies using the `balatrollm` framework, test locally, then submit via web form for automated server validation and leaderboard inclusion.

## Static Hosting

This is a pure client-side application requiring no backend server - suitable for deployment to static hosting services like GitHub Pages, Netlify, or Vercel.
