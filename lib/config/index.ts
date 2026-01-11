/**
 * Application Configuration
 * 
 * Centralized configuration management for the application.
 * All environment variables and app settings are accessed through this module.
 */

// ============================================================================
// Environment Configuration
// ============================================================================

export const config = {
  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Implementation Automation Platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // API
  api: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableDebug: process.env.ENABLE_DEBUG_LOGS === 'true',
  },

  // Feature Flags
  features: {
    bulkOperations: process.env.FEATURE_BULK_OPERATIONS === 'true',
    advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  },

  // External Services (Future)
  services: {
    smsProvider: {
      apiKey: process.env.SMS_PROVIDER_API_KEY || '',
    },
    emailService: {
      apiKey: process.env.EMAIL_SERVICE_API_KEY || '',
    },
    provisioning: {
      url: process.env.PROVISIONING_API_URL || '',
      apiKey: process.env.PROVISIONING_API_KEY || '',
    },
  },
} as const;

// ============================================================================
// Validation
// ============================================================================

export function validateConfig() {
  const errors: string[] = [];

  if (!config.database.url && config.app.isProduction) {
    errors.push('DATABASE_URL is required in production');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

// Validate on import in production
if (config.app.isProduction) {
  validateConfig();
}

export default config;
