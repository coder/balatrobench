// Main application JavaScript for BalatroBench

// Load and display leaderboard data
async function loadLeaderboard() {
    try {
        const response = await fetch('data/leaderboard.json');
        const leaderboard = await response.json();
        
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;
        
        tbody.innerHTML = leaderboard.map(entry => `
            <tr class="hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <span class="text-lg font-bold ${getRankColor(entry.rank)}">#${entry.rank}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div>
                        <div class="font-medium text-white">${entry.model}</div>
                        <div class="text-sm text-gray-400">${entry.provider}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-lg font-bold text-white">${entry.avgAnte}</div>
                    <div class="text-sm text-gray-400">Best: ${entry.bestRun}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-white">${entry.winRate}</div>
                    <div class="text-sm text-gray-400">${entry.runs} runs</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-white">${entry.tokensPerRun.toLocaleString()}</div>
                    <div class="text-sm text-gray-400">Efficiency: ${entry.efficiency}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-white">${formatDate(entry.lastUpdated)}</div>
                    <div class="text-sm text-gray-400">${entry.version}</div>
                </td>
            </tr>
        `).join('');
        
        // Update total runs stat
        const totalRuns = leaderboard.reduce((sum, entry) => sum + entry.runs, 0);
        const totalRunsElement = document.getElementById('total-runs');
        if (totalRunsElement) {
            totalRunsElement.textContent = totalRuns.toLocaleString();
        }
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        const tbody = document.getElementById('leaderboard-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-400">Error loading leaderboard data</td></tr>';
        }
    }
}

// Load community strategies
async function loadCommunityStrategies() {
    try {
        // Since we can't easily list directory contents in a static site,
        // we'll maintain a list of known strategy files
        const strategyFiles = [
            'aggressive-joker-synergy.json',
            'conservative-money-management.json', 
            'high-card-meta-exploitation.json'
        ];
        
        const strategies = [];
        
        for (const file of strategyFiles) {
            try {
                const response = await fetch(`data/strategies/${file}`);
                const strategy = await response.json();
                strategies.push(strategy);
            } catch (error) {
                console.warn(`Failed to load strategy: ${file}`, error);
            }
        }
        
        // Sort by score (descending)
        strategies.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        
        const container = document.getElementById('community-submissions');
        if (!container) return;
        
        container.innerHTML = strategies.map(strategy => `
            <div class="bg-gray-800 rounded-lg border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-white mb-2">${strategy.title}</h3>
                            <div class="flex items-center gap-4 text-sm text-gray-400">
                                <span>by ${strategy.author}</span>
                                <span class="bg-gray-700 px-2 py-1 rounded text-xs">${strategy.model}</span>
                                <span>${formatDate(strategy.date)}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                ${strategy.score} Ante
                            </div>
                            <div class="text-sm text-gray-400">
                                ${strategy.votes} votes • ${strategy.winRate} win rate
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-300 mb-4">${strategy.description}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${strategy.tags ? strategy.tags.map(tag => 
                            `<span class="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">${tag}</span>`
                        ).join('') : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                                onclick="showStrategyDetails('${strategy.title}')">
                            View Details
                        </button>
                        <button class="text-gray-400 hover:text-green-400 px-3 py-1 text-sm transition-colors"
                                onclick="voteStrategy('${strategy.title}')">
                            <i class="fas fa-arrow-up"></i> Upvote
                        </button>
                        <button class="text-gray-400 hover:text-blue-400 px-3 py-1 text-sm transition-colors"
                                onclick="tryStrategy('${strategy.title}')">
                            Try Strategy
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading community strategies:', error);
        const container = document.getElementById('community-submissions');
        if (container) {
            container.innerHTML = '<div class="text-center text-gray-400 py-8">Error loading community strategies</div>';
        }
    }
}

// Utility functions
function getRankColor(rank) {
    switch(rank) {
        case 1: return 'text-yellow-400'; // Gold
        case 2: return 'text-gray-300';   // Silver
        case 3: return 'text-orange-400'; // Bronze
        default: return 'text-gray-400';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Strategy interaction functions
function showStrategyDetails(title) {
    alert(`Strategy details for: ${title}\n\nThis would open a detailed view with full methodology, prompt, and results.`);
}

function voteStrategy(title) {
    alert(`Voted for strategy: ${title}\n\nIn a real implementation, this would update the vote count via API.`);
}

function tryStrategy(title) {
    alert(`Trying strategy: ${title}\n\nThis would redirect to a page where you can test the strategy.`);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load leaderboard on main page
    if (document.getElementById('leaderboard-body')) {
        loadLeaderboard();
    }
    
    // Load community strategies on community page
    if (document.getElementById('community-submissions')) {
        loadCommunityStrategies();
    }
    
    // Add mobile menu toggle functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Export functions for global access
window.BalatroBench = {
    loadLeaderboard,
    loadCommunityStrategies,
    showStrategyDetails,
    voteStrategy,
    tryStrategy
};