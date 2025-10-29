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
let DEFAULT_BENCHMARK_VERSION = null; // Must be set from manifest
let PAGE_TYPE = null; // 'main' or 'community'

// Data source configuration - using CONFIG from config.js
const DATA_BASE_URL = window.CONFIG ? window.CONFIG.getData() : '';
const IS_DEV = window.CONFIG ? window.CONFIG.environment === 'development' : false;

// Detect which page we're on
function detectPageType() {
  const pageTitle = document.title;
  if (pageTitle.includes('Community')) {
    return 'community';
  }
  return 'main';
}

// Get data paths based on page type and version
function getDataPaths(version) {
  if (PAGE_TYPE === 'community') {
    return {
      manifestPath: `${DATA_BASE_URL}/benchmarks/strategies/manifest.json`,
      leaderboardPath: `${DATA_BASE_URL}/benchmarks/strategies/${version}/openai/gpt-oss-20b/leaderboard.json`,
      detailBasePath: `${DATA_BASE_URL}/benchmarks/strategies/${version}/openai/gpt-oss-20b`
    };
  } else {
    return {
      manifestPath: `${DATA_BASE_URL}/benchmarks/models/manifest.json`,
      leaderboardPath: `${DATA_BASE_URL}/benchmarks/models/${version}/default/leaderboard.json`,
      detailBasePath: `${DATA_BASE_URL}/benchmarks/models/${version}/default`
    };
  }
}

// Load details for a specific model/strategy
async function loadDetails(vendor, model, basePath, strategy = null) {
  try {
    let detailPath;
    if (PAGE_TYPE === 'community' && strategy) {
      // For strategies: load from strategy/stats.json
      detailPath = `${basePath}/${strategy}/stats.json`;
    } else {
      // For models: load from vendor/model.json
      detailPath = `${basePath}/${vendor}/${model}.json`;
    }
    const response = await fetch(detailPath);
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

// Create round distribution histogram with stacked bars by seed
function createRoundHistogram(stats, canvasId) {
  const rounds = stats.map(stat => stat.final_round);
  const maxRound = Math.max(...rounds);
  const minRound = 1;

  // Create bins from 1 to maxRound
  const bins = Array.from({
    length: maxRound
  }, (_, i) => i + minRound);

  // Extract unique seeds and sort them for consistent ordering
  const seeds = [...new Set(stats.map(stat => stat.seed || 'Unknown'))].sort();

  // Create a color palette for seeds using theme-aware colors
  const ctx = document.getElementById(canvasId).getContext('2d');
  const theme = getCurrentTheme();
  const themeColors = colors[theme] || colors.light;

  // Generate seed colors - use HSL with variations for distinction
  const seedColors = {};
  const hueStep = 360 / Math.max(seeds.length, 1);
  seeds.forEach((seed, index) => {
    const hue = (index * hueStep) % 360;
    const saturation = 60 + (index % 3) * 10; // Vary saturation
    const lightness = theme === 'dark' ? 55 : 45;
    seedColors[seed] = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
  });

  // Create datasets - one per seed
  const datasets = seeds.map(seed => {
    const counts = bins.map(round => {
      return stats.filter(s => s.final_round === round && (s.seed || 'Unknown') === seed)
        .length;
    });

    return {
      label: seed,
      data: counts,
      backgroundColor: seedColors[seed],
      borderColor: seedColors[seed],
      borderWidth: 0
    };
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
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
          text: 'Rounds by Seed'
        }
      },
      scales: {
        x: {
          stacked: true,
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
          stacked: true,
          beginAtZero: true,
          title: {
            display: false,
            text: 'Frequency'
          },
          ticks: {
            color: themeColors.axis,
            precision: 0,
            stepSize: 1
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
function createDetailRow(stats, modelName, data, vendor, model, basePath, strategy = null) {
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
        <td class="px-2 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">${stat.seed || 'Unknown'}</td>
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
    <td colspan="13" class="p-4">
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
          <thead class="bg-zinc-100 dark:bg-zinc-700 sticky top-0">
            <tr class="text-xs border-b border-zinc-300 dark:border-zinc-600">
              <!-- Stats Section -->
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300">Seed</th>
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-zinc-300 before:dark:bg-zinc-600">Round</th>
              <!-- Tool Calls Section -->
              <th class="px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-zinc-300 before:dark:bg-zinc-600">
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
              <th class="px-4 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-zinc-300 before:dark:bg-zinc-600">
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
              <th class="px-4 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-zinc-300 before:dark:bg-zinc-600">
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
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-600 text-sm">
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
          let probeUrl;
          if (PAGE_TYPE === 'community' && strategy) {
            // For strategies: probe at basePath/strategy/model/runId/request-*.json
            probeUrl =
              `${basePath}/${strategy}/${model}/${runId}/request-${reqId}/tool_call.json`;
          } else {
            // For models: probe at basePath/vendor/model/runId/request-*.json
            probeUrl =
              `${basePath}/${vendor}/${model}/${runId}/request-${reqId}/tool_call.json`;
          }
          const exists = await fetchJsonSafe(probeUrl);
          if (!exists) {
            console.warn('Run data not found at:', probeUrl);
            return; // Data missing: do not open the card
          }

          openRunViewer({
            basePath: basePath,
            vendor,
            model,
            runId,
            strategy,
            startIndex: 1
          });
        });
      }
    }
  }

  return detailRow;
}

// Load and display leaderboard data
async function loadLeaderboard(leaderboardPath, detailBasePath, displayMode = 'model',
  showChart = true) {
  try {
    const response = await fetch(leaderboardPath);
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

      // Parse model and vendor from config.model (format: "vendor/model")
      const modelParts = entry.config.model.split('/');
      vendor = modelParts[0];
      model = modelParts[1];

      if (displayMode === 'community') {
        // For strategies: show author as primary, strategy name as secondary
        primaryValue = entry.strategy.author;
        secondaryValue = entry.strategy.name;
      } else {
        // For models: show model name as primary, vendor as secondary
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
            const strategy = displayMode === 'community' ? entry.config.strategy : null;
            const data = await loadDetails(vendor, model, detailBasePath, strategy);
            const detailRow = createDetailRow(
              data.stats,
              displayMode === 'community' ? primaryValue : model,
              data,
              vendor,
              model,
              detailBasePath,
              strategy
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
            <span class="w-10 text-center">${avgRound}</span>
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
  // Detect page type
  PAGE_TYPE = detectPageType();

  // Initialize version selector for both pages
  initBenchmarkVersionSelector();
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
  strategy = null,
  startIndex = 1
}) {
  const state = {
    basePath,
    vendor,
    model,
    runId,
    strategy,
    index: startIndex,
    overlay: null,
    keyHandler: null
  };
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4';
  overlay.innerHTML = `
    <div class="relative w-full max-w-5xl max-h-[95vh] bg-white dark:bg-zinc-800 rounded-lg shadow-2xl ring-1 ring-white/10 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-600">
        <div class="text-sm text-zinc-600 dark:text-zinc-300 font-mono truncate" id="run-title"></div>
        <button id="run-close" class="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700" aria-label="Close">✕</button>
      </div>
      <div class="p-3 space-y-3">
        <div class="flex flex-col lg:flex-row gap-3">
          <div class="lg:w-1/2 w-full bg-zinc-50 dark:bg-zinc-900 rounded-md overflow-hidden flex items-center justify-center h-96">
            <img id="run-screenshot" class="max-h-full max-w-full object-contain p-2" alt="Screenshot" />
          </div>
          <div class="lg:w-1/2 w-full flex flex-col">
            <pre id="run-reasoning" class="h-96 bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap overflow-auto"></pre>
          </div>
        </div>
        <div class="flex flex-col h-[25vh] lg:h-[25vh] gap-2">
          <div id="run-tool-name" class="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-sm font-mono text-zinc-800 dark:text-zinc-200 flex items-center"></div>
          <div id="run-tool-args" class="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-xs text-zinc-800 dark:text-zinc-200 overflow-auto flex-1"></div>
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
    strategy,
    index,
    overlay
  } = state;
  const reqId = formatRequestId(index);
  let runBase;
  if (PAGE_TYPE === 'community' && strategy) {
    // For strategies: construct path as basePath/strategy/model/runId/request-*
    runBase = `${basePath}/${strategy}/${model}/${runId}/request-${reqId}`;
  } else {
    // For models: construct path as basePath/vendor/model/runId/request-*
    runBase = `${basePath}/${vendor}/${model}/${runId}/request-${reqId}`;
  }

  overlay.querySelector('#run-title').textContent =
    `${vendor}/${model} • ${runId} • request-${reqId}`;

  const [reasoning, toolcall] = await Promise.all([
    fetchTextSafe(`${runBase}/reasoning.md`),
    fetchJsonSafe(`${runBase}/tool_call.json`)
  ]);

  const imgEl = overlay.querySelector('#run-screenshot');
  // Try formats in order: webp -> png -> avif
  const formats = ['webp', 'png', 'avif'];
  let formatIndex = 0;

  const tryNextFormat = () => {
    if (formatIndex < formats.length) {
      imgEl.src = `${runBase}/screenshot.${formats[formatIndex]}`;
      formatIndex++;
    }
  };

  imgEl.onerror = () => {
    if (formatIndex < formats.length) {
      tryNextFormat();
    } else {
      imgEl.onerror = null;
    }
  };

  tryNextFormat();

  overlay.querySelector('#run-reasoning').textContent = reasoning || '(No reasoning.md)';

  const toolNameDiv = overlay.querySelector('#run-tool-name');
  const toolArgsDiv = overlay.querySelector('#run-tool-args');
  if (!toolcall) {
    toolNameDiv.textContent = '(No tool_call.json)';
    toolArgsDiv.textContent = '';
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
    toolNameDiv.textContent = name;
    toolArgsDiv.innerHTML = `<pre class="whitespace-pre-wrap">${argsPretty || ''}</pre>`;
  }
}

async function navigateRun(state, delta) {
  const old = state.index;
  state.index = Math.max(1, old + delta);
  const reqId = formatRequestId(state.index);
  let probe;
  if (PAGE_TYPE === 'community' && state.strategy) {
    // For strategies: construct path as basePath/strategy/model/runId/request-*
    probe =
      `${state.basePath}/${state.strategy}/${state.model}/${state.runId}/request-${reqId}/tool_call.json`;
  } else {
    // For models: construct path as basePath/vendor/model/runId/request-*
    probe =
      `${state.basePath}/${state.vendor}/${state.model}/${state.runId}/request-${reqId}/tool_call.json`;
  }
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

// Load version manifest and populate version selector
async function loadVersionManifest(manifestPath) {
  const response = await fetch(manifestPath);
  if (!response.ok) {
    throw new Error(`Failed to load version manifest: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const versions = data.versions || [];

  // Set DEFAULT_BENCHMARK_VERSION to the latest version (required)
  const latestVersion = versions.find(v => v.latest);
  if (!latestVersion) {
    throw new Error('Manifest must contain a version marked with "latest": true');
  }

  DEFAULT_BENCHMARK_VERSION = latestVersion.version;
  return versions;
}

// Populate version selector with options from manifest
async function initBenchmarkVersionSelector() {
  const sel = document.getElementById('version-select');
  if (!sel) {
    throw new Error('Version selector element not found');
  }

  const paths = getDataPaths(DEFAULT_BENCHMARK_VERSION);

  // Load versions from manifest (will throw if latest not found or manifest missing)
  const versions = await loadVersionManifest(paths.manifestPath);

  // Populate select options
  versions.forEach(versionObj => {
    const option = document.createElement('option');
    option.value = versionObj.version;
    option.textContent = versionObj.label || versionObj.version;
    if (versionObj.latest) {
      option.selected = true;
    }
    sel.appendChild(option);
  });

  const applyVersion = (version) => {
    const paths = getDataPaths(version);
    const tbody = document.getElementById('leaderboard-body');
    if (tbody) tbody.innerHTML = '';
    const displayMode = PAGE_TYPE === 'community' ? 'community' : 'model';
    const showChart = PAGE_TYPE === 'main';
    loadLeaderboard(paths.leaderboardPath, paths.detailBasePath, displayMode, showChart);
  };

  // Initial load from current selection
  applyVersion(sel.value || DEFAULT_BENCHMARK_VERSION);

  // Reload on change
  sel.addEventListener('change', () => applyVersion(sel.value));
}
