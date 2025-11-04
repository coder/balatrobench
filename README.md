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

______________________________________________________________________

## Quick Start

To run this project locally:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000)

### Local Data

To test with local benchmark data, symlink the `balatrobot/benchmarks` directory:

```bash
ln -s ../balatrobot/benchmarks benchmarks
```

Then in `config.js`, comment/uncomment to switch environment to `development`.

## Testing

The project includes end-to-end tests using Playwright. Make sure the local server is running before executing tests.

### Running Tests

```bash
# Install dependencies (first time only)
npm install

# Run tests headless (default)
npm test

# Run tests with interactive UI
npx playwright test --ui

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug
```
