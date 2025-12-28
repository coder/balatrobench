/**
 * Configuration file for BalatroBench
 * Controls data source locations
 */

const CONFIG = {
  // Current active environment - change this to switch environments
  environment: 'development',
  // environment: 'production',

  // Environment configurations
  environments: {
    development: {
      name: 'Development',
      data: '' // Local data - use relative paths
    },
    production: {
      name: 'Production',
      data: 'https://balatrobench.b-cdn.net' // CDN data
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
