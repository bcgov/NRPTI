#!/bin/sh

# Update env.js with environment variables
cd /app/dist/public-nrced

# Create or update env.js with environment variables
cat > env.js << EOF
(function (window) {
    window.__env = window.__env || {};

    // Debug mode
    window.__env.debugMode = ${DEBUG_MODE:-false};

    // Environment name
    window.__env.ENVIRONMENT = '${ENVIRONMENT:-dev}';

    // API configuration
    window.__env.API_LOCATION = '${API_LOCATION:-http://localhost:3000}';
    window.__env.API_PATH = '${API_PATH:-/api}';
    window.__env.API_PUBLIC_PATH = '${API_PUBLIC_PATH:-/api/public}';
    
    // This is a hardcoded variable that does not come from the backend
    window.__env.APPLICATION = 'NRCED';
    
    // Add any feature-toggles
    window.__env.FEATURE_FLAG = {
      "nris-emli-importer": ${FEATURE_FLAG_NRIS_EMLI_IMPORTER:-true}
    };
}(this));
EOF

# Start the server
exec serve -s /app/dist/public-nrced -p 4400