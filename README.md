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

> [!NOTE]
> You can download all the data for `runs` and `benchmarks` from the [kaggle](https://www.kaggle.com/datasets/s1m0n38/balatrobench).

## 🚀 Related Projects

- [**BalatroBot**](https://github.com/coder/balatrobot): API for developing Balatro bots
- [**BalatroLLM**](https://github.com/coder/balatrollm): Play Balatro with LLMs
- [**BalatroBench**](https://github.com/coder/balatrobench): Benchmark LLMs playing Balatro

## 📚 Documentation

> [!IMPORTANT]
> This is the documentation for analyzing `runs` artifacts produced by [BalatroLLM](https://github.com/coder/balatrollm). This project parses the data and displays it as a website.

### Requirements

- [uv](https://docs.astral.sh/uv/) - Python package manager (installation steps below)
- [Node.js](https://nodejs.org/) - JavaScript runtime (includes npm) required just for Playwright tests

### Installation

Follow these steps to set up BalatroBench:

1. **Install uv**

    Install the [uv](https://docs.astral.sh/uv/) Python package manager:

    ```bash
    # macOS/Linux
    curl -LsSf https://astral.sh/uv/install.sh | sh

    # Windows
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    ```

    See the [uv installation docs](https://docs.astral.sh/uv/getting-started/installation/) for more options.

2. **Clone the repository**

    ```bash
    git clone https://github.com/coder/balatrobench.git
    cd balatrobench
    ```

3. **Configure environment variables**

    Copy the example environment file and fill in your values:

    ```bash
    cp .envrc.example .envrc
    ```

    Edit `.envrc` and set the following variables (required for uploading benchmarks to CDN):

    - `BUNNY_BASE_URL` - BunnyCDN base URL
    - `BUNNY_STORAGE_ZONE` - Storage zone name
    - `BUNNY_API_KEY` - API key for authentication

4. **Install dependencies**

    ```bash
    make install
    ```

    This runs `uv sync` for Python packages and `npm install` for Playwright tests.

5. **Activate the environment**

    ```bash
    source .envrc
    ```

    Alternatively, use [direnv](https://direnv.net/) to automatically load the environment:

    ```bash
    # Install direnv, then allow the directory
    direnv allow
    ```

6. **Install browser binaries (first time only)**

    ```bash
    npx playwright install chromium
    ```

### Generating Benchmarks

Generate benchmark data from BalatroLLM runs:

```bash
# Analyze runs from a specific directory
balatrobench --input-dir /path/to/runs/v1.0.0

# Custom output directory
balatrobench --input-dir /path/to/runs/v1.0.0 --output-dir /path/to/output

# Enable WebP conversion for screenshots
balatrobench --input-dir /path/to/runs/v1.0.0 --webp
```

### Starting the Website

Serve the site locally:

```bash
make serve
```

This will start a local server at [http://localhost:8000](http://localhost:8000) and automatically open it in your browser.

The environment is automatically detected (localhost = development, otherwise = production).
To override, use the query parameter: `?env=development` or `?env=production`.

### Running Tests

End-to-end tests use Playwright and `balatrobench` tests:

```bash
make test
```

> [!NOTE]
> Although `playwright.config.js` includes webServer configuration, the server may not auto-start reliably. If tests fail to connect, manually start the server first:

```bash
make serve  # In a separate terminal
make test   # Run tests
```
