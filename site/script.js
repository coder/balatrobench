// Theme-aware color palette for Chart.js (HSLA strings)
const colors = {
  light: {
    vendors: {
      openai: 'hsla(0, 0%, 25%, .8)', // near-black accent
      google: 'hsla(134, 51%, 42%, .8)', // Google green
      anthropic: 'hsla(15, 52%, 58%, .8)', // Anthropic orange
      'x-ai': 'hsla(270, 70%, 50%, .8)', // X-AI purple
      deepseek: 'hsla(214, 61%, 44%, .8)', // DeepSeek blue
      mistralai: 'hsla(26, 100%, 50%, .8)', // Mistral orange
      qwen: 'hsla(23, 82%, 31%, .8)', // Qwen brown
      'z-ai': 'hsla(213, 79%, 31%, .8)', // Z-AI blue
      minimax: 'hsla(343, 63%, 32%, .8)', // Minimax pink
      moonshotai: 'hsla(212, 97%, 29%, .8)' // Moonshot blue
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
      deepseek: 'hsla(214, 75%, 65%, .8)', // brighter DeepSeek blue for dark mode
      mistralai: 'hsla(26, 100%, 68%, .8)', // brighter Mistral orange for dark mode
      qwen: 'hsla(23, 94%, 49%, .8)', // brighter Qwen brown for dark mode
      'z-ai': 'hsla(213, 91%, 49%, .8)', // brighter Z-AI blue for dark mode
      minimax: 'hsla(343, 75%, 50%, .8)', // brighter Minimax pink for dark mode
      moonshotai: 'hsla(212, 100%, 47%, .8)' // brighter Moonshot blue for dark mode
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

// ============================================================================
// SVG Icon Templates (reused across UI components)
// ============================================================================

const Icons = {
  // Token/database icon (used for input/output tokens)
  tokens: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
    <path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z" />
    <path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z" />
    <path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z" />
  </svg>`,

  // Dollar/currency icon
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
    <path d="M6.375 5.5h.875v1.75h-.875a.875.875 0 1 1 0-1.75ZM8.75 10.5V8.75h.875a.875.875 0 0 1 0 1.75H8.75Z" />
    <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM7.25 3.75a.75.75 0 0 1 1.5 0V4h2.5a.75.75 0 0 1 0 1.5h-2.5v1.75h.875a2.375 2.375 0 1 1 0 4.75H8.75v.25a.75.75 0 0 1-1.5 0V12h-2.5a.75.75 0 0 1 0-1.5h2.5V8.75h-.875a2.375 2.375 0 1 1 0-4.75h.875v-.25Z" clip-rule="evenodd" />
  </svg>`,

  // Clock/time icon
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
    <path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clip-rule="evenodd" />
  </svg>`,

  // Tool/wrench icon
  tool: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
    <path fill-rule="evenodd" d="M15 4.5A3.5 3.5 0 0 1 11.435 8c-.99-.019-2.093.132-2.7.913l-4.13 5.31a2.015 2.015 0 1 1-2.827-2.828l5.309-4.13c.78-.607.932-1.71.914-2.7L8 4.5a3.5 3.5 0 0 1 4.477-3.362c.325.094.39.497.15.736L10.6 3.902a.48.48 0 0 0-.033.653c.271.314.565.608.879.879a.48.48 0 0 0 .653-.033l2.027-2.027c.239-.24.642-.175.736.15.09.31.138.637.138.976ZM3.75 13a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" clip-rule="evenodd" />
    <path d="M11.5 9.5c.313 0 .62-.029.917-.084l1.962 1.962a2.121 2.121 0 0 1-3 3l-2.81-2.81 1.35-1.734c.05-.064.158-.158.426-.233.278-.078.639-.11 1.062-.102l.093.001ZM5 4l1.446 1.445a2.256 2.256 0 0 1-.047.21c-.075.268-.169.377-.233.427l-.61.474L4 5H2.655a.25.25 0 0 1-.224-.139l-1.35-2.7a.25.25 0 0 1 .047-.289l.745-.745a.25.25 0 0 1 .289-.047l2.7 1.35A.25.25 0 0 1 5 2.654V4Z" />
  </svg>`,

  // Success checkmark (green)
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-green-600 dark:text-green-400">
    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clip-rule="evenodd" />
  </svg>`,

  // Warning triangle (yellow)
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-yellow-500 dark:text-yellow-400">
    <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
  </svg>`,

  // Error circle (red)
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-red-600 dark:text-red-400">
    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
  </svg>`
};

// ============================================================================
// Detail Row Template Helpers

// ============================================================================
// Run Viewer Modal Templates
// ============================================================================

const RunViewerTemplates = {
  /**
   * Keyboard shortcut row for help popup
   */
  shortcutRow(keys, description) {
    const keyHtml = keys.map(k =>
      `<kbd class="font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">${k}</kbd>`
    ).join('<span class="text-xs text-zinc-400 dark:text-zinc-500">or</span>');
    return `
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 min-w-[80px]">${keyHtml}</div>
        <span class="text-sm text-zinc-600 dark:text-zinc-400">${description}</span>
      </div>`;
  },

  /**
   * Full keyboard help popup HTML
   */
  get helpPopup() {
    return `
      <div id="run-help-popup" class="hidden absolute top-14 right-4 z-10 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-xl p-5 w-96">
        <h3 class="text-base font-bold text-zinc-700 dark:text-zinc-300 mb-4">Keyboard Navigation</h3>
        <div class="space-y-4">
          <!-- Horizontal Section -->
          <div>
            <div class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Horizontal (Requests)</div>
            <div class="space-y-1.5">
              ${this.shortcutRow(['←', 'h'], 'Previous request')}
              ${this.shortcutRow(['→', 'l'], 'Next request')}
            </div>
          </div>

          <!-- Vertical Section -->
          <div>
            <div class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Vertical (Runs)</div>
            <div class="space-y-1.5">
              ${this.shortcutRow(['↑', 'k'], 'Previous run')}
              ${this.shortcutRow(['↓', 'j'], 'Next run')}
            </div>
          </div>

          <!-- Other Section -->
          <div class="border-t border-zinc-200 dark:border-zinc-700 pt-3">
            <div class="space-y-1.5">
              <div class="flex items-center gap-3">
                <kbd class="font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 min-w-[80px] text-center">Esc</kbd>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Close viewer</span>
              </div>
              <div class="flex items-center gap-3">
                <kbd class="font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 min-w-[80px] text-center">?</kbd>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Toggle this help</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  /**
   * Context file panel (strategy/gamestate/memory)
   */
  contextPanel(id, title, tooltip) {
    return `
      <div class="flex flex-col min-h-0">
        <div class="group relative flex justify-center mb-2">
          <h3 class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-2 text-center cursor-help">${title}</h3>
          <span class="pointer-events-none absolute top-full left-1/2 z-[9999] mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
            ${tooltip}
          </span>
        </div>
        <pre id="${id}" class="flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap overflow-auto"></pre>
      </div>`;
  },

  /**
   * Full modal HTML structure
   */
  get modal() {
    return `
    <div class="relative w-full h-full max-w-[2400px] max-h-[90vh] bg-white dark:bg-zinc-800 rounded-lg shadow-2xl ring-1 ring-white/10 overflow-hidden flex flex-col lg:max-w-[2300px] 2xl:max-w-[2200px]">
      <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-600">
        <div class="text-sm text-zinc-600 dark:text-zinc-300 font-mono truncate" id="run-title"></div>
        <div class="flex items-center gap-4">
          <span class="text-sm font-mono text-emerald-600 dark:text-emerald-400">Nav: <b>←</b> / <b>→</b> / <b>↑</b> / <b>↓</b> / <b>?</b></span>
          <button id="run-close" class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400" aria-label="Close">✕</button>
        </div>
      </div>
      ${this.helpPopup}
      <div class="p-4 flex-1 flex flex-col overflow-hidden">
        <!-- Row 1: Context Files (3 columns) - Dynamic height -->
        <div class="grid grid-cols-3 gap-4 flex-1 mb-4 min-h-0">
          ${this.contextPanel('run-strategy', 'STRATEGY.md', 'Strategy philosophy and decision-making approach for the LLM')}
          ${this.contextPanel('run-gamestate', 'GAMESTATE.md', 'Current game state formatted for LLM comprehension')}
          ${this.contextPanel('run-memory', 'MEMORY.md', 'Response history: last 10 actions and error messages')}
        </div>

        <!-- Separator -->
        <div class="border-t border-zinc-300 dark:border-zinc-600 mb-4"></div>

        <!-- Row 2: Main Content - Fixed height to fit screenshot -->
        <div class="flex gap-4 mb-4" style="height: 384px;">
          <!-- Screenshot Column -->
          <div class="flex items-center justify-center px-4 rounded-md" style="flex: 0 0 auto;">
            <img id="run-screenshot" class="max-h-full object-contain rounded-md" alt="Screenshot" style="max-width: 512px;" />
          </div>
          <!-- Reasoning + Tool Call Column -->
          <div class="flex flex-col flex-1" style="height: 384px; gap: 12px;">
            <pre id="run-reasoning" class="flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-xs text-zinc-800 dark:text-zinc-200 font-mono italic whitespace-pre-wrap overflow-auto"></pre>
            <div id="run-tool-call" class="flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 rounded-md px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-nowrap text-center"></div>
          </div>
        </div>
      </div>
    </div>`;
  }
};

// ============================================================================

/**
 * Create a totals row for the detail view
 * @param {string} icon - HTML icon string
 * @param {string} label - Row label
 * @param {string} value - Formatted value
 * @returns {string} HTML table row
 */
function createTotalRow(icon, label, value) {
  return `
    <tr>
      <td class="py-1">
        <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
          ${icon}
          <span>${label}</span>
        </div>
      </td>
      <td class="text-right py-1">
        <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${value}</span>
      </td>
    </tr>`;
}

/**
 * Create a value ± stddev cell
 * @param {string} value - Main value
 * @param {string} stdDev - Standard deviation
 * @param {string} valueWidth - CSS width class for value (default: 'w-12')
 * @param {string} stdWidth - CSS width class for stddev (default: 'w-12')
 * @returns {string} HTML cell content
 */
function createValueWithStdDev(value, stdDev, valueWidth = 'w-12', stdWidth = 'w-12') {
  return `
    <div class="flex justify-center items-center">
      <span class="${valueWidth} text-center">${value}</span>
      <span class="px-1">±</span>
      <span class="${stdWidth} text-center">${stdDev}</span>
    </div>`;
}

// ============================================================================
// Shared Chart.js Configuration
// ============================================================================

/**
 * Shared chart configuration factory to reduce duplication across chart functions.
 * Provides consistent fonts, colors, and styling for all Chart.js visualizations.
 */
const ChartConfig = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Courier New, monospace',

  /**
   * Get axis/ticks options for a given theme palette
   * @param {Object} themePalette - Theme color palette (colors.light or colors.dark)
   * @param {number} fontSize - Font size for ticks (default: 12)
   * @returns {Object} Axis configuration for scales.x or scales.y
   */
  getAxisOptions(themePalette, fontSize = 12) {
    return {
      ticks: {
        color: themePalette.axis,
        font: {
          size: fontSize,
          family: this.fontFamily
        }
      },
      grid: {
        color: themePalette.grid,
        borderColor: themePalette.border
      },
      border: {
        color: themePalette.border
      }
    };
  },

  /**
   * Get legend options for a given theme palette
   * @param {Object} themePalette - Theme color palette
   * @param {boolean} display - Whether to show legend
   * @param {string} position - Legend position (default: 'bottom')
   * @returns {Object} Legend plugin configuration
   */
  getLegendOptions(themePalette, display = true, position = 'bottom') {
    return {
      display,
      position,
      labels: {
        boxWidth: 10,
        color: themePalette.axis,
        font: {
          size: 12,
          family: this.fontFamily
        }
      }
    };
  },

  /**
   * Get tooltip font options
   * @param {number} fontSize - Font size (default: 12)
   * @returns {Object} Tooltip font configuration
   */
  getTooltipFonts(fontSize = 12) {
    return {
      titleFont: {
        size: fontSize,
        family: this.fontFamily
      },
      bodyFont: {
        size: fontSize,
        family: this.fontFamily
      }
    };
  },

  /**
   * Get common chart options (responsive, aspect ratio)
   * @returns {Object} Base chart options
   */
  getBaseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false
    };
  }
};

