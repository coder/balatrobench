# BalatroBench

A community-driven benchmark platform for evaluating Large Language Models' strategic performance in Balatro through intelligent tool-calling and decision-making.

## 🎯 What is BalatroBench?

BalatroBench provides a standardized way to evaluate how well different AI models can play Balatro, the popular poker-inspired roguelike card game. The benchmark tests strategic thinking, decision-making, and tool-calling capabilities across different LLM models.

## 🚀 Quick Start

This is a **static website** that works with any web server or GitHub Pages. No build process required!

### Local Development

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd balatrobench
```

2. Serve the files locally:
```bash
# Using Python (recommended)
python -m http.server 8000

# Using Node.js (if you have it)
npx serve .

# Using any other static file server
```

3. Open http://localhost:8000 in your browser

### GitHub Pages Deployment

1. Push your changes to the `main` branch
2. Go to repository Settings > Pages
3. Set source to "Deploy from a branch" 
4. Select `main` branch and `/ (root)` folder
5. Your site will be available at `https://yourusername.github.io/balatrobench`

## 📁 Project Structure

```
├── index.html              # Main page (Official Benchmark)
├── community.html          # Community submissions page
├── about.html             # About page with detailed information
├── submit.html            # Redirects to CONTRIBUTING.md
├── CONTRIBUTING.md         # Detailed submission guidelines
├── js/
│   └── app.js             # JavaScript for data loading and UI
├── scripts/
│   ├── process-benchmarks.js  # Benchmark data processor
│   └── analyze-benchmarks.js  # Benchmark analysis tool
├── data/
│   ├── benchmarks/        # Raw benchmark data by version
│   │   └── v0.2.0/
│   │       └── default/
│   │           ├── leaderboard.json      # Processed leaderboard
│   │           ├── cerebras-*.json       # Individual benchmark runs
│   │           └── ...
│   ├── strategies/        # Strategy templates and tools
│   │   └── default/
│   │       ├── TOOLS.json               # Available game tools
│   │       ├── STRATEGY.md.jinja        # Strategy template
│   │       ├── MEMORY.md.jinja          # Memory template
│   │       └── GAMESTATE.md.jinja       # Game state template
│   └── leaderboard.json   # Main leaderboard (auto-generated)
├── public/                # Static assets
└── README.md
```

## 🏆 Official Benchmark

The official leaderboard tracks performance across standardized seeds and configurations:

- **Balatro Version**: v1.0.1n
- **Framework**: BalatroLLM v0.2.0+
- **Strategy**: Template-based strategic prompting system
- **Seeds**: Consistent seeds for reproducibility  
- **Metrics**: Average ante reached, win rate, token efficiency, completion rate
- **Models**: Cerebras GPT-OSS-120B, Cerebras Qwen3-235B, and more

## 👥 Community Contributions

### Submitting Your Results

There are two ways to contribute:

#### Option 1: Submit Raw Benchmark Data (Recommended)

1. **Run benchmarks** using the BalatroLLM framework
2. **Add your results** to `data/benchmarks/v{version}/{strategy}/`
   - Include the complete `{model}_benchmark.json` files
   - These contain full game progression, LLM interactions, and tool calls
3. **Process the data** using `node scripts/process-benchmarks.js`
4. **Submit a Pull Request** with both raw data and updated leaderboard

#### Option 2: Submit Strategy Documentation

1. **Fork this repository**
2. **Create strategy templates** in `data/strategies/{your-strategy}/`
   - Copy the structure from `data/strategies/default/`
   - Customize the Jinja2 templates for your approach
3. **Document your methodology** with clear explanations
4. **Submit a Pull Request** with title: "Strategy Contribution: [Your Strategy Name]"

### Submission Requirements

- ✅ Valid benchmark results from BalatroLLM v0.2.0+
- ✅ Complete game progression data (not just summary statistics)
- ✅ Clear strategy description and methodology  
- ✅ Reproducible results with seed consistency
- ✅ No offensive or inappropriate content

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Styling (via CDN)
- **Vanilla JavaScript** - Dynamic content loading
- **Node.js** - Benchmark processing scripts
- **Jinja2 Templates** - Strategy prompt templating
- **Font Awesome** - Icons (via CDN)
- **JSON** - Data storage and interchange

## 📊 Data Management

BalatroBench uses a sophisticated data management system:

### Raw Benchmark Data
- `data/benchmarks/v{version}/{strategy}/` - Versioned benchmark results
- Individual files: `{model}_benchmark.json` - Complete run data with game progression, LLM interactions, and tool calls
- Structured by version and strategy for historical tracking

### Processed Data
- `data/leaderboard.json` - Auto-generated leaderboard from all benchmark data
- Aggregated statistics: performance scores, win rates, token efficiency
- Generated by `scripts/process-benchmarks.js`

### Strategy System
- `data/strategies/default/` - Template-based strategy system
- Jinja2 templates for consistent prompting across models
- Tool definitions and game state templates

### Processing Pipeline
```bash
# Process raw benchmark data into leaderboard
node scripts/process-benchmarks.js

# Alternative analysis tool
node scripts/analyze-benchmarks.js
```

This approach provides:
- Version control of all data and results
- Automated leaderboard generation
- Historical benchmark tracking
- Reproducible evaluation methodology
- No database setup required

## 🤝 Contributing

We welcome contributions! You can:

1. **Submit strategies** via pull requests
2. **Report issues** or suggest improvements
3. **Improve the website** (design, features, documentation)

## 📈 Adding New Official Results

To add new benchmark results:

### Adding Raw Benchmark Data

1. **Add benchmark files** to `data/benchmarks/v{version}/{strategy}/`
   - Use format: `{model}_benchmark.json`
   - Include complete run data from BalatroLLM framework

2. **Process the data** to update leaderboards:
   ```bash
   node scripts/process-benchmarks.js
   ```

3. **Submit a pull request** with both raw data and updated leaderboard

### Data Processing Tools

The project includes two processing scripts:

- **`process-benchmarks.js`** - Primary tool for generating leaderboards from benchmark data
- **`analyze-benchmarks.js`** - Alternative analysis tool with different aggregation methods

Both scripts automatically scan the `data/benchmarks/` directory and process all available benchmark files.

## 🔧 Development & Customization

### Local Development Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd balatrobench

# Install Node.js dependencies (for processing scripts)
# No package.json yet - scripts use built-in Node.js modules

# Serve the website locally
python -m http.server 8000
# or: npx serve .
```

### Customization Options

- **Styling**: Modify Tailwind classes in HTML files
- **Functionality**: Edit `js/app.js` for frontend behavior
- **Data Processing**: Customize `scripts/process-benchmarks.js`
- **Strategy Templates**: Add new templates in `data/strategies/`
- **Pages**: Create new HTML files following the existing pattern

### Processing Scripts

- **Process benchmarks**: `node scripts/process-benchmarks.js`
- **Alternative analysis**: `node scripts/analyze-benchmarks.js`
- Both scripts output to `data/leaderboard.json`

## 📜 License

This project is open source. Feel free to use, modify, and distribute.

## 🙋‍♀️ Support

- Open an issue on GitHub
- Join our Discord community  
- Email: community@balatrobench.dev
