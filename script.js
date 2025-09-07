// Load and display leaderboard data
async function loadLeaderboard() {
  try {
    const response = await fetch('data/benchmarks/v0.8.0/default/leaderboard.json');
    const data = await response.json();

    const tableBody = document.getElementById('leaderboard-body');

    data.entries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50 transition-colors duration-150';

      // Parse model and vendor from config.model (format: "vendor/model")
      const modelParts = entry.config.model.split('/');
      const vendor = modelParts[0];
      const model = modelParts[1];

      // Calculate percentages
      const successRate = ((entry.calls.successful / entry.calls.total) * 100).toFixed(0);
      const failureRate = ((entry.calls.failed / entry.calls.total) * 100).toFixed(0);
      const errorRate = ((entry.calls.error / entry.calls.total) * 100).toFixed(0);

      // Format averages with standard deviation
      const avgRound = `${entry.avg_final_round.toFixed(1)}`;
      const avgRoundStdDev = `${entry.std_dev_final_round.toFixed(1)}`;

      const avgInputTokens = `${entry.average.input_tokens.toFixed(0)}`;
      const avgInputTokensStdDev = `${entry.std_dev.input_tokens.toFixed(0)}`;

      const avgOutputTokens = `${entry.average.output_tokens.toFixed(0)}`;
      const avgOutputTokensStdDev = `${entry.std_dev.output_tokens.toFixed(0)}`;

      // Convert time from ms to seconds
      const avgTimeSeconds = `${(entry.average.time_ms / 1000).toFixed(2)}`;
      const avgTimeSecondsStdDev = `${(entry.std_dev.time_ms / 1000).toFixed(2)}`;

      // Cost per tool calls (m$)
      const cost = `${(entry.average.total_cost * 1000).toFixed(3)}`;
      const costStdDev = `${(entry.std_dev.total_cost * 1000).toFixed(3)}`;

      row.innerHTML = `
        <td class="px-4 py-3 text-left text-gray-700 font-mono">${index + 1}</td>
        <td class="px-4 py-3 text-left text-gray-700 font-mono whitespace-nowrap">${model}</td>
        <td class="px-4 py-3 text-left text-gray-700 font-mono whitespace-nowrap hidden lg:table-cell">${vendor}</td>
        <td class="px-4 py-3 text-center text-gray-700 font-mono">
          ${avgRound} ± ${avgRoundStdDev}
        </td>
        <td class="px-4 py-3 text-center text-green-600 font-mono hidden sm:table-cell">${successRate}%</td>
        <td class="px-4 py-3 text-center text-yellow-600 font-mono hidden sm:table-cell">${failureRate}%</td>
        <td class="px-4 py-3 text-center text-red-600 font-mono hidden sm:table-cell">${errorRate}%</td>
        <td class="px-4 py-3 text-center text-gray-700 font-mono hidden lg:table-cell">
          ${avgInputTokens}<span class="hidden xl:inline"> ± ${avgInputTokensStdDev}</span>
        </td>
        <td class="px-4 py-3 text-center text-gray-700 font-mono hidden lg:table-cell">
          ${avgOutputTokens}<span class="hidden xl:inline"> ± ${avgOutputTokensStdDev}</span>
        </td>
        <td class="px-4 py-3 text-center text-gray-700 font-mono hidden md:table-cell">
          ${avgTimeSeconds}<span class="hidden xl:inline"> ± ${avgTimeSecondsStdDev}</span>
        </td>
        <td class="px-4 py-3 text-center text-gray-700 font-mono hidden md:table-cell">
          ${cost}<span class="hidden xl:inline"> ± ${costStdDev}</span>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Error loading leaderboard data:', error);
    const tableBody = document.getElementById('leaderboard-body');
    tableBody.innerHTML = '<tr><td colspan="12" class="text-center">Error loading data</td></tr>';
  }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadLeaderboard);