// Global state for main leaderboard chart
let performanceChart = null;
let DEFAULT_BENCHMARK_VERSION = null; // Must be set from manifest
let PAGE_TYPE = null; // 'main' or 'community'

// Data source configuration - using CONFIG from config.js
const DATA_BASE_URL = window.CONFIG ? window.CONFIG.getData() : '';
const IS_DEV = window.CONFIG ? window.CONFIG.environment === 'development' : false;

/**
 * Aggregate providers across all runs into a single object.
 * New schema: each run has providers as array of [name, count] tuples
 * Converts to {providerName: totalCount} format for charts.
 * @param {Array} runs - Array of run objects
 * @returns {Object} Aggregated providers {name: count}
 */
function aggregateProviders(runs) {
  const providers = {};
  for (const run of runs) {
    for (const [name, count] of run.providers || []) {
      providers[name] = (providers[name] || 0) + count;
    }
  }
  return providers;
}

/**
 * Compute totals from runs array.
 * New schema doesn't include data.total, so we compute it client-side.
 * @param {Array} runs - Array of run objects
 * @returns {Object} Totals object with input_tokens, output_tokens, total_cost, time_ms
 */
function computeTotals(runs) {
  return {
    input_tokens: runs.reduce((sum, r) => sum + (r.stats?.tokens_in_total || 0), 0),
    output_tokens: runs.reduce((sum, r) => sum + (r.stats?.tokens_out_total || 0), 0),
    // Note: Python schema only has cost_total, not separate cost_in/cost_out totals
    // We'll compute input/output costs as proportional estimates
    total_cost: runs.reduce((sum, r) => sum + (r.stats?.cost_total || 0), 0),
    time_ms: runs.reduce((sum, r) => sum + (r.stats?.time_total_ms || 0), 0),
  };
}

