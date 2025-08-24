// Main application JavaScript for BalatroBench

// Global state
let currentVersion = 'v0.2.0';
let currentStrategy = 'default';
let availableVersions = [];
let availableStrategies = [];

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load leaderboard on main page
    if (document.getElementById('leaderboard-body')) {
        initializeLeaderboard();
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

// Initialize leaderboard with dynamic version/strategy discovery
async function initializeLeaderboard() {
    try {
        // Discover available versions and strategies
        await discoverVersionsAndStrategies();
        
        // Setup selectors
        setupSelectors();
        
        // Load initial leaderboard
        await loadLeaderboard();
        
    } catch (error) {
        console.error('Error initializing leaderboard:', error);
        showError('Failed to initialize leaderboard');
    }
}

// Discover available versions and strategies by attempting to fetch data
async function discoverVersionsAndStrategies() {
    const potentialVersions = ['v0.2.0', 'v0.1.0', 'v0.3.0']; // Common versions to try
    const potentialStrategies = ['default', 'aggressive', 'conservative']; // Common strategies to try
    
    availableVersions = [];
    availableStrategies = [];
    
    // Try to find available versions
    for (const version of potentialVersions) {
        try {
            const response = await fetch(`data/benchmarks/${version}/default/leaderboard.json`);
            if (response.ok) {
                availableVersions.push(version);
            }
        } catch (error) {
            // Version doesn't exist, continue
        }
    }
    
    // If no versions found, fallback to current
    if (availableVersions.length === 0) {
        availableVersions = ['v0.2.0'];
    }
    
    // Sort versions (latest first)
    availableVersions.sort((a, b) => b.localeCompare(a));
    currentVersion = availableVersions[0];
    
    // Try to find available strategies for the current version
    for (const strategy of potentialStrategies) {
        try {
            const response = await fetch(`data/benchmarks/${currentVersion}/${strategy}/leaderboard.json`);
            if (response.ok) {
                availableStrategies.push(strategy);
            }
        } catch (error) {
            // Strategy doesn't exist, continue
        }
    }
    
    // If no strategies found, fallback to default
    if (availableStrategies.length === 0) {
        availableStrategies = ['default'];
    }
    
    currentStrategy = availableStrategies.includes('default') ? 'default' : availableStrategies[0];
}

// Setup version and strategy selectors
function setupSelectors() {
    const versionSelector = document.getElementById('version-selector');
    const strategySelector = document.getElementById('strategy-selector');
    
    if (versionSelector) {
        versionSelector.innerHTML = availableVersions.map(version => 
            `<option value="${version}" ${version === currentVersion ? 'selected' : ''}>${version}</option>`
        ).join('');
        
        versionSelector.addEventListener('change', async function() {
            currentVersion = this.value;
            await updateStrategiesForVersion();
            await loadLeaderboard();
        });
    }
    
    if (strategySelector) {
        strategySelector.innerHTML = availableStrategies.map(strategy => 
            `<option value="${strategy}" ${strategy === currentStrategy ? 'selected' : ''}>${strategy}</option>`
        ).join('');
        
        strategySelector.addEventListener('change', async function() {
            currentStrategy = this.value;
            await loadLeaderboard();
        });
    }
}

// Update available strategies when version changes
async function updateStrategiesForVersion() {
    const potentialStrategies = ['default', 'aggressive', 'conservative'];
    const newAvailableStrategies = [];
    
    for (const strategy of potentialStrategies) {
        try {
            const response = await fetch(`data/benchmarks/${currentVersion}/${strategy}/leaderboard.json`);
            if (response.ok) {
                newAvailableStrategies.push(strategy);
            }
        } catch (error) {
            // Strategy doesn't exist for this version
        }
    }
    
    if (newAvailableStrategies.length === 0) {
        newAvailableStrategies.push('default');
    }
    
    availableStrategies = newAvailableStrategies;
    currentStrategy = availableStrategies.includes('default') ? 'default' : availableStrategies[0];
    
    const strategySelector = document.getElementById('strategy-selector');
    if (strategySelector) {
        strategySelector.innerHTML = availableStrategies.map(strategy => 
            `<option value="${strategy}" ${strategy === currentStrategy ? 'selected' : ''}>${strategy}</option>`
        ).join('');
    }
}

// Load and display leaderboard data
async function loadLeaderboard() {
    try {
        const leaderboardResponse = await fetch(`data/benchmarks/${currentVersion}/${currentStrategy}/leaderboard.json`);
        
        if (!leaderboardResponse.ok) {
            throw new Error(`Failed to load leaderboard: ${leaderboardResponse.status}`);
        }
        
        const leaderboardData = await leaderboardResponse.json();
        const leaderboard = leaderboardData.entries;
        
        // Load detailed data for each model
        const detailedEntries = await Promise.all(
            leaderboard.map(async (entry) => {
                try {
                    const modelResponse = await fetch(`data/benchmarks/${currentVersion}/${currentStrategy}/${entry.model}.json`);
                    if (modelResponse.ok) {
                        const modelData = await modelResponse.json();
                        return { ...entry, detailedData: modelData };
                    }
                } catch (error) {
                    console.warn(`Failed to load detailed data for ${entry.model}:`, error);
                }
                return entry;
            })
        );
        
        renderLeaderboard(detailedEntries, leaderboardData);
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('Error loading leaderboard data');
    }
}

// Render the leaderboard table
function renderLeaderboard(entries, metadata) {
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    
    tbody.innerHTML = entries.map((entry, index) => `
        <tr class="hover:bg-gray-700 transition-colors cursor-pointer" onclick="toggleStats(${index})">
            <td class="px-1 py-2 text-center">
                <span class="text-sm sm:text-xs lg:text-sm font-bold ${getRankColor(entry.rank)}">#${entry.rank}</span>
            </td>
            <td class="px-1 py-2">
                <div class="overflow-hidden min-w-0">
                    <div class="font-medium text-white text-sm sm:text-xs lg:text-sm truncate" title="${entry.model}">${entry.model}</div>
                    <div class="text-xs sm:text-xs lg:text-sm text-gray-400 hidden sm:block">${entry.total_runs} runs</div>
                </div>
            </td>
            <td class="px-1 py-2">
                <div class="text-sm sm:text-xs lg:text-sm font-bold text-white">${entry.avg_final_ante}</div>
                <div class="text-xs sm:text-xs lg:text-sm text-gray-400 hidden sm:block">${entry.performance_score.toFixed(1)}</div>
            </td>
            <td class="px-1 py-2">
                <div class="font-medium text-white text-sm sm:text-xs lg:text-sm">${(entry.win_rate * 100).toFixed(0)}%</div>
                <div class="text-xs sm:text-xs lg:text-sm text-gray-400 hidden sm:block">${(entry.completion_rate * 100).toFixed(0)}%</div>
            </td>
            <td class="px-1 py-2 hidden sm:table-cell">
                <div class="font-medium text-white text-sm sm:text-xs lg:text-sm">${entry.detailedData ? (entry.detailedData.llm_metrics.avg_total_tokens / 1000).toFixed(0) + 'k' : 'N/A'}</div>
                <div class="text-xs sm:text-xs lg:text-sm text-gray-400">${entry.detailedData ? (entry.detailedData.llm_metrics.avg_tokens_per_request / 1000).toFixed(1) + 'k/req' : ''}</div>
            </td>
            <td class="px-1 py-2 hidden lg:table-cell">
                <div class="font-medium text-white text-sm sm:text-xs lg:text-sm">${entry.efficiency_rating}</div>
                <div class="text-xs sm:text-xs lg:text-sm text-gray-400">${entry.detailedData ? (entry.detailedData.efficiency_metrics.tokens_per_ante / 1000).toFixed(0) + 'k/ante' : ''}</div>
            </td>
            <td class="px-1 py-2">
                <div class="text-white text-sm sm:text-xs lg:text-sm">${entry.performance_score.toFixed(1)}</div>
            </td>
        </tr>
        <tr id="stats-row-${index}" class="hidden">
            <td colspan="7" class="px-1 py-4 bg-gray-800">
                ${renderDetailedStats(entry, index)}
            </td>
        </tr>
    `).join('');
    
    // Update stats cards
    updateStatsCards(entries, metadata);
}

// Render detailed statistics for a model
function renderDetailedStats(entry, index) {
    if (!entry.detailedData) {
        return '<div class="text-gray-400">Detailed data not available</div>';
    }
    
    const data = entry.detailedData;
    
    return `
        <div class="px-2 sm:px-4 w-full overflow-hidden">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 text-sm sm:text-sm lg:text-sm w-full">
            <div class="bg-gray-700 rounded-lg p-3 sm:p-4 min-w-0">
                <h4 class="font-semibold text-white mb-1.5 sm:mb-2 text-sm sm:text-base lg:text-base">Performance Metrics</h4>
                <div class="space-y-1.5 sm:space-y-2 text-gray-300 text-sm sm:text-sm lg:text-sm">
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Avg Final Ante:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.performance_metrics.avg_final_ante}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Avg Final Money:</span>
                        <span class="text-white font-medium flex-shrink-0">$${data.performance_metrics.avg_final_money}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Avg Peak Money:</span>
                        <span class="text-white font-medium flex-shrink-0">$${data.performance_metrics.avg_peak_money}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Avg Duration:</span>
                        <span class="text-white font-medium flex-shrink-0">${(data.performance_metrics.avg_duration_seconds / 60).toFixed(1)}m</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Performance Score:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.summary.performance_score.toFixed(1)}</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-700 rounded-lg p-3 sm:p-4 min-w-0">
                <h4 class="font-semibold text-white mb-1.5 sm:mb-2 text-sm sm:text-base lg:text-base">LLM Metrics</h4>
                <div class="space-y-1.5 sm:space-y-2 text-gray-300 text-sm sm:text-sm lg:text-sm">
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Success Rate:</span>
                        <span class="text-white font-medium flex-shrink-0">${(data.llm_metrics.avg_success_rate * 100).toFixed(1)}%</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Avg Response Time:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.llm_metrics.avg_response_time.toFixed(2)}s</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Total Tokens:</span>
                        <span class="text-white font-medium flex-shrink-0">${(data.llm_metrics.avg_total_tokens / 1000).toFixed(0)}k</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Tokens/Request:</span>
                        <span class="text-white font-medium flex-shrink-0">${(data.llm_metrics.avg_tokens_per_request / 1000).toFixed(1)}k</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Parsing Errors:</span>
                        <span class="text-white font-medium flex-shrink-0">${(data.llm_metrics.avg_parsing_error_rate * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-700 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1 min-w-0">
                <h4 class="font-semibold text-white mb-1.5 sm:mb-2 text-sm sm:text-base lg:text-base">Strategy Metrics</h4>
                <div class="space-y-1.5 sm:space-y-2 text-gray-300 text-sm sm:text-sm lg:text-sm">
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Shop Purchases:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.strategy_metrics.avg_shop_purchases.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Jokers Acquired:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.strategy_metrics.avg_jokers_acquired.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Consumables Used:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.strategy_metrics.avg_consumables_used.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Blinds Skipped:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.strategy_metrics.avg_blinds_skipped.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center min-w-0">
                        <span class="truncate mr-2">Efficiency Rating:</span>
                        <span class="text-white font-medium flex-shrink-0">${data.summary.efficiency_rating}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-4 sm:mt-6">
            <h4 class="font-semibold text-white mb-2 sm:mb-3 text-base sm:text-base lg:text-lg">Individual Runs</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 max-h-48 sm:max-h-64 overflow-y-auto">
                ${data.individual_runs.map((run, runIndex) => `
                    <div class="rounded p-2 sm:p-3 ${run.won ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-red-900/30 border-l-4 border-red-500'} min-w-0">
                        <div class="flex justify-between items-start mb-1.5 sm:mb-2 min-w-0">
                            <div class="text-sm sm:text-sm lg:text-sm min-w-0 flex-1">
                                <div class="text-white font-medium">Run ${runIndex + 1}</div>
                                <div class="text-gray-300 text-xs sm:text-sm truncate" title="Seed: ${run.seed} | Deck: ${run.deck}">
                                    ${run.seed} | ${run.deck}
                                </div>
                            </div>
                            <div class="text-right ml-2 flex-shrink-0">
                                <div class="text-white text-sm sm:text-sm lg:text-sm font-medium">
                                    Ante ${run.final_ante} ${run.won ? 'Win' : 'Loss'}
                                </div>
                                <div class="text-gray-300 text-xs sm:text-sm">${(run.duration_seconds / 60).toFixed(1)}m</div>
                            </div>
                        </div>
                        <div class="text-xs sm:text-sm text-gray-300 space-y-1">
                            <div class="truncate" title="Money: $${run.final_money} (Peak: $${run.peak_money})">
                                Money: $${run.final_money} (Peak: $${run.peak_money})
                            </div>
                            <div class="truncate" title="Tokens: ${run.total_tokens.toLocaleString()}">
                                Tokens: ${(run.total_tokens / 1000).toFixed(0)}k
                            </div>
                            <div class="truncate" title="Success Rate: ${(run.success_rate * 100).toFixed(0)}%">
                                Success: ${(run.success_rate * 100).toFixed(0)}%
                            </div>
                            <div class="truncate" title="Errors: ${run.parsing_errors + run.timeout_errors}">
                                Errors: ${run.parsing_errors + run.timeout_errors}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        </div>
    `;
}

// Update stats cards with aggregated data
function updateStatsCards(entries, metadata) {
    // Update version - removed to prevent unwanted title changes
    // The version is already displayed in the selector dropdown
    
    // Update total runs
    const totalRuns = metadata.total_runs_analyzed;
    const totalRunsElement = document.getElementById('total-runs');
    if (totalRunsElement) {
        totalRunsElement.textContent = totalRuns.toLocaleString();
    }
    
    // Update average runtime
    const avgRuntime = entries.reduce((sum, entry) => {
        if (entry.detailedData) {
            return sum + (entry.detailedData.performance_metrics.avg_duration_seconds / 60);
        }
        return sum;
    }, 0) / entries.filter(e => e.detailedData).length;
    
    const avgRuntimeElement = document.querySelector('.text-purple-400');
    if (avgRuntimeElement && !isNaN(avgRuntime)) {
        avgRuntimeElement.textContent = `${avgRuntime.toFixed(1)} min`;
    }
    
    // Update unique seeds
    const uniqueSeeds = new Set();
    entries.forEach(entry => {
        if (entry.detailedData && entry.detailedData.individual_runs) {
            entry.detailedData.individual_runs.forEach(run => uniqueSeeds.add(run.seed));
        }
    });
    
    const uniqueSeedsElement = document.getElementById('unique-seeds');
    if (uniqueSeedsElement) {
        uniqueSeedsElement.textContent = uniqueSeeds.size.toString();
    }
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('leaderboard-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-1 py-4 text-center text-gray-400 text-base sm:text-sm lg:text-base">${message}</td></tr>`;
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

// Toggle statistics display for a model
function toggleStats(index) {
    const statsRow = document.getElementById(`stats-row-${index}`);
    
    if (statsRow) {
        if (statsRow.classList.contains('hidden')) {
            statsRow.classList.remove('hidden');
        } else {
            statsRow.classList.add('hidden');
        }
    }
}

// Toggle detailed run information (placeholder for future expansion)
function toggleRunDetails(index) {
    console.log(`Clicked on row ${index} for detailed information`);
}

// Load community strategies (legacy function for community page)
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
                if (response.ok) {
                    const strategy = await response.json();
                    strategies.push(strategy);
                }
            } catch (error) {
                console.warn(`Failed to load strategy: ${file}`, error);
            }
        }
        
        // Sort by score (descending)
        strategies.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        
        const container = document.getElementById('community-submissions');
        if (!container) return;
        
        if (strategies.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-8">No community strategies available yet</div>';
            return;
        }
        
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

// Strategy interaction functions (legacy for community page)
function showStrategyDetails(title) {
    alert(`Strategy details for: ${title}\n\nThis would open a detailed view with full methodology, prompt, and results.`);
}

function voteStrategy(title) {
    alert(`Voted for strategy: ${title}\n\nIn a real implementation, this would update the vote count via API.`);
}

function tryStrategy(title) {
    alert(`Trying strategy: ${title}\n\nThis would redirect to a page where you can test the strategy.`);
}

// Export functions for global access
window.BalatroBench = {
    loadLeaderboard,
    loadCommunityStrategies,
    showStrategyDetails,
    voteStrategy,
    tryStrategy,
    toggleStats,
    toggleRunDetails,
    initializeLeaderboard
};