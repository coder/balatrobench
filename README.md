<div align="center">
  <h1>BalatroBench</h1>
  <p align="center">
    <a href="https://discord.gg/TPn6FYgGPv">
      <img alt="Discord" src="https://img.shields.io/badge/discord-server?style=for-the-badge&logo=discord&logoColor=%23FFFFFF&color=%235865F2"/>
    </a>
  </p>
  <div>
    <img width="1024" alt="Screenshot: BalatroBench" src="https://github.com/user-attachments/assets/33a52df0-a7f8-4784-a640-0212267ed199" />
  </div>
  <br>
  <p><em>Benchmark LLMs' strategic performance in Balatro</em></p>
</div>

---

## Quick Start

To run this project locally:

```bash
# Serve from site/ directory
python3 -m http.server 8000 --directory site
```

Then visit [http://localhost:8000](http://localhost:8000)

### Local Data

Generate benchmark data from BalatroLLM runs:

```bash
# Generate benchmark data (requires ../balatrollm/runs symlinked or present)
uv run balatrobench --input-dir runs/v1.0.0
```

Then in `site/config.js`, set `environment: 'development'` to use local data.

## Testing

The project includes end-to-end tests using Playwright.

### Running Tests

```bash
# Install dependencies (first time only)
npm install
npx playwright install  # Install browser binaries

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

## Upload to CDN

This project make use of BunnyCDN for hosting static assets in benchmarks directory. If you have access to the CDN, you can upload the data with

```
uv run upload.py
```