// Detect which page we're on
function detectPageType() {
  const pageTitle = document.title;
  if (pageTitle.includes('Community')) {
    return 'community';
  }
  return 'main';
}

/**
 * Build request path based on page type (model vs community strategy)
 * @param {string} basePath - Base path for data
 * @param {string} vendor - Model vendor (e.g., 'openai', 'google')
 * @param {string} model - Model identifier
 * @param {string} runId - Run identifier
 * @param {string} requestId - Request identifier (formatted)
 * @param {string|null} strategy - Strategy name (for community page only)
 * @param {string} filename - File to fetch (e.g., 'tool_call.json')
 * @returns {string} Complete path to request file
 */
function buildRequestPath(basePath, vendor, model, runId, requestId, strategy = null, filename =
  'tool_call.json') {
  if (PAGE_TYPE === 'community' && strategy) {
    // For strategies: basePath/strategy/runId/{requestId}/filename
    // New schema: no 'request-' prefix, just the request ID (e.g., '00031')
    return `${basePath}/${strategy}/${runId}/${requestId}/${filename}`;
  } else {
    // For models: basePath/vendor/model/runId/{requestId}/filename
    // New schema: no 'request-' prefix, just the request ID (e.g., '00031')
    return `${basePath}/${vendor}/${model}/${runId}/${requestId}/${filename}`;
  }
}

/**
 * Build base path for a run's request files
 * @param {string} basePath - Base path for data
 * @param {string} vendor - Model vendor
 * @param {string} model - Model identifier
 * @param {string} runId - Run identifier
 * @param {string} requestId - Request identifier (formatted)
 * @param {string|null} strategy - Strategy name (for community page only)
 * @returns {string} Base path for request files (without filename)
 */
function buildRequestBasePath(basePath, vendor, model, runId, requestId, strategy = null) {
  if (PAGE_TYPE === 'community' && strategy) {
    // New schema: no 'request-' prefix
    return `${basePath}/${strategy}/${runId}/${requestId}`;
  } else {
    // New schema: no 'request-' prefix
    return `${basePath}/${vendor}/${model}/${runId}/${requestId}`;
  }
}

