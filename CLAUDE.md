# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BalatroBench is a static web application that displays performance leaderboards for LLMs playing the card game Balatro. It's a frontend-only project without build tools - the site uses vanilla JavaScript with Tailwind CSS and Chart.js loaded from CDN.

## Architecture

### Core Components

- **index.html**: Main leaderboard page with responsive table layout using Tailwind CSS
- **community.html**: Community strategy leaderboard page with similar layout and functionality
- **about.html**: About page with project information and metrics documentation
- **script.js**: Shared JavaScript for all pages - fetches and renders leaderboard data, with interactive expandable rows showing detailed charts and statistics
- **data/**: Contains benchmark results organized by version, strategy, and data type
  - `data/benchmarks/v0.8.0/default/leaderboard.json`: Primary model leaderboard data
  - `data/community/v0.8.0/default/leaderboard.json`: Community strategy leaderboard data
  - Individual model result files in vendor subdirectories (e.g., `openai/gpt-oss-120b.json`)

### Data Structure

The leaderboard displays AI model performance with metrics including:
- Final round reached (with standard deviation)
- Success/failure/error rates for API calls
- Token usage (input/output with standard deviations)
- Execution time and cost per game (with standard deviations)
- Provider usage distribution
- Detailed per-game statistics and histograms

Models are identified by `vendor/model` format and ranked by performance metrics.

### Interactive Features

- **Navigation**: Top navigation bar with links between main leaderboard, community, and about pages
- **Expandable Rows**: Click on desktop (lg+) to expand detailed view with:
  - Round distribution histogram using Chart.js
  - Provider usage pie chart
  - Complete per-game statistics table
  - Total aggregated metrics (tokens, costs, time)
- **Responsive Design**: Columns hide/show based on screen size
- **Dual Display Modes**: Support for both model-based and community strategy leaderboards

## Development Commands

### Local Development

```bash
# Serve the application locally (Python 3)
python3 -m http.server 8000

# Then visit http://localhost:8000
```

### Dependencies

- **Tailwind CSS**: Styling framework loaded from CDN
- **Chart.js**: Charting library for histograms and pie charts
- **Heroicons**: Icon library (included but minimal usage in current implementation)

### File Structure Conventions

- All files use UTF-8 encoding with LF line endings
- JavaScript: 2-space indentation, 100 character line limit
- HTML: 2-space indentation, 120 character line limit
- JSON: 2-space indentation

## Data Management

### Data Organization

**Benchmark Data** (`data/benchmarks/v0.8.0/default/`):
- `leaderboard.json`: Aggregated model performance data
- `[vendor]/[model].json`: Detailed individual model results with per-game statistics

**Community Data** (`data/community/v0.8.0/default/`):
- `leaderboard.json`: Community strategy performance data
- `[vendor]/[model].json`: Detailed strategy results

### Result Format

**Leaderboard entries** contain:
- Model/strategy configuration and metadata
- Aggregated performance averages and standard deviations
- API call success/failure/error rates
- Token usage and cost summaries

**Detailed model files** contain:
- Individual game statistics (`stats` array)
- Provider usage distribution (`providers` object)
- Total aggregated metrics (`total` object)
- Per-game breakdowns including final round, token usage, timing, and costs

## Community Contributions

The project accepts AI strategy submissions through a community form process. Contributors develop strategies using the `balatrollm` framework, test locally, then submit via web form for automated server validation and leaderboard inclusion.

## Site Structure

The application consists of three main pages:

1. **Main Leaderboard** (`index.html`): Primary model performance rankings
2. **Community** (`community.html`): Community-submitted strategy rankings  
3. **About** (`about.html`): Project information and metrics documentation

All pages share the same navigation structure and use the same `script.js` for functionality.

## Static Hosting

This is a pure client-side application requiring no backend server - suitable for deployment to static hosting services like GitHub Pages, Netlify, or Vercel.
