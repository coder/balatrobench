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
cd balatrobench-site
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
5. Your site will be available at `https://yourusername.github.io/balatrobench-site`

## 📁 Project Structure

```
├── index.html              # Main page (Official Benchmark)
├── community.html          # Community submissions page
├── submit.html            # Redirects to CONTRIBUTING.md
├── CONTRIBUTING.md         # Detailed submission guidelines
├── js/
│   └── app.js             # JavaScript for data loading
├── data/
│   ├── leaderboard.json   # Official benchmark results
│   └── strategies/        # Community submissions
│       ├── strategy1.json
│       └── strategy2.json
└── README.md
```

## 🏆 Official Benchmark

The official leaderboard tracks performance across standardized seeds and configurations:

- **Balatro Version**: v1.0.1n
- **Seeds**: 100 consistent seeds for reproducibility  
- **Metrics**: Average ante reached, win rate, token efficiency
- **Models**: GPT-4o, Claude-3.5-Sonnet, Gemini-Pro, and more

## 👥 Community Contributions

### Submitting Your Strategy

1. **Fork this repository**
2. **Create a strategy file** in `data/strategies/` following this format:

```json
{
  "title": "Your Strategy Name",
  "author": "YourUsername",
  "model": "GPT-4o",
  "score": "8.5",
  "winRate": "75%",
  "avgTokens": "15000", 
  "date": "2024-01-20",
  "description": "Brief description of your approach",
  "prompt": "Your full system prompt...",
  "methodology": "Detailed explanation...",
  "results": {
    "seeds": [1, 2, 3],
    "scores": [8.2, 8.8, 8.1]
  },
  "tags": ["tag1", "tag2"]
}
```

3. **Submit a Pull Request** with title: "Community Submission: [Your Strategy Name]"

### Strategy Requirements

- ✅ Valid benchmark results on standard seeds
- ✅ Clear strategy description and methodology  
- ✅ Reproducible results
- ✅ Follows JSON schema format
- ✅ No offensive or inappropriate content

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Styling (via CDN)
- **Vanilla JavaScript** - Dynamic content loading
- **Font Awesome** - Icons (via CDN)
- **JSON** - Data storage

## 📊 Data Management

All data is stored in JSON files for simplicity:

- `data/leaderboard.json` - Official benchmark results
- `data/strategies/*.json` - Community submissions

This approach allows for:
- Version control of all data
- Easy community contributions via PRs
- No database setup required
- GitHub Pages compatibility

## 🤝 Contributing

We welcome contributions! You can:

1. **Submit strategies** via pull requests
2. **Report issues** or suggest improvements
3. **Improve the website** (design, features, documentation)

## 📈 Adding New Official Results

To update the official leaderboard:

1. Edit `data/leaderboard.json`
2. Follow the existing schema
3. Submit a pull request

## 🔧 Customization

Want to customize the site?

- **Styling**: Modify Tailwind classes in HTML files
- **Functionality**: Edit `js/app.js` 
- **Data**: Add/modify JSON files in `data/`
- **Pages**: Create new HTML files following the existing pattern

## 📜 License

This project is open source. Feel free to use, modify, and distribute.

## 🙋‍♀️ Support

- Open an issue on GitHub
- Join our Discord community  
- Email: community@balatrobench.dev