// Get data paths based on page type and version
function getDataPaths(version, vendor = 'openai', model = 'gpt-oss-20b') {
  if (PAGE_TYPE === 'community') {
    return {
      manifestPath: `${DATA_BASE_URL}/benchmarks/strategies/manifest.json`,
      leaderboardPath: `${DATA_BASE_URL}/benchmarks/strategies/${version}/${vendor}/${model}/leaderboard.json`,
      detailBasePath: `${DATA_BASE_URL}/benchmarks/strategies/${version}/${vendor}/${model}`
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
      // For strategies: load from {strategy}/runs.json (new schema)
      detailPath = `${basePath}/${strategy}/runs.json`;
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
// Note: stats parameter is now runs array with new schema
function createRoundHistogram(runs, canvasId) {
  const rounds = runs.map(run => run.final_round);
  const maxRound = Math.max(...rounds);
  const minRound = 1;

  // Create bins from 1 to maxRound
  const bins = Array.from({
    length: maxRound
  }, (_, i) => i + minRound);

  // Extract unique seeds and sort them for consistent ordering
  // New schema: run.config.seed (instead of stat.seed)
  const seeds = [...new Set(runs.map(run => run.config?.seed || 'Unknown'))].sort();

  // Create a color palette for seeds using theme-aware colors
  const ctx = document.getElementById(canvasId).getContext('2d');
  const theme = getCurrentTheme();
  const themeColors = colors[theme] || colors.light;

  // Generate seed colors - use HSL with variations for distinction
  const seedColors = {};
  const hueStep = 360 / Math.max(seeds.length, 1);
  seeds.forEach((seed, index) => {
    const hue = (index * hueStep) % 360;
    // Base saturation of 60% with cycle of 60%, 70%, 80% to add variation between adjacent colors
    const saturation = 60 + (index % 3) * 10;
    // Lighter colors for dark mode (55%) vs darker for light mode (45%) for optimal contrast
    const lightness = theme === 'dark' ? 55 : 45;
    seedColors[seed] = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
  });

  // Create datasets - one per seed
  const datasets = seeds.map(seed => {
    const counts = bins.map(round => {
      // New schema: run.config.seed (instead of s.seed)
      return runs.filter(r => r.final_round === round && (r.config?.seed || 'Unknown') ===
          seed)
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

  const axisOptions = ChartConfig.getAxisOptions(themeColors);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins,
      datasets: datasets
    },
    options: {
      ...ChartConfig.getBaseOptions(),
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: ChartConfig.getLegendOptions(themeColors),
        title: {
          display: false
        }
      },
      scales: {
        x: {
          stacked: true,
          ...axisOptions,
          title: {
            display: true,
            text: 'Round reached',
            color: themeColors.text,
            font: {
              size: 12
            }
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ...axisOptions,
          ticks: {
            ...axisOptions.ticks,
            precision: 0,
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Count',
            color: themeColors.text,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

// Two-tailed 95% CI critical values: t(0.025, df)
// df = n - 1, where n = run_count
const T_CRIT_95 = {
  1: 12.706,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228,
  11: 2.201,
  12: 2.179,
  13: 2.160,
  14: 2.145,
  15: 2.131,
  16: 2.120,
  17: 2.110,
  18: 2.101,
  19: 2.093,
  20: 2.086,
  25: 2.060,
  30: 2.042,
  40: 2.021,
  60: 2.000,
  120: 1.980
};

function tCritical(n) {
  const df = n - 1;
  if (df <= 0) return 0;
  if (T_CRIT_95[df]) return T_CRIT_95[df];
  // For intermediate df, find closest lower key
  const keys = Object.keys(T_CRIT_95).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (keys[i] <= df) return T_CRIT_95[keys[i]];
  }
  return 1.96; // z-value fallback for large n
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
    // New schema: entry.model.vendor and entry.model.name (instead of entry.config.model)
    const vendor = entry.model.vendor;
    const model = entry.model.name;

    models.push(model);
    // New schema: avg_round and std_round (instead of avg_final_round and std_dev_final_round)
    avgRounds.push(entry.avg_round);
    stdDevs.push(entry.std_round);
    vendors.push(vendor);

    const base = themePalette.vendors[vendor];
    strokeColors.push(base);
    fillColors.push(base);
  });

  // Compute 95% CI half-widths: t(0.025, n-1) × SD / √n
  const ciHalfWidths = entries.map((entry, i) => {
    const n = entry.run_count;
    const t = tCritical(n);
    return t * stdDevs[i] / Math.sqrt(n);
  });

  // Calculate Y-axis max to include error bars
  const maxWithError = Math.max(...avgRounds.map((avg, i) => avg + ciHalfWidths[i]));
  // Add 0.5 padding above highest error bar, then round up to next integer for clean axis labels
  const yAxisMax = Math.ceil(maxWithError + 0.5);

  const axisOptions = ChartConfig.getAxisOptions(themePalette, 14);

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
            plus: ciHalfWidths,
            minus: ciHalfWidths
          }
        }
      }]
    },
    options: {
      ...ChartConfig.getBaseOptions(),
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        },
        tooltip: {
          ...ChartConfig.getTooltipFonts(),
          callbacks: {
            label: (context) => {
              const ci = ciHalfWidths[context.dataIndex];
              const avg = context.parsed.y;
              return `${avg.toFixed(1)} ± ${ci.toFixed(1)} (95% CI)`;
            }
          }
        }
      },
      scales: {
        x: {
          ...axisOptions,
          ticks: {
            ...axisOptions.ticks,
            maxRotation: 90,
            minRotation: 25
          }
        },
        y: {
          beginAtZero: true,
          max: yAxisMax,
          ...axisOptions,
          title: {
            display: true,
            text: 'Average round',
            color: themePalette.text,
            font: {
              size: 14
            },
            padding: {
              bottom: 10
            }
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
            const stdDev = ciHalfWidths[index];
            const scale = chart.scales.y;

            // Calculate error bar positions
            const topY = scale.getPixelForValue(value + stdDev);
            const bottomY = scale.getPixelForValue(value - stdDev);

            // Draw error bar with vendor-specific color
            ctx.save();
            const vendor = vendors[index];
            const base = themePalette.vendors[vendor];
            ctx.strokeStyle = base;
            // 4px line width for error bars provides good visibility without overwhelming the chart
            ctx.lineWidth = 4;

            // Draw vertical line with square caps
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.stroke();

            // Draw rounded, wider caps at top and bottom (7px from center = 14px total cap width)
            const capHalfWidth = 7;
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
// Note: data.providers is now pre-aggregated as {name: count} object
function createProviderPieChart(providers, canvasId) {
  const providerNames = Object.keys(providers || {});
  const counts = Object.values(providers || {});

  const ctx = document.getElementById(canvasId).getContext('2d');
  const theme = getCurrentTheme();
  const themeColors = colors[theme] || colors.light;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: providerNames,
      datasets: [{
        data: counts,
        borderWidth: 1
      }]
    },
    options: {
      ...ChartConfig.getBaseOptions(),
      plugins: {
        legend: ChartConfig.getLegendOptions(themeColors),
        title: {
          display: false
        }
      }
    }
  });
}

// Create inline detail row after clicked row
// Note: stats parameter is now runs array with new schema
function createDetailRow(stats, modelName, data, vendor, model, basePath, strategy = null) {
  const detailRow = document.createElement('tr');
  detailRow.className = 'detail-row bg-zinc-50 dark:bg-zinc-800';

  // New schema: compute totals and aggregate providers from runs
  const runs = stats; // stats is now runs array
  const totals = computeTotals(runs);
  const providers = aggregateProviders(runs);

  // Create detail table HTML
  let detailTableRows = '';
  runs.forEach((run) => {
    // New schema: run.stats.calls_* (instead of stat.calls.*)
    const successRate = ((run.stats.calls_success / run.stats.calls_total) * 100).toFixed(0);
    const failedRate = ((run.stats.calls_failed / run.stats.calls_total) * 100).toFixed(0);
    const errorRate = ((run.stats.calls_error / run.stats.calls_total) * 100).toFixed(0);

    // Format averages with standard deviation - New schema: run.stats.*
    const avgInputTokens = `${run.stats.tokens_in_avg.toFixed(0)}`;
    const avgInputTokensStdDev = `${run.stats.tokens_in_std.toFixed(0)}`;

    const avgOutputTokens = `${run.stats.tokens_out_avg.toFixed(0)}`;
    const avgOutputTokensStdDev = `${run.stats.tokens_out_std.toFixed(0)}`;

    // Convert time from ms to seconds
    const avgTimeSeconds = `${(run.stats.time_avg_ms / 1000).toFixed(2)}`;
    const avgTimeSecondsStdDev = `${(run.stats.time_std_ms / 1000).toFixed(2)}`;

    // Cost per tool calls (m$)
    const avgCost = `${(run.stats.cost_avg * 1000).toFixed(2)}`;
    const costStdDev = `${(run.stats.cost_std * 1000).toFixed(2)}`;

    // New schema: run.config.seed (instead of stat.seed) and run.final_round
    detailTableRows += `
      <tr class="hover:bg-zinc-200 hover:dark:bg-zinc-700 text-xs">
        <td class="px-2 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">${run.config?.seed || 'Unknown'}</td>
        <td class="px-2 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">${run.final_round}</td>
        <td class="px-2 py-2 text-center text-green-600 dark:text-green-400 font-mono">${successRate}%</td>
        <td class="px-2 py-2 text-center text-yellow-600 dark:text-yellow-400 font-mono">${failedRate}%</td>
        <td class="px-2 py-2 text-center text-red-600 dark:text-red-400 font-mono">${errorRate}%</td>
        <td class="px-4 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-10 xl:w-12 text-center">${avgInputTokens}</span>
            <span class="px-1">±</span>
            <span class="w-8 text-center">${avgInputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">
          <div class="flex justify-center items-center">
            <span class="w-10 xl:w-12 text-center">${avgOutputTokens}</span>
            <span class="px-1">±</span>
            <span class="w-8 text-center">${avgOutputTokensStdDev}</span>
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
              <tr id="total-input-tokens">
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
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(totals.input_tokens / 1000000).toFixed(2)} M</span>
                </td>
              </tr>
              <tr id="total-output-tokens">
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
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(totals.output_tokens / 1000000).toFixed(2)} M</span>
                </td>
              </tr>
              <tr id="total-total-price">
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
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(totals.total_cost).toFixed(2)} $</span>
                </td>
              </tr>
              <tr id="total-time">
                <td class="py-1">
                  <div class="flex items-center justify-left space-x-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
                      <path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clip-rule="evenodd" />
                    </svg>
                    <span>time</span>
                  </div>
                </td>
                <td class="text-right py-1">
                  <span class="text-sm font-mono text-zinc-700 dark:text-zinc-300">${(totals.time_ms / 1000).toFixed(0)} s</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="overflow-x-auto rounded-lg shadow-lg" style="max-height: 180px; overflow-y: auto;">
        <table id="detail-runs-table" class="w-full table-auto">
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

  // Prepare chart initialization to be called after the row is inserted into the DOM
  detailRow._initCharts = () => {
    try {
      createRoundHistogram(runs, histogramCanvasId);
      createProviderPieChart(providers, pieChartCanvasId);
    } catch (e) {
      console.error('Failed to initialize detail charts', e);
    }
  };

  // Make each per-run row clickable to open Run Viewer (if runs mapping exists)
  const perRunTable = detailRow.querySelector('table.table-auto');
  const tbody = perRunTable ? perRunTable.querySelector('tbody') : null;
  if (tbody) {
    const tableRows = Array.from(tbody.querySelectorAll('tr'));
    // New schema: extract run IDs from runs array (runs[].id)
    const runIds = runs.map(r => r.id);
    if (runIds && runIds.length > 0 && tableRows.length > 0) {
      const count = Math.min(runIds.length, tableRows.length);
      for (let i = 0; i < count; i++) {
        const tr = tableRows[i];
        tr.classList.add('cursor-pointer');
        tr.title = 'Open run viewer';
        tr.setAttribute('role', 'button');
        tr.addEventListener('click', async (e) => {
          e.stopPropagation();
          const runId = runIds[i];
          if (!runId) return;
          // Probe first request (00001) to verify run data exists before opening viewer
          const reqId = '00001';
          const probeUrl = buildRequestPath(basePath, vendor, model, runId, reqId, strategy);
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
            startIndex: 1,
            runs: runIds, // Pass run IDs array
            runIndex: i
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

    // Create the performance bar chart (only on main leaderboard page) immediately
    if (showChart) {
      try {
        createPerformanceBarChart(data.entries);
      } catch (_) {
        // Chart creation failure is non-critical; leaderboard table still functional
      }
    }

    data.entries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.className =
        'hover:bg-zinc-200 hover:dark:bg-zinc-700 transition-colors duration-150 lg:cursor-pointer';

      // Parse data based on display mode
      let primaryValue, secondaryValue, vendor, model;

      if (displayMode === 'community') {
        // For strategies: entries have strategy objects, model is at data top level
        // New schema: data.model.vendor and data.model.name
        vendor = data.model.vendor;
        model = data.model.name;
        primaryValue = entry.strategy.name;
        secondaryValue = entry.strategy.author;
      } else {
        // For models: entries have model objects
        // New schema: entry.model.vendor and entry.model.name
        vendor = entry.model.vendor;
        model = entry.model.name;
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
            // New schema: entry.strategy.name (instead of entry.config.strategy)
            const strategy = displayMode === 'community' ? entry.strategy.name : null;
            const data = await loadDetails(vendor, model, detailBasePath, strategy);
            const detailRow = createDetailRow(
              data.runs, // New schema: data.runs (instead of data.stats)
              displayMode === 'community' ? primaryValue : model,
              data,
              vendor,
              model,
              detailBasePath,
              strategy
            );
            row.insertAdjacentElement('afterend', detailRow);
            if (typeof detailRow._initCharts === 'function') {
              detailRow._initCharts();
            }
          }
        }
      });

      // Calculate percentages - New schema: entry.stats.calls_* (instead of entry.calls.*)
      const successRate = ((entry.stats.calls_success / entry.stats.calls_total) * 100)
        .toFixed(0);
      const failureRate = ((entry.stats.calls_failed / entry.stats.calls_total) * 100)
        .toFixed(0);
      const errorRate = ((entry.stats.calls_error / entry.stats.calls_total) * 100).toFixed(
        0);

      // Format averages with standard deviation - New schema: avg_round/std_round and stats.*
      const avgRound = `${entry.avg_round.toFixed(1)}`;
      const avgRoundStdDev = `${entry.std_round.toFixed(1)}`;

      const avgInputTokens = `${entry.stats.tokens_in_avg.toFixed(0)}`;
      const avgInputTokensStdDev = `${entry.stats.tokens_in_std.toFixed(0)}`;

      const avgOutputTokens = `${entry.stats.tokens_out_avg.toFixed(0)}`;
      const avgOutputTokensStdDev = `${entry.stats.tokens_out_std.toFixed(0)}`;

      // Convert time from ms to seconds
      const avgTimeSeconds = `${(entry.stats.time_avg_ms / 1000).toFixed(2)}`;
      const avgTimeSecondsStdDev = `${(entry.stats.time_std_ms / 1000).toFixed(2)}`;

      // Cost per tool calls (m$)
      const cost = `${(entry.stats.cost_avg * 1000).toFixed(2)}`;
      const costStdDev = `${(entry.stats.cost_std * 1000).toFixed(2)}`;

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
            <span class="w-10 xl:w-12 text-center">${avgInputTokens}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-8 text-center hidden xl:inline">${avgInputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden lg:table-cell">
          <div class="flex justify-center items-center">
            <span class="w-10 xl:w-12 text-center">${avgOutputTokens}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-8 text-center hidden xl:inline">${avgOutputTokensStdDev}</span>
          </div>
        </td>
        <td class="px-3 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden md:table-cell">
          <div class="flex justify-center items-center">
            <span class="w-12 text-center">${avgTimeSeconds}</span>
            <span class="px-1 hidden xl:inline">±</span>
            <span class="w-12 text-center hidden xl:inline">${avgTimeSecondsStdDev}</span>
          </div>
        </td>
        <td class="px-3 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono hidden md:table-cell">
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

// ============================================================================
// Twitch Stream - Show only when live
// ============================================================================

function initTwitchPlayer() {
  const container = document.getElementById('twitch-stream-container');
  if (!container || typeof Twitch === 'undefined') return;

  const player = new Twitch.Player('twitch-player', {
    channel: 'S1M0N38',
    width: '100%',
    height: '100%',
    parent: ['balatrobench.com', 'localhost'],
    muted: true,
    autoplay: true,
  });

  player.addEventListener(Twitch.Player.ONLINE, () => {
    container.classList.remove('hidden');
  });

  player.addEventListener(Twitch.Player.OFFLINE, () => {
    container.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Detect page type
  PAGE_TYPE = detectPageType();

  // Initialize version selector for both pages
  initBenchmarkVersionSelector();

  // Initialize quotes rotation (if on a page with quotes)
  initQuotesRotation();

  // Initialize Twitch player (show only when live)
  initTwitchPlayer();
});

// ============================================================================
// Quotes Rotation
// ============================================================================

const QUOTE_ROTATION_INTERVAL_MS = 10000; // 10 seconds between quotes

async function initQuotesRotation() {
  const container = document.getElementById('quote-container');
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');

  if (!container || !textEl || !authorEl) return; // Not on a page with quotes

  try {
    const response = await fetch('assets/quotes.json');
    if (!response.ok) return;
    const data = await response.json();
    const quotes = data.quotes;

    if (!quotes || quotes.length === 0) return;

    let currentIndex = Math.floor(Math.random() * quotes.length);
    let isTransitioning = false;
    let autoRotateTimer = null;

    function displayQuote(index) {
      const quote = quotes[index];
      textEl.textContent = `"${quote.text}"`;
      authorEl.textContent = ` — ${quote.vendor} / ${quote.model}`;
    }

    function getRandomIndex() {
      // Pick a random index different from current
      if (quotes.length <= 1) return 0;
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * quotes.length);
      } while (newIndex === currentIndex);
      return newIndex;
    }

    function transitionToNext() {
      if (isTransitioning) return;
      isTransitioning = true;

      currentIndex = getRandomIndex();
      // Fade out container
      container.style.opacity = '0';
      // After fade out (1s), update and fade in
      setTimeout(() => {
        displayQuote(currentIndex);
        container.style.opacity = '1';
        isTransitioning = false;
      }, 1000);
    }

    function resetAutoRotate() {
      if (autoRotateTimer) clearInterval(autoRotateTimer);
      autoRotateTimer = setInterval(transitionToNext, QUOTE_ROTATION_INTERVAL_MS);
    }

    // Display first quote immediately
    displayQuote(currentIndex);

    // Click on quote link opens Kaggle notebook (handled by <a> in HTML)

    // Start auto-rotation
    resetAutoRotate();

  } catch (e) {
    console.error('Failed to load quotes:', e);
  }
}

// ===== Run Viewer (modal) =====
function formatRequestId(n) {
  return String(n).padStart(5, '0');
}
async function fetchTextSafe(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    // Network errors or invalid response handled gracefully by returning null
    return null;
  }
}
async function fetchJsonSafe(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // Network errors, invalid JSON, or invalid response handled gracefully by returning null
    return null;
  }
}

// ===== LRU Cache for Request Content =====
class RequestCache {
  constructor(maxSize = 20) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // Move to end (most recently used)
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }
}

const requestContentCache = new RequestCache(20);

function openRunViewer({
  basePath,
  vendor,
  model,
  runId,
  strategy = null,
  startIndex = 1,
  runs = [],
  runIndex = 0
}) {
  const state = {
    basePath,
    vendor,
    model,
    runId,
    strategy,
    index: startIndex,
    runs,
    runIndex,
    requestIndices: {
      [runId]: startIndex
    },
    totalRequests: {},
    overlay: null,
    keyHandler: null
  };
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4';
  overlay.innerHTML = RunViewerTemplates.modal;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  state.overlay = overlay;

  const helpPopup = overlay.querySelector('#run-help-popup');
  const toggleHelp = () => {
    helpPopup.classList.toggle('hidden');
  };

  overlay.querySelector('#run-close').addEventListener('click', () => closeRunViewer(state));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeRunViewer(state);
  });

  state.keyHandler = (e) => {
    if (e.key === 'Escape') return closeRunViewer(state);
    if (e.key === '?') {
      e.preventDefault();
      return toggleHelp();
    }
    if (e.key === 'ArrowLeft' || e.key === 'h') return navigateRun(state, -1);
    if (e.key === 'ArrowRight' || e.key === 'l') return navigateRun(state, +1);
    if (e.key === 'ArrowUp' || e.key === 'k') return navigateRunVertical(state, -1);
    if (e.key === 'ArrowDown' || e.key === 'j') return navigateRunVertical(state, +1);
  };
  window.addEventListener('keydown', state.keyHandler);

  loadAndRenderRequest(state);
}

async function discoverTotalRequests(state) {
  const {
    basePath,
    vendor,
    model,
    runId,
    strategy
  } = state;

  // Binary search to find the last valid request
  let low = 1;
  // Upper bound of 1000 requests per run covers typical game lengths
  let high = 1000;
  let maxFound = 1;

  // First, find upper bound
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const reqId = formatRequestId(mid);
    const probeUrl = buildRequestPath(basePath, vendor, model, runId, reqId, strategy);
    const exists = await fetchJsonSafe(probeUrl);
    if (exists) {
      maxFound = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return maxFound;
}

async function loadAndRenderRequest(state, prefetch = false) {
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
  const runBase = buildRequestBasePath(basePath, vendor, model, runId, reqId, strategy);
  const cacheKey = `${runId}:${index}`;

  let content;
  const cached = requestContentCache.get(cacheKey);

  if (cached) {
    content = cached;
  } else {
    const [reasoning, toolcall, strategyMd, gamestateMd, memoryMd, metadata] = await Promise.all([
      fetchTextSafe(`${runBase}/reasoning.md`),
      fetchJsonSafe(`${runBase}/tool_call.json`),
      fetchTextSafe(`${runBase}/strategy.md`),
      fetchTextSafe(`${runBase}/gamestate.md`),
      fetchTextSafe(`${runBase}/memory.md`),
      fetchJsonSafe(`${runBase}/metadata.json`)
    ]);
    content = {
      reasoning,
      toolcall,
      strategyMd,
      gamestateMd,
      memoryMd,
      metadata,
      runBase
    };
    requestContentCache.set(cacheKey, content);
  }

  // If prefetching, just cache - don't render
  if (prefetch) return;

  const {
    reasoning,
    toolcall,
    strategyMd,
    gamestateMd,
    memoryMd,
    metadata
  } = content;

  // Discover total requests for this run if not cached
  if (!state.totalRequests[runId]) {
    state.totalRequests[runId] = await discoverTotalRequests(state);
  }
  const totalRequests = state.totalRequests[runId];

  // Build title: [vendor/model] • [seed] • Run [X/Y] • Request [N/Total]
  // Extract seed from runId (format: 20260109_170402_590_RED_WHITE_BBBBBBB)
  // The seed is the last underscore-separated part
  const runIdParts = runId.split('_');
  const seed = runIdParts.length > 0 ? runIdParts[runIdParts.length - 1] : 'Unknown';
  const runNumber = state.runs && state.runs.length > 0 ? state.runIndex + 1 : null;
  const totalRuns = state.runs ? state.runs.length : null;

  // Tokens icon from icons.svg
  const tokensIcon =
    `<svg class="w-3 h-3 inline-block text-zinc-600 dark:text-zinc-300"><use href="icons.svg#icon-tokens"></use></svg>`;

  let title = `${vendor}/${model} • ${seed}`;
  if (runNumber !== null && totalRuns !== null) {
    title += ` • Run ${runNumber}/${totalRuns}`;
  }
  title += ` • Request ${index}/${totalRequests}`;

  // Add tokens and cost if metadata exists
  // New schema: tokens_in/tokens_out and cost_in/cost_out (flattened, not nested)
  if (metadata && (metadata.tokens_in !== undefined || metadata.cost_in !== undefined)) {
    const promptTokens = metadata.tokens_in || 0;
    const completionTokens = metadata.tokens_out || 0;
    const promptCost = metadata.cost_in || 0;
    const completionCost = metadata.cost_out || 0;

    title += ` • ${tokensIcon} in/out ${promptTokens}/${completionTokens}`;
    title += ` • $ in/out ${promptCost.toFixed(4)}/${completionCost.toFixed(4)}`;
  }

  overlay.querySelector('#run-title').innerHTML = title;

  const imgEl = overlay.querySelector('#run-screenshot');

  // Parallel format detection using HEAD requests
  const formats = ['webp', 'png', 'avif'];
  const formatProbes = formats.map(async (format) => {
    const url = `${content.runBase}/screenshot.${format}`;
    try {
      const response = await fetch(url, {
        method: 'HEAD'
      });
      if (response.ok) return url;
    } catch {
      /* format unavailable */
    }
    return null;
  });

  Promise.all(formatProbes).then(results => {
    const availableUrl = results.find(r => r !== null);
    if (availableUrl) {
      imgEl.src = availableUrl;
    } else {
      imgEl.alt = 'Screenshot not available';
    }
  });

  overlay.querySelector('#run-strategy').textContent = strategyMd || '(No strategy.md)';
  overlay.querySelector('#run-gamestate').textContent = gamestateMd || '(No gamestate.md)';
  overlay.querySelector('#run-memory').textContent = memoryMd || '(No memory.md)';
  overlay.querySelector('#run-reasoning').textContent = reasoning || '(No reasoning.md)';

  const toolCallDiv = overlay.querySelector('#run-tool-call');
  if (!toolcall) {
    toolCallDiv.textContent = '(No tool_call.json)';
  } else {
    const tc = Array.isArray(toolcall) ? toolcall[0] : toolcall;
    const name = tc && tc.function && tc.function.name ? tc.function.name : '(unknown)';
    let argsRaw = tc && tc.function ? tc.function.arguments : '';

    // Parse arguments and remove reasoning field
    let argsObj = {};
    if (typeof argsRaw === 'string') {
      try {
        argsObj = JSON.parse(argsRaw);
      } catch {
        // Invalid JSON defaults to empty object
        argsObj = {};
      }
    } else if (argsRaw && typeof argsRaw === 'object') {
      argsObj = argsRaw;
    }

    // Remove reasoning field if it exists
    if (argsObj && typeof argsObj === 'object') {
      delete argsObj.reasoning;
    }

    // Format as single-line JSON
    let argsString = '{}';
    try {
      argsString = JSON.stringify(argsObj);
    } catch {
      // Stringify failure defaults to empty object string
      argsString = '{}';
    }

    // Display as function_name(arguments)
    toolCallDiv.textContent = `${name}(${argsString})`;
  }

  // Prefetch adjacent requests in background
  prefetchAdjacentRequests(state);
}

function prefetchAdjacentRequests(state) {
  const {
    runId,
    index
  } = state;

  // Prefetch previous
  if (index > 1 && !requestContentCache.has(`${runId}:${index - 1}`)) {
    loadAndRenderRequest({
      ...state,
      index: index - 1
    }, true).catch(() => {});
  }

  // Prefetch next
  if (!requestContentCache.has(`${runId}:${index + 1}`)) {
    loadAndRenderRequest({
      ...state,
      index: index + 1
    }, true).catch(() => {});
  }
}

async function navigateRun(state, delta) {
  const old = state.index;
  state.index = Math.max(1, old + delta);
  const reqId = formatRequestId(state.index);
  const probe = buildRequestPath(
    state.basePath,
    state.vendor,
    state.model,
    state.runId,
    reqId,
    state.strategy
  );
  const ok = await fetchJsonSafe(probe);
  if (!ok) {
    state.index = old;
    return;
  }
  loadAndRenderRequest(state);
}

async function navigateRunVertical(state, delta) {
  // Check if we have runs array
  if (!state.runs || state.runs.length === 0) return;

  // Calculate new run index with boundary checking (no wrapping)
  const newRunIndex = state.runIndex + delta;
  if (newRunIndex < 0 || newRunIndex >= state.runs.length) {
    return; // At boundary, do nothing
  }

  // Save current request index for current run
  state.requestIndices[state.runId] = state.index;

  // Update to new run
  state.runIndex = newRunIndex;
  state.runId = state.runs[newRunIndex];

  // Restore or initialize request index for new run (default to 1)
  state.index = state.requestIndices[state.runId] || 1;

  // Render the new run
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

  // Respect ?version= query param if present
  try {
    const url = new URL(window.location.href);
    const urlVersion = url.searchParams.get('version');
    if (urlVersion && versions.some(v => v.version === urlVersion)) {
      sel.value = urlVersion;
    }
  } catch (_) {
    // Invalid URL or query param parsing failure is non-critical; use default version
  }


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
  sel.addEventListener('change', () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('version', sel.value);
      window.history.replaceState({}, '', url.toString());
    } catch (_) {
      // URL update failure is non-critical; version change still applied
    }
    applyVersion(sel.value);
  });
}
