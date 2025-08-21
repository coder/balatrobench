# Contributing to BalatroBench

Welcome to the BalatroBench community! We're excited to see your custom strategies and approaches to playing Balatro with AI. This guide will walk you through the process of submitting your own strategy to our community leaderboard.

## 🚀 Quick Submission Guide

Contributing to BalatroBench is simple and follows a standard GitHub workflow:

1. **Fork & Clone** - Fork the repository and clone it to your local machine
2. **Create JSON** - Add your strategy as a JSON file in the `data/strategies/` folder
3. **Submit PR** - Create a pull request with your strategy data

## 📋 Detailed Instructions

### Step 1: Fork the Repository

Start by forking the BalatroBench repository on GitHub, then clone it locally:

```bash
git clone https://github.com/YOUR_USERNAME/balatrobench.git
cd balatrobench
```

### Step 2: Create Your Strategy File

Create a new JSON file in the `data/strategies/` folder with a descriptive filename (e.g., `your-strategy-name.json`).

#### Required JSON Schema

Your strategy file must follow this exact structure:

```json
{
  "title": "Your Strategy Name",
  "author": "YourUsername",
  "model": "GPT-4o / Claude-3.5-Sonnet / etc",
  "score": "8.5",
  "winRate": "75%",
  "avgTokens": "15000",
  "date": "2024-01-20",
  "description": "Brief description of your strategy",
  "prompt": "Your full system prompt here...",
  "methodology": "Explanation of your approach",
  "results": {
    "seeds": [1, 2, 3, ...],
    "scores": [8.2, 8.8, 8.1, ...]
  }
}
```

#### Field Descriptions

- **title**: A clear, descriptive name for your strategy
- **author**: Your GitHub username or preferred name
- **model**: The AI model used (e.g., "GPT-4o", "Claude-3.5-Sonnet", "Gemini-Pro")
- **score**: Average ante reached as a string (e.g., "8.5")
- **winRate**: Percentage of games won as a string (e.g., "75%")
- **avgTokens**: Average tokens used per game as a string (e.g., "15000")
- **date**: Submission date in YYYY-MM-DD format
- **description**: Brief summary of your strategy approach (1-2 sentences)
- **prompt**: Your complete system prompt used for the AI
- **methodology**: Detailed explanation of your approach, testing process, and any insights
- **results**: Object containing arrays of test seeds and corresponding scores

### Step 3: Submit Pull Request

Once your strategy file is ready:

1. Add and commit your changes:
```bash
git add data/strategies/your-strategy-name.json
git commit -m "Add [Your Strategy Name] community submission"
git push origin main
```

2. Create a pull request on GitHub with the title: **"Community Submission: [Your Strategy Name]"**

3. In the PR description, include:
   - Brief overview of your strategy
   - Any notable insights or discoveries
   - Confirmation that results are reproducible

## ✅ Submission Requirements

Before submitting, ensure your strategy meets these requirements:

- ✅ **Valid benchmark results** on standard seeds
- ✅ **Clear strategy description** and detailed methodology
- ✅ **JSON file follows the required schema** exactly
- ✅ **Results are reproducible** by others
- ✅ **No offensive or inappropriate content** in any fields
- ✅ **Unique strategy name** not already used in the repository
- ✅ **Complete prompt included** for transparency

## 📊 Testing Your Strategy

To ensure quality submissions, your strategy should be tested against:

- **Standard Seeds**: Use consistent seeds for reproducible results
- **Multiple Runs**: Test across various seeds to get reliable averages  
- **Documentation**: Record your testing methodology and any variations

### Recommended Testing Process

1. Run your strategy on at least 10-20 different seeds
2. Record the ante reached for each game
3. Calculate win rate and average performance
4. Document any interesting patterns or insights
5. Ensure results can be reproduced by others

## 📥 Strategy Template

Use this template to get started quickly:

```json
{
  "title": "Your Strategy Name",
  "author": "YourUsername", 
  "model": "Model Name (e.g., GPT-4o)",
  "score": "0.0",
  "winRate": "0%",
  "avgTokens": "0",
  "date": "2024-01-20",
  "description": "Brief description of your strategy approach",
  "prompt": "Your full system prompt here...",
  "methodology": "Detailed explanation of your methodology",
  "results": {
    "seeds": [],
    "scores": [],
    "notes": "Any additional notes about the results"
  }
}
```

## 🔍 Review Process

All community submissions go through a review process:

1. **Automated checks** for JSON validity and schema compliance
2. **Manual review** for content quality and appropriateness
3. **Result verification** when possible
4. **Feedback and iteration** if changes are needed

We aim to review submissions within 1-2 weeks of submission.

## 🏷️ Strategy Categories

Consider tagging your strategy with relevant approaches:

- **Aggressive**: High-risk, high-reward strategies
- **Conservative**: Safe, consistent gameplay approaches
- **Synergy-focused**: Strategies emphasizing joker combinations
- **Economic**: Money and shop management focused
- **Meta-exploitation**: Strategies targeting specific game mechanics
- **Experimental**: Novel or unconventional approaches

## 🎯 Tips for Success

- **Be specific**: Detailed descriptions help others understand your approach
- **Show your work**: Include methodology and testing process
- **Be transparent**: Share your complete prompt for reproducibility  
- **Document insights**: Include any interesting discoveries or patterns
- **Test thoroughly**: Ensure your results are consistent and reproducible

## 🤝 Community Guidelines

- Be respectful and constructive in discussions
- Share knowledge and insights with others
- Credit inspiration from other strategies when applicable
- Focus on improving AI performance in Balatro
- Help review and test other community submissions

## ❓ Need Help?

If you have questions about the submission process:

- **GitHub Issues**: Open an issue in the repository for technical problems
- **Discussions**: Use GitHub Discussions for strategy questions and community chat
- **Discord**: Join our Discord community for real-time discussions
- **Email**: Reach out to community@balatrobench.dev for direct support

## 📜 Code of Conduct

By participating in BalatroBench, you agree to:

- Provide accurate and honest results
- Respect other contributors and their work
- Use appropriate and professional language
- Focus discussions on strategy and performance improvement
- Follow GitHub's Terms of Service and Community Guidelines

Thank you for contributing to BalatroBench! We look forward to seeing your innovative approaches to AI-powered Balatro gameplay.