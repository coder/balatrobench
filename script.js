// Theme-aware color palette for Chart.js (HSLA strings)
const colors = {
  light: {
    vendors: {
      openai: 'hsla(0, 0%, 25%, .8)', // near-black accent
      google: 'hsla(134, 51%, 42%, .8)', // Google green
      anthropic: 'hsla(15, 52%, 58%, .8)', // Anthropic orange
      'x-ai': 'hsla(270, 70%, 50%, .8)', // X-AI purple
      deepseek: 'hsla(214, 61%, 44%, .8)' // DeepSeek blue
    },
    grid: 'hsla(240, 5%, 89%, 1)', // zinc-200-ish
    axis: 'hsla(240, 5%, 26%, 1)', // zinc-700-ish
    border: 'hsla(240, 5%, 84%, 1)' // zinc-300-ish
  },
  dark: {
    vendors: {
      openai: 'hsla(0, 0%, 50%, .8)', // brighter neutral for contrast
      google: 'hsla(134, 65%, 60%, .8)', // brighter Google green for dark mode
      anthropic: 'hsla(15, 64%, 70%, .8)', // more saturated Anthropic orange
      'x-ai': 'hsla(270, 80%, 70%, .8)', // brighter X-AI purple for dark mode
      deepseek: 'hsla(214, 75%, 65%, .8)' // brighter DeepSeek blue for dark mode
    },
    grid: 'hsla(240, 5%, 26%, 1)', // zinc-700-ish
    axis: 'hsla(240, 6%, 90%, 1)', // near-white text
    border: 'hsla(240, 5%, 36%, 1)' // zinc-600-ish
  }
};

// Utilities
function getCurrentTheme() {
  try {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ?
      'dark' : 'light';
  } catch (_) {
    return 'light';
  }
}

// Global state for main leaderboard chart
let performanceChart = null;
const DEFAULT_BENCHMARK_VERSION = 'v0.11.0';

// Load details for a specific model
async function loadDetails(vendor, model, basePath = 'data/benchmarks/v0.11.0/default') {
  try {
    const response = await fetch(`${basePath}/${vendor}/${model}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading model details:', error);
    return {
      stats: [],
      providers: {}
    };
  }
}

// Create round distribution histogram (uses Chart.js defaults for fills)
function createRoundHistogram(stats, canvasId) {
  const rounds = stats.map(stat => stat.final_round);
  const maxRound = Math.max(...rounds);
  const minRound = 1;

  // Create bins from 1 to maxRound
  const bins = Array.from({
    length: maxRound
  }, (_, i) => i + minRound);
  const counts = bins.map(round => rounds.filter(r => r === round).length);
  const maxCount = Math.max(...counts);

  const ctx = document.getElementById(canvasId).getContext('2d');
  const theme = getCurrentTheme();
  const themeColors = colors[theme] || colors.light;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins,
      datasets: [{
        data: counts
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'none'
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false,
          text: 'Rounds'
        }
      },
      scales: {
        x: {
          title: {
            display: false,
            text: 'Round'
          },
          ticks: {
            color: themeColors.axis
          },
          grid: {
            color: themeColors.grid,
            borderColor: themeColors.border
          },
          border: {
            color: themeColors.border
          }
        },
        y: {
          beginAtZero: true,
          max: maxCount + 1,
          title: {
            display: false,
            text: 'Frequency'
          },
          ticks: {
            stepSize: 1,
            color: themeColors.axis
          },
          grid: {
            color: themeColors.grid,
            borderColor: themeColors.border
          },
          border: {
            color: themeColors.border
          }
        }
      }
    }
  });
}

// Create performance bar chart with error bars
function createPerformanceBarChart(entries) {
  const ctx = document.getElementById('performance-chart').getContext('2d');

  // Extract data for chart
  const models = [];
  const avgRounds = [];
  const stdDevs = [];
  const strokeColors = [];
  const fillColors = [];
  const vendors = [];
  const currentTheme = getCurrentTheme();
  const themePalette = colors[currentTheme] || colors.light;

  entries.forEach(entry => {
    const modelParts = entry.config.model.split('/');
    const vendor = modelParts[0];
    const model = modelParts[1];

    models.push(model);
    avgRounds.push(entry.avg_final_round);
    stdDevs.push(entry.std_dev_final_round);
    vendors.push(vendor);

    const base = themePalette.vendors[vendor];
    strokeColors.push(base);
    fillColors.push(base);
  });

  // Calculate Y-axis max to include error bars
  const maxWithError = Math.max(...avgRounds.map((avg, i) => avg + stdDevs[i]));
  const yAxisMax = Math.ceil(maxWithError + 0.5); // Add padding

  if (performanceChart) {
    performanceChart.destroy();
  }
  performanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: models,
      datasets: [{
        label: 'Average Final Round',
        data: avgRounds,
        backgroundColor: fillColors,
        borderColor: strokeColors,
        borderWidth: 0,
        errorBars: {
          'Average Final Round': {
            plus: stdDevs,
            minus: stdDevs
          }
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              return `${context.parsed.y.toFixed(1)} ± ${stdDevs[index].toFixed(1)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: false,
            text: 'Model'
          },
          ticks: {
            color: themePalette.axis
          },
          grid: {
            color: themePalette.grid,
            borderColor: themePalette.border
          },
          border: {
            color: themePalette.border
          }
        },
        y: {
          beginAtZero: true,
          max: yAxisMax,
          title: {
            display: false,
            text: 'Average Final Round'
          },
          ticks: {
            color: themePalette.axis
          },
          grid: {
            color: themePalette.grid,
            borderColor: themePalette.border
          },
          border: {
            color: themePalette.border
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 10
        }
      }
    },
    plugins: [{
      id: 'errorBars',
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((bar, index) => {
            const x = bar.x;
            const y = bar.y;
            const value = dataset.data[index];
            const stdDev = stdDevs[index];
            const scale = chart.scales.y;

            // Calculate error bar positions
            const topY = scale.getPixelForValue(value + stdDev);
            const bottomY = scale.getPixelForValue(value - stdDev);

            // Draw error bar with vendor-specific color
            ctx.save();
            const vendor = vendors[index];
            const base = themePalette.vendors[vendor];
            ctx.strokeStyle = base;
            ctx.lineWidth = 4;

            // Draw vertical line with square caps
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.stroke();

            // Draw rounded, wider caps at top and bottom
            const capHalfWidth = 7; // 14px total width
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(x - capHalfWidth, topY);
            ctx.lineTo(x + capHalfWidth, topY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - capHalfWidth, bottomY);
            ctx.lineTo(x + capHalfWidth, bottomY);
            ctx.stroke();

            ctx.restore();
          });
        });
      }
    }]
  });
}

// Create provider distribution pie chart
// Provider distribution pie chart (uses defaults for fills; borders match background)
function createProviderPieChart(data, canvasId) {
  const providers = Object.keys(data.providers || {});
  const counts = Object.values(data.providers || {});

  const ctx = document.getElementById(canvasId).getContext('2d');
  const theme = getCurrentTheme();
  const themeColors = colors[theme] || colors.light;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: providers,
      datasets: [{
        data: counts,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 10,
            color: themeColors.axis,
            font: {
              size: 11
            }
          }
        },
        title: {
          display: false,
          text: 'Providers',
        }
      }
    },
  });
}

// Create inline detail row after clicked row
function createDetailRow(stats, modelName, data, vendor, model, basePath) {
  const detailRow = document.createElement('tr');
  detailRow.className = 'detail-row bg-zinc-50 dark:bg-zinc-800';

  // Create detail table HTML
  let detailTableRows = '';
  stats.forEach((stat) => {
    const successRate = ((stat.calls.successful / stat.calls.total) * 100).toFixed(0);
    const failedRate = ((stat.calls.failed / stat.calls.total) * 100).toFixed(0);
    const errorRate = ((stat.calls.error / stat.calls.total) * 100).toFixed(0);

    // Format averages with standard deviation
    const avgInputTokens = `${stat.average.input_tokens.toFixed(0)}`;
    const avgInputTokensStdDev = `${stat.std_dev.input_tokens.toFixed(0)}`;

    const avgOutputTokens = `${stat.average.output_tokens.toFixed(0)}`;
    const avgOutputTokensStdDev = `${stat.std_dev.output_tokens.toFixed(0)}`;

    // Convert time from ms to seconds
    const avgTimeSeconds = `${(stat.average.time_ms / 1000).toFixed(2)}`;
    const avgTimeSecondsStdDev = `${(stat.std_dev.time_ms / 1000).toFixed(2)}`;

    // Cost per tool calls (m$)
    const avgCost = `${(stat.average.total_cost * 1000).toFixed(2)}`;
    const costStdDev = `${(stat.std_dev.total_cost * 1000).toFixed(2)}`;

    detailTableRows += `
      <tr class="hover:bg-zinc-100 hover:dark:bg-zinc-700 text-xs">
        <td class="px-2 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">${stat.final_round}</td>
        <td class="px-2 py-2 text-center text-green-600 dark:text-green-400 font-mono">${successRate}%</td>
        <td class="px-2 py-2 text-center text-yellow-600 dark:text-yellow-400 font-mono">${failedRate}%</td>
        <td class="px-2 py-2 text-center text-red-600 dark:text-red-400 font-mono">${errorRate}%</td>
        <td class="px-4 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-6 xl:w-12 text-center">${avgInputTokens}</span>
            <span class="px-1">±</span>
            <span class="w-9 text-center">${avgInputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-6 xl:w-12 text-center">${avgOutputTokens}</span>
            <span class="px-1">±</span>
            <span class="w-9 text-center">${avgOutputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-12 text-center">${avgTimeSeconds}</span>
            <span class="px-1">±</span>
            <span class="w-12 text-center">${avgTimeSecondsStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-12 text-center">${avgCost}</span>
            <span class="px-1">±</span>
            <span class="w-12 text-center">${costStdDev}</span>
          </div>
        </td>
      </tr>
    `;
  });

  const histogramCanvasId = `histogram-${modelName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const pieChartCanvasId = `pie-${modelName.replace(/[^a-zA-Z0-9]/g, '-')}`;

  detailRow.innerHTML = `
    <td colspan="12" class="p-4">
      <div class="mb-8 pb-4 flex flex-col lg:flex-row gap-4 h-52">
        <!-- Rounds -->
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-center">Rounds</h4>
          <canvas id="${histogramCanvasId}" width="400" height="200"></canvas>
        </div>
        <!-- Providers -->
        <div>
          <h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-center">Providers</h4>
          <canvas id="${pieChartCanvasId}" width="300" height="200"></canvas>
        </div>
        <!-- Totals -->
        <div class="min-w-36 ml-4 mr-4">
          <h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-center">Totals</h4>
          <table class="w-full">
            <tbody>
              <tr>
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z" />
                      <path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z" />
                      <path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z" />
                    </svg>
                    <span>in</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(data.total.input_tokens / 1000000).toFixed(2)} M</span>
                </td>
              </tr>
              <tr>
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z" />
                      <path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z" />
                      <path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z" />
                    </svg>
                    <span>out</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(data.total.output_tokens / 1000000).toFixed(2)} M</span>
                </td>
              </tr>
              <tr>
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path d="M6.375 5.5h.875v1.75h-.875a.875.875 0 1 1 0-1.75ZM8.75 10.5V8.75h.875a.875.875 0 0 1 0 1.75H8.75Z" />
                      <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM7.25 3.75a.75.75 0 0 1 1.5 0V4h2.5a.75.75 0 0 1 0 1.5h-2.5v1.75h.875a2.375 2.375 0 1 1 0 4.75H8.75v.25a.75.75 0 0 1-1.5 0V12h-2.5a.75.75 0 0 1 0-1.5h2.5V8.75h-.875a2.375 2.375 0 1 1 0-4.75h.875v-.25Z" clip-rule="evenodd" />
                    </svg>
                    <span>in</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(data.total.input_cost).toFixed(2)} $</span>
                </td>
              </tr>
              <tr>
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path d="M6.375 5.5h.875v1.75h-.875a.875.875 0 1 1 0-1.75ZM8.75 10.5V8.75h.875a.875.875 0 0 1 0 1.75H8.75Z" />
                      <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM7.25 3.75a.75.75 0 0 1 1.5 0V4h2.5a.75.75 0 0 1 0 1.5h-2.5v1.75h.875a2.375 2.375 0 1 1 0 4.75H8.75v.25a.75.75 0 0 1-1.5 0V12h-2.5a.75.75 0 0 1 0-1.5h2.5V8.75h-.875a2.375 2.375 0 1 1 0-4.75h.875v-.25Z" clip-rule="evenodd" />
                    </svg>
                    <span>out</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(data.total.output_cost).toFixed(2)} $</span>
                </td>
              </tr>
              <tr>
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path d="M6.375 5.5h.875v1.75h-.875a.875.875 0 1 1 0-1.75ZM8.75 10.5V8.75h.875a.875.875 0 0 1 0 1.75H8.75Z" />
                      <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM7.25 3.75a.75.75 0 0 1 1.5 0V4h2.5a.75.75 0 0 1 0 1.5h-2.5v1.75h.875a2.375 2.375 0 1 1 0 4.75H8.75v.25a.75.75 0 0 1-1.5 0V12h-2.5a.75.75 0 0 1 0-1.5h2.5V8.75h-.875a2.375 2.375 0 1 1 0-4.75h.875v-.25Z" clip-rule="evenodd" />
                    </svg>
                    <span>total</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(data.total.total_cost).toFixed(2)} $</span>
                </td>
              </tr>
              <tr>
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clip-rule="evenodd" />
                    </svg>
                    <span>time</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(data.total.time_ms / 1000).toFixed(0)} s</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="overflow-x-auto rounded-lg shadow-lg" style="max-height: 180px; overflow-y: auto;">
        <table class="w-full table-auto">
          <thead class="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
            <tr class="text-xs border-b border-zinc-300 dark:border-zinc-700">
              <!-- Stats Section -->
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">Round</th>
              <!-- Tool Calls Section -->
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-zinc-300 before:dark:bg-zinc-700">
                <div class="flex items-center justify-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-green-600 dark:text-green-400">
                    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clip-rule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                </div>
              </th>
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                <div class="flex items-center justify-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-yellow-500 dark:text-yellow-400">
                    <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                </div>
              </th>
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                <div class="flex items-center justify-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-red-600 dark:text-red-400">
                    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                </div>
              </th>
              <!-- Tokens Section -->
              <th class="px-4 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-zinc-300 before:dark:bg-zinc-700">
                <div class="flex items-center justify-center space-x-1">
                  <span>In</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z" />
                    <path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z" />
                    <path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z" />
                  </svg>
                  <span class="text-xs">/</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                <div class="flex items-center justify-center space-x-1">
                  <span>Out</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z" />
                    <path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z" />
                    <path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z" />
                  </svg>
                  <span class="text-xs">/</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                </div>
              </th>
              <!-- Performance Section -->
              <th class="px-4 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-zinc-300 before:dark:bg-zinc-700">
                <div class="flex items-center justify-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs">/</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                  <span class="text-xs">[s]</span>
                </div>
              </th>
              <th class="px-4 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                <div class="flex items-center justify-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path d="M6.375 5.5h.875v1.75h-.875a.875.875 0 1 1 0-1.75ZM8.75 10.5V8.75h.875a.875.875 0 0 1 0 1.75H8.75Z" />
                    <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM7.25 3.75a.75.75 0 0 1 1.5 0V4h2.5a.75.75 0 0 1 0 1.5h-2.5v1.75h.875a2.375 2.375 0 1 1 0 4.75H8.75v.25a.75.75 0 0 1-1.5 0V12h-2.5a.75.75 0 0 1 0-1.5h2.5V8.75h-.875a2.375 2.375 0 1 1 0-4.75h.875v-.25Z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs">/</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
                    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
                  </svg>
                  <span class="text-xs">[m$]</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y-[0.5px] divide-zinc-200 dark:divide-zinc-700 text-sm">
            ${detailTableRows}
          </tbody>
        </table>
      </div>
    </td>
  `;

  // Add charts after DOM is updated
  setTimeout(() => {
    createRoundHistogram(stats, histogramCanvasId);
    createProviderPieChart(data, pieChartCanvasId);
  }, 0);

  // Make each per-run row clickable to open Run Viewer (if runs mapping exists)
  const perRunTable = detailRow.querySelector('table.table-auto');
  const tbody = perRunTable ? perRunTable.querySelector('tbody') : null;
  if (tbody) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const runs = Array.isArray(data.runs) ? data.runs : null;
    if (runs && runs.length > 0 && rows.length > 0) {
      const count = Math.min(runs.length, rows.length);
      for (let i = 0; i < count; i++) {
        const tr = rows[i];
        tr.classList.add('cursor-pointer');
        tr.title = 'Open run viewer';
        tr.setAttribute('role', 'button');
        tr.addEventListener('click', async (e) => {
          e.stopPropagation();
          const runId = runs[i];
          if (!runId) return;
          // Simple availability check before opening the viewer
          const reqId = '00001';
          const probeUrl =
            `${basePath}/${vendor}/${model}/${runId}/request-${reqId}/tool_call.json`;
          const exists = await fetchJsonSafe(probeUrl);
          if (!exists) return; // Data missing: do not open the card

          openRunViewer({
            basePath,
            vendor,
            model,
            runId,
            startIndex: 1
          });
        });
      }
    }
  }

  return detailRow;
}

// Load and display leaderboard data
async function loadLeaderboard(basePath = 'data/benchmarks/v0.11.0/default', displayMode = 'model',
  showChart = true) {
  try {
    const response = await fetch(`${basePath}/leaderboard.json`);
    const data = await response.json();

    const tableBody = document.getElementById('leaderboard-body');
    // Clear previous rows if reloading
    tableBody.innerHTML = '';

    // Create the performance bar chart (only on main leaderboard page)
    if (showChart) {
      createPerformanceBarChart(data.entries);
    }

    data.entries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.className =
        'hover:bg-zinc-50 hover:dark:bg-zinc-700 transition-colors duration-150 lg:cursor-pointer';

      // Parse data based on display mode
      let primaryValue, secondaryValue, vendor, model;

      if (displayMode === 'community') {
        primaryValue = entry.config.author || 'Unknown Author';
        secondaryValue = entry.config.strategy || 'Unknown Strategy';
        // For detail loading, we still need vendor/model from config.model
        const modelParts = entry.config.model.split('/');
        vendor = modelParts[0];
        model = modelParts[1];
      } else {
        // Parse model and vendor from config.model (format: "vendor/model")
        const modelParts = entry.config.model.split('/');
        vendor = modelParts[0];
        model = modelParts[1];
        primaryValue = model;
        secondaryValue = vendor;
      }

      // Make row clickable on lg+ screens
      row.addEventListener('click', async () => {
        if (window.innerWidth >= 1024) { // lg breakpoint
          const nextRow = row.nextElementSibling;
          const isExpanded = nextRow && nextRow.classList.contains('detail-row');

          if (isExpanded) {
            // Remove detail row
            nextRow.remove();
          } else {
            // Remove any other open detail rows first
            document.querySelectorAll('.detail-row').forEach(dr => dr.remove());

            // Load and show details
            const data = await loadDetails(vendor, model, basePath);
            const detailRow = createDetailRow(
              data.stats,
              displayMode === 'community' ? primaryValue : model,
              data,
              vendor,
              model,
              basePath
            );
            row.insertAdjacentElement('afterend', detailRow);
          }
        }
      });

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
      const cost = `${(entry.average.total_cost * 1000).toFixed(2)}`;
      const costStdDev = `${(entry.std_dev.total_cost * 1000).toFixed(2)}`;

      row.innerHTML = `
        <td class="px-4 py-3 text-left text-zinc-700 dark:text-zinc-300 font-mono">${index + 1}</td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono whitespace-nowrap">${primaryValue}</td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono whitespace-nowrap hidden xl:table-cell">${secondaryValue}</td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-8 text-center">${avgRound}</span>
            <span class="px-1">±</span>
            <span class="w-8 text-center">${avgRoundStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-center text-green-600 dark:text-green-400 font-mono hidden sm:table-cell">${successRate}%</td>
        <td class="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400 font-mono hidden sm:table-cell">${failureRate}%</td>
        <td class="px-4 py-3 text-center text-red-600 dark:text-red-400 font-mono hidden sm:table-cell">${errorRate}%</td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden lg:table-cell">
          <div class="flex justify-center items-center">
            <span class="w-6 xl:w-12 text-center">${avgInputTokens}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-9 text-center hidden xl:inline">${avgInputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden lg:table-cell">
          <div class="flex justify-center items-center">
            <span class="w-6 xl:w-12 text-center">${avgOutputTokens}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-9 text-center hidden xl:inline">${avgOutputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden md:table-cell">
          <div class="flex justify-center items-center">
            <span class="w-12 text-center">${avgTimeSeconds}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-12 text-center hidden xl:inline">${avgTimeSecondsStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden md:table-cell">
          <div class="flex justify-center items-center">
            <span class="w-12 text-center">${cost}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-12 text-center hidden xl:inline">${costStdDev}</span>
          </div>
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
document.addEventListener('DOMContentLoaded', () => {
  // Detect if this is the community page
  const isCommunityPage = document.title.includes('Community');

  if (isCommunityPage) {
    loadLeaderboard('data/community/v0.8.1/default', 'community', false);
  } else {
    initBenchmarkVersionSelector();
  }
});

// ===== Run Viewer (modal) =====
function formatRequestId(n) {
  return String(n).padStart(5, '0');
}
async function fetchTextSafe(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}
async function fetchJsonSafe(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function openRunViewer({
  basePath,
  vendor,
  model,
  runId,
  startIndex = 1
}) {
  const state = {
    basePath,
    vendor,
    model,
    runId,
    index: startIndex,
    overlay: null,
    keyHandler: null
  };
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4';
  overlay.innerHTML = `
    <div class="relative w-full max-w-7xl max-h-[95vh] bg-white dark:bg-zinc-800 rounded-lg shadow-2xl ring-1 ring-white/10 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <div class="text-sm text-zinc-600 dark:text-zinc-300 font-mono truncate" id="run-title"></div>
        <button id="run-close" class="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700" aria-label="Close">✕</button>
      </div>
      <div class="p-3 space-y-3">
        <div class="flex flex-col lg:flex-row gap-3">
          <div class="lg:w-1/2 w-full bg-zinc-50 dark:bg-zinc-900 rounded-md overflow-hidden flex items-center justify-center h-[45vh] lg:h-[45vh] p-2">
            <img id="run-screenshot" class="max-h-full max-w-full object-contain" alt="Screenshot" />
          </div>
          <div class="lg:w-1/2 w-full flex flex-col">
            <pre id="run-reasoning" class="h-[45vh] lg:h-[45vh] bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap overflow-auto"></pre>
          </div>
        </div>
        <div>
          <div id="run-tool" class="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-xs text-zinc-800 dark:text-zinc-200 overflow-auto h-[25vh] lg:h-[25vh]"></div>
        </div>
        <div class="flex items-center justify-center gap-4 py-1">
          <button id="run-prev" class="px-3 py-1.5 rounded bg-white/80 dark:bg-zinc-700/80 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600" title="Previous (← or h)" aria-label="Previous">◀</button>
          <button id="run-next" class="px-3 py-1.5 rounded bg-white/80 dark:bg-zinc-700/80 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600" title="Next (→ or l)" aria-label="Next">▶</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  state.overlay = overlay;

  overlay.querySelector('#run-close').addEventListener('click', () => closeRunViewer(state));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeRunViewer(state);
  });
  overlay.querySelector('#run-prev').addEventListener('click', () => navigateRun(state, -1));
  overlay.querySelector('#run-next').addEventListener('click', () => navigateRun(state, +1));

  state.keyHandler = (e) => {
    if (e.key === 'Escape') return closeRunViewer(state);
    if (e.key === 'ArrowLeft' || e.key === 'h') return navigateRun(state, -1);
    if (e.key === 'ArrowRight' || e.key === 'l') return navigateRun(state, +1);
  };
  window.addEventListener('keydown', state.keyHandler);

  loadAndRenderRequest(state);
}

async function loadAndRenderRequest(state) {
  const {
    basePath,
    vendor,
    model,
    runId,
    index,
    overlay
  } = state;
  const reqId = formatRequestId(index);
  const runBase = `${basePath}/${vendor}/${model}/${runId}/request-${reqId}`;

  overlay.querySelector('#run-title').textContent =
    `${vendor}/${model} • ${runId} • request-${reqId}`;

  const [reasoning, toolcall] = await Promise.all([
    fetchTextSafe(`${runBase}/reasoning.md`),
    fetchJsonSafe(`${runBase}/tool_call.json`)
  ]);

  const imgEl = overlay.querySelector('#run-screenshot');
  imgEl.src = `${runBase}/screenshot.avif`;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = `${runBase}/screenshot.png`;
  };

  overlay.querySelector('#run-reasoning').textContent = reasoning || '(No reasoning.md)';

  const toolDiv = overlay.querySelector('#run-tool');
  if (!toolcall) {
    toolDiv.textContent = '(No tool_call.json)';
  } else {
    const tc = Array.isArray(toolcall) ? toolcall[0] : toolcall;
    const name = tc && tc.function && tc.function.name ? tc.function.name : '(unknown)';
    let argsRaw = tc && tc.function ? tc.function.arguments : '';
    let argsPretty = '';
    if (typeof argsRaw === 'string') {
      try {
        argsPretty = JSON.stringify(JSON.parse(argsRaw), null, 2);
      } catch {
        argsPretty = argsRaw;
      }
    } else if (argsRaw && typeof argsRaw === 'object') {
      try {
        argsPretty = JSON.stringify(argsRaw, null, 2);
      } catch {
        argsPretty = String(argsRaw);
      }
    }
    toolDiv.innerHTML = `
      <div class="space-y-2">
        <div><span class="font-semibold">Function:</span> <span id="fn-name" class="font-mono"></span></div>
        <div>
          <div class="font-semibold mb-1">Arguments:</div>
          <pre id="fn-args" class="whitespace-pre-wrap"></pre>
        </div>
      </div>`;
    toolDiv.querySelector('#fn-name').textContent = name;
    toolDiv.querySelector('#fn-args').textContent = argsPretty || '';
  }
}

async function navigateRun(state, delta) {
  const old = state.index;
  state.index = Math.max(1, old + delta);
  const reqId = formatRequestId(state.index);
  const probe =
    `${state.basePath}/${state.vendor}/${state.model}/${state.runId}/request-${reqId}/tool_call.json`;
  const ok = await fetchJsonSafe(probe);
  if (!ok) {
    state.index = old;
    return;
  }
  loadAndRenderRequest(state);
}

function closeRunViewer(state) {
  window.removeEventListener('keydown', state.keyHandler);
  document.body.style.overflow = '';
  state.overlay.remove();
}

function initBenchmarkVersionSelector() {
  const sel = document.getElementById('version-select');
  const tableEl = document.getElementById('leaderboard-body');
  if (!sel) {
    // Fallback to default if selector missing, only if table exists on page
    if (tableEl) {
      loadLeaderboard(`data/benchmarks/${DEFAULT_BENCHMARK_VERSION}/default`, 'model', true);
    }
    return;
  }

  const applyVersion = (version) => {
    const basePath = `data/benchmarks/${version}/default`;
    const tbody = document.getElementById('leaderboard-body');
    if (tbody) tbody.innerHTML = '';
    loadLeaderboard(basePath, 'model', true);
  };

  // Initial load from current selection
  applyVersion(sel.value || DEFAULT_BENCHMARK_VERSION);

  // Reload on change
  sel.addEventListener('change', () => applyVersion(sel.value));
}
