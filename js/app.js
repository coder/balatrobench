// Main application JavaScript for BalatroBench

// Global state
const currentVersion = 'v0.6.0';
const currentStrategy = 'default';

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

// Initialize leaderboard
async function initializeLeaderboard() {
  try {
    // Load leaderboard directly
    await loadLeaderboard();

  } catch (error) {
    console.error('Error initializing leaderboard:', error);
    showError('Failed to initialize leaderboard');
  }
}


// Load and display leaderboard data
async function loadLeaderboard() {
  try {
    const leaderboardResponse = await fetch(
      `data/benchmarks/${currentVersion}/${currentStrategy}/leaderboard.json`);

    if (!leaderboardResponse.ok) {
      throw new Error(`Failed to load leaderboard: ${leaderboardResponse.status}`);
    }

    const leaderboardData = await leaderboardResponse.json();
    const leaderboard = leaderboardData.entries;

    // Use the leaderboard data directly - detailed data is already included
    const detailedEntries = leaderboard;

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

  tbody.innerHTML = entries.map((entry, index) => {
    const modelParts = entry.config.model.split('/');
    const provider = modelParts[0] || '';
    const modelName = modelParts.slice(1).join('/') || entry.config.model;

    const stats = entry.averaged_stats;

    // Calculate total tool calls for fractions
    const totalToolCalls = stats.avg_successful_calls + stats.avg_error_calls + stats
      .avg_failed_calls;
    const totalTokens = stats.avg_total_input_tokens + stats.avg_total_output_tokens;

    return `
        <tr class="hover:bg-gray-700 transition-colors cursor-pointer" onclick="loadModelDetails('${entry.config.model}', ${index})">
            <td class="px-2 py-3 text-center">
                <span class="text-xs sm:text-sm font-bold ${getRankColor(entry.rank)}">#${entry.rank}</span>
            </td>
            <td class="px-2 py-3 min-w-32 max-w-48">
                <div class="overflow-hidden">
                    <div class="font-medium text-white text-xs sm:text-sm break-words" title="${modelName}">${modelName}</div>
                    <div class="text-xs text-gray-400 mt-0.5">
                        <span class="md:hidden">${stats.avg_ante_reached} ante • ${entry.total_runs} runs</span>
                        <span class="hidden md:inline">${entry.total_runs} runs</span>
                    </div>
                </div>
            </td>
            <td class="px-2 py-3">
                <div class="text-xs sm:text-sm font-medium text-gray-300 capitalize">${provider}</div>
            </td>
            <td class="px-2 py-3">
                <div class="text-xs sm:text-sm font-bold text-white">${stats.avg_final_round}</div>
            </td>
            <td class="px-2 py-3 hidden md:table-cell">
                <div class="text-xs sm:text-sm font-bold text-white">${stats.avg_ante_reached}<span class="text-gray-500">/8</span></div>
            </td>
            <td class="px-2 py-3 hidden md:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${entry.completed_runs}<span class="text-gray-500">/${entry.total_runs}</span></div>
            </td>
            <td class="px-2 py-3 hidden lg:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${stats.avg_successful_calls.toFixed(1)}<span class="text-gray-500">/${totalToolCalls.toFixed(1)}</span></div>
            </td>
            <td class="px-2 py-3 hidden lg:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${stats.avg_error_calls.toFixed(1)}<span class="text-gray-500">/${totalToolCalls.toFixed(1)}</span></div>
            </td>
            <td class="px-2 py-3 hidden lg:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${stats.avg_failed_calls.toFixed(1)}<span class="text-gray-500">/${totalToolCalls.toFixed(1)}</span></div>
            </td>
            <td class="px-2 py-3 hidden xl:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${(stats.avg_total_input_tokens / 1000).toFixed(1)}<span class="text-gray-500">/${(totalTokens / 1000).toFixed(1)}</span></div>
            </td>
            <td class="px-2 py-3 hidden xl:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${(stats.avg_total_output_tokens / 1000).toFixed(1)}<span class="text-gray-500">/${(totalTokens / 1000).toFixed(1)}</span></div>
            </td>
            <td class="px-2 py-3 hidden lg:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${(stats.avg_total_response_time_ms / 1000).toFixed(1)}</div>
            </td>
            <td class="px-2 py-3 hidden lg:table-cell">
                <div class="font-medium text-white text-xs sm:text-sm">${(stats.avg_total_response_time_ms / totalToolCalls / 1000).toFixed(2)}</div>
            </td>
        </tr>
        <tr id="stats-row-${index}" class="hidden">
            <td colspan="13" class="px-2 py-4 bg-gray-800">
                <!-- Details will be loaded dynamically -->
            </td>
        </tr>
        `;
  }).join('');

  // Update stats cards
  updateStatsCards(entries, metadata);
}

// Render individual runs table for details view (without rank, model, provider columns)
function renderIndividualRunsDetailTable(runs) {
  return `
        <table class="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
                <tr class="bg-gray-500 text-left text-xs sm:text-sm">
                    <th class="px-2 py-3 text-center font-medium text-gray-300">Run</th>
                    <th class="px-2 py-3 text-center font-medium text-gray-300">Completed</th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300">Rounds</th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden md:table-cell">Ante</th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden lg:table-cell">
                        <div class="flex items-center gap-1">Success
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
                                <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                            </svg>
                        </div>
                    </th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden lg:table-cell">
                        <div class="flex items-center gap-1">Error
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
                                <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                            </svg>
                        </div>
                    </th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden lg:table-cell">
                        <div class="flex items-center gap-1">Failed
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
                                <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                            </svg>
                        </div>
                    </th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden xl:table-cell">In Tok. (k)</th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden xl:table-cell">Out Tok. (k)</th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden lg:table-cell">
                        <div class="flex items-center gap-1">Tot.
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
                            </svg> (s)
                        </div>
                    </th>
                    <th class="px-2 py-3 text-left font-medium text-gray-300 hidden lg:table-cell">
                        <div class="flex items-center gap-1">Avg
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
                            </svg> (s)
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
                ${runs.map((run, runIndex) => {
                    const totalToolCalls = run.successful_calls + (run.error_calls?.length || 0) + (run.failed_calls?.length || 0);
                    const totalTokens = run.total_input_tokens + run.total_output_tokens;

                    return `
                    <tr class="hover:bg-gray-500 transition-colors">
                        <td class="px-2 py-3 text-center">
                            <span class="text-xs sm:text-sm font-bold text-white">#${runIndex + 1}</span>
                        </td>
                        <td class="px-2 py-3 text-center">
                            ${run.completed ?
                                '<span class="text-green-400 text-lg">✓</span>' :
                                '<span class="text-red-400 text-lg">✗</span>'
                            }
                        </td>
                        <td class="px-2 py-3">
                            <div class="text-xs sm:text-sm font-bold ${run.run_won ? 'text-green-400' : 'text-white'}">${run.final_round}</div>
                        </td>
                        <td class="px-2 py-3 hidden md:table-cell">
                            <div class="text-xs sm:text-sm font-bold text-white">${run.ante_reached}<span class="text-gray-500">/8</span></div>
                        </td>
                        <td class="px-2 py-3 hidden lg:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${run.successful_calls}<span class="text-gray-500">/${totalToolCalls}</span></div>
                        </td>
                        <td class="px-2 py-3 hidden lg:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${run.error_calls?.length || 0}<span class="text-gray-500">/${totalToolCalls}</span></div>
                        </td>
                        <td class="px-2 py-3 hidden lg:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${run.failed_calls?.length || 0}<span class="text-gray-500">/${totalToolCalls}</span></div>
                        </td>
                        <td class="px-2 py-3 hidden xl:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${(run.total_input_tokens / 1000).toFixed(1)}<span class="text-gray-500">/${(totalTokens / 1000).toFixed(1)}</span></div>
                        </td>
                        <td class="px-2 py-3 hidden xl:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${(run.total_output_tokens / 1000).toFixed(1)}<span class="text-gray-500">/${(totalTokens / 1000).toFixed(1)}</span></div>
                        </td>
                        <td class="px-2 py-3 hidden lg:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${(run.total_response_time_ms / 1000).toFixed(1)}</div>
                        </td>
                        <td class="px-2 py-3 hidden lg:table-cell">
                            <div class="font-medium text-white text-xs sm:text-sm">${(run.total_response_time_ms / totalToolCalls / 1000).toFixed(2)}</div>
                        </td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Render detailed model information with config, avg stats, and individual runs
function renderModelDetails(modelData) {
  const config = modelData.config;
  const avgStats = modelData.averaged_stats;
  const runs = modelData.stats;

  return `
        <div class="px-2 sm:px-4 w-full overflow-hidden">
            <!-- Config Card -->
            <div class="bg-gray-700 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-white mb-3 text-lg">Configuration</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Model:</span>
                        <span class="text-white font-medium">${config.model}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Strategy:</span>
                        <span class="text-white font-medium">${config.strategy}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Deck:</span>
                        <span class="text-white font-medium">${config.deck}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Stake:</span>
                        <span class="text-white font-medium">${config.stake}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Seed:</span>
                        <span class="text-white font-medium">${config.seed}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Version:</span>
                        <span class="text-white font-medium">${config.version}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Author:</span>
                        <span class="text-white font-medium">${config.author}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Challenge:</span>
                        <span class="text-white font-medium">${config.challenge || 'None'}</span>
                    </div>
                </div>
            </div>

            <!-- Average Stats Card -->
            <div class="bg-gray-700 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-white mb-3 text-lg">Average Statistics</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Final Round:</span>
                        <span class="text-white font-medium">${avgStats.avg_final_round}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Ante Reached:</span>
                        <span class="text-white font-medium">${avgStats.avg_ante_reached}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Jokers Bought:</span>
                        <span class="text-white font-medium">${avgStats.avg_jokers_bought}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Jokers Sold:</span>
                        <span class="text-white font-medium">${avgStats.avg_jokers_sold}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Consumables Used:</span>
                        <span class="text-white font-medium">${avgStats.avg_consumables_used}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Rerolls:</span>
                        <span class="text-white font-medium">${avgStats.avg_rerolls}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Money Spent:</span>
                        <span class="text-white font-medium">${avgStats.avg_money_spent}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Successful Calls:</span>
                        <span class="text-white font-medium">${avgStats.avg_successful_calls.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Error Calls:</span>
                        <span class="text-white font-medium">${avgStats.avg_error_calls.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Failed Calls:</span>
                        <span class="text-white font-medium">${avgStats.avg_failed_calls.toFixed(1)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Input Tokens:</span>
                        <span class="text-white font-medium">${(avgStats.avg_total_input_tokens / 1000).toFixed(1)}k</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Output Tokens:</span>
                        <span class="text-white font-medium">${(avgStats.avg_total_output_tokens / 1000).toFixed(1)}k</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Total Tokens:</span>
                        <span class="text-white font-medium">${(avgStats.avg_total_tokens / 1000).toFixed(1)}k</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Reasoning Tokens:</span>
                        <span class="text-white font-medium">${(avgStats.avg_total_reasoning_tokens / 1000).toFixed(1)}k</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">Total Response Time:</span>
                        <span class="text-white font-medium">${(avgStats.avg_total_response_time_ms / 1000).toFixed(1)}s</span>
                    </div>
                </div>
            </div>

            <!-- Individual Runs Table -->
            <div class="bg-gray-700 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-white mb-3 text-lg">Individual Runs</h4>
                <div class="overflow-x-auto">
                    ${renderIndividualRunsDetailTable(runs)}
                </div>
            </div>

            <!-- Final Round Distribution Chart -->
            <div class="bg-gray-700 rounded-lg p-4">
                <h4 class="font-semibold text-white mb-3 text-lg">Final Round Distribution</h4>
                <div class="h-64">
                    <canvas id="finalRoundChart-${modelData.config.model.replace(/[^a-zA-Z0-9]/g, '-')}"></canvas>
                </div>
            </div>
        </div>
    `;
}

// Update stats cards with aggregated data
function updateStatsCards(entries, metadata) {
  // Update total runs
  const totalRuns = metadata.total_runs_analyzed;
  const totalRunsElement = document.getElementById('total-runs');
  if (totalRunsElement) {
    totalRunsElement.textContent = totalRuns.toLocaleString();
  }

  // Update average runtime from new schema
  const avgRuntime = entries.reduce((sum, entry) => {
    return sum + (entry.averaged_stats.avg_total_response_time_ms / 1000 / 60);
  }, 0) / entries.length;

  const avgRuntimeElement = document.querySelector('.text-purple-400');
  if (avgRuntimeElement && !isNaN(avgRuntime)) {
    avgRuntimeElement.textContent = `${avgRuntime.toFixed(1)} min`;
  }

  // Update unique seeds - this info is not available in the new schema
  const uniqueSeedsElement = document.getElementById('unique-seeds');
  if (uniqueSeedsElement) {
    uniqueSeedsElement.textContent = "N/A";
  }
}

// Show error message
function showError(message) {
  const tbody = document.getElementById('leaderboard-body');
  if (tbody) {
    tbody.innerHTML =
      `<tr><td colspan="13" class="px-2 py-4 text-center text-gray-400 text-sm">${message}</td></tr>`;
  }
}

// Utility functions
function getRankColor(rank) {
  switch (rank) {
    case 1:
      return 'text-yellow-400'; // Gold
    case 2:
      return 'text-gray-300'; // Silver
    case 3:
      return 'text-orange-400'; // Bronze
    default:
      return 'text-gray-400';
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

// Load detailed model data from JSON file
async function loadModelDetails(modelPath, index) {
  const statsRow = document.getElementById(`stats-row-${index}`);

  if (!statsRow) return;

  // Toggle visibility first
  if (!statsRow.classList.contains('hidden')) {
    statsRow.classList.add('hidden');
    return;
  }

  try {
    // Show loading state
    statsRow.querySelector('td').innerHTML =
      '<div class="px-4 py-8 text-center text-gray-400">Loading detailed data...</div>';
    statsRow.classList.remove('hidden');

    // Construct file path with proper path sanitization (/ -> -- only in filename)
    const modelParts = modelPath.split('/');
    const provider = modelParts[0];
    const sanitizedModelName = modelParts.slice(1).join('--');
    const filePath =
      `data/benchmarks/${currentVersion}/${currentStrategy}/${provider}/${sanitizedModelName}.json`;

    // Fetch model data
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load model data: ${response.status}`);
    }

    const modelData = await response.json();

    // Render detailed view
    statsRow.querySelector('td').innerHTML = renderModelDetails(modelData);

    // Create final round distribution chart after DOM is updated
    setTimeout(() => {
      createFinalRoundDistributionChart(modelData);
    }, 100);

  } catch (error) {
    console.error('Error loading model details:', error);
    statsRow.querySelector('td').innerHTML =
      '<div class="px-4 py-8 text-center text-red-400">Error loading detailed data</div>';
  }
}

// Toggle detailed run information for individual runs
function toggleRunDetails(modelIndex, runIndex) {
  const detailsRow = document.getElementById(`run-details-${modelIndex}-${runIndex}`);

  if (detailsRow) {
    if (detailsRow.classList.contains('hidden')) {
      detailsRow.classList.remove('hidden');
    } else {
      detailsRow.classList.add('hidden');
    }
  }
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
      container.innerHTML =
        '<div class="text-center text-gray-400 py-8">No community strategies available yet</div>';
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
      container.innerHTML =
        '<div class="text-center text-gray-400 py-8">Error loading community strategies</div>';
    }
  }
}

// Strategy interaction functions (legacy for community page)
function showStrategyDetails(title) {
  alert(
    `Strategy details for: ${title}\n\nThis would open a detailed view with full methodology, prompt, and results.`
  );
}

function voteStrategy(title) {
  alert(
    `Voted for strategy: ${title}\n\nIn a real implementation, this would update the vote count via API.`
  );
}

function tryStrategy(title) {
  alert(
    `Trying strategy: ${title}\n\nThis would redirect to a page where you can test the strategy.`);
}

// Create final round distribution chart
function createFinalRoundDistributionChart(modelData) {
  const chartId = `finalRoundChart-${modelData.config.model.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const canvas = document.getElementById(chartId);

  if (!canvas) return;

  // Extract final round data from all runs
  const finalRounds = modelData.stats.map(run => run.final_round);

  // Create frequency distribution
  const roundCounts = {};
  finalRounds.forEach(round => {
    roundCounts[round] = (roundCounts[round] || 0) + 1;
  });

  // Prepare data for Chart.js
  const rounds = Object.keys(roundCounts).map(Number).sort((a, b) => a - b);
  const counts = rounds.map(round => roundCounts[round]);

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rounds.map(r => `Round ${r}`),
      datasets: [{
        label: 'Number of Runs',
        data: counts,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#9CA3AF'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          title: {
            display: true,
            text: 'Number of Runs',
            color: '#9CA3AF'
          }
        },
        x: {
          ticks: {
            color: '#9CA3AF'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          title: {
            display: true,
            text: 'Final Round',
            color: '#9CA3AF'
          }
        }
      }
    }
  });
}

// Export functions for global access
window.BalatroBench = {
  loadLeaderboard,
  loadCommunityStrategies,
  showStrategyDetails,
  voteStrategy,
  tryStrategy,
  loadModelDetails,
  toggleRunDetails,
  initializeLeaderboard,
  createFinalRoundDistributionChart
};
