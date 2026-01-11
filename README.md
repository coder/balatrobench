<div align="center">
  <h1>BalatroBench</h1>
  <p align="center">
    <a href="https://github.com/coder/balatrobench/releases">
      <img alt="GitHub release" src="https://img.shields.io/github/v/release/coder/balatrobench?include_prereleases&sort=semver&style=for-the-badge&logo=github"/>
    </a>
    <a href="https://discord.gg/TPn6FYgGPv">
      <img alt="Discord" src="https://img.shields.io/badge/discord-server?style=for-the-badge&logo=discord&logoColor=%23FFFFFF&color=%235865F2"/>
    </a>
  </p>
  <div><img src="./site/assets/balatrobench.svg" alt="balatrobench" width="170" height="170"></div>
  <p><em>Benchmark LLMs playing Balatro</em></p>
</div>

---

BalatroBench is a benchmark analysis tool and leaderboard for [BalatroLLM](https://github.com/coder/balatrollm) runs. It processes game data and generates interactive leaderboards comparing LLM models and strategies playing [Balatro](https://www.playbalatro.com/).

## 📚 Documentation

### Requirements

- [uv](https://docs.astral.sh/uv/) - Python package manager
- [npm](https://www.npmjs.com/) - Node.js package manager

### Installation

Install Python and npm dependencies:

```bash
make install
source .venv/bin/activate
```

This runs `uv sync` for Python packages and `npm install` for Playwright tests.

For browser binaries (first time only):

```bash
npx playwright install
```

### Generating Benchmarks

Generate benchmark data from BalatroLLM runs:

```bash
# Default: reads from ../balatrollm/runs/v1.0.0, writes to site/benchmarks
uv run balatrobench

# Custom paths
uv run balatrobench --input-dir /path/to/runs/v1.0.0 --output-dir /path/to/output

# Enable WebP conversion for screenshots
uv run balatrobench --webp
```

### Starting the Website

Serve the site locally:

```bash
make serve
```

This will start a local server at [http://localhost:8000](http://localhost:8000) and automatically open it in your browser.

To use local benchmark data, set `environment: 'development'` in `site/config.js`.

### Running Tests

End-to-end tests use Playwright:

```bash
# Run tests headless (default)
npm test

# Run tests with interactive UI
npm run test:ui

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

The test server is automatically started by Playwright (see `playwright.config.js`).

## 🚀 Related Projects

- [**BalatroBot**](https://github.com/coder/balatrobot): API for developing Balatro bots
- [**BalatroLLM**](https://github.com/coder/balatrollm): Play Balatro with LLMs
- [**BalatroBench**](https://github.com/coder/balatrobench): Benchmark LLMs playing Balatro
