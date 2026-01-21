/**
 * Configuration file for BalatroBench
 * Controls data source locations
 */

const CONFIG = {
  // Auto-detect environment based on hostname
  // Override with query param: ?env=development or ?env=production
  environment: (() => {
    const params = new URLSearchParams(window.location.search);
    const envOverride = params.get('env');
    if (envOverride === 'development' || envOverride === 'production') {
      return envOverride;
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'development';
    }
    return 'production';
  })(),

  // Environment configurations
  environments: {
    development: {
      name: 'Development',
      data: '' // Local data - use relative paths
    },
    production: {
      name: 'Production',
      data: 'https://balatrobench-prod.b-cdn.net' // CDN data
    }
  },

  // Get current environment
  getCurrent() {
    return this.environments[this.environment] || this.environments.development;
  },

  // Get data URL for current environment
  getData() {
    return this.getCurrent().data;
  }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
