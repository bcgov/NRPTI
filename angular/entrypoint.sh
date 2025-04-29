#!/bin/sh

# Update env.js with environment variables
cd /app/dist/admin-nrpti

# Get the actual hostname from the HTTP_HOST environment variable or use a default
ACTUAL_URL=${HOST_URL:-http://localhost}

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
    
    // Keycloak settings
    window.__env.KEYCLOAK_CLIENT_ID = '${KEYCLOAK_CLIENT_ID:-nrpti-4869}';
    window.__env.KEYCLOAK_URL = '${KEYCLOAK_URL:-https://dev.loginproxy.gov.bc.ca/auth}';
    window.__env.KEYCLOAK_REALM = '${KEYCLOAK_REALM:-standard}';
    window.__env.KEYCLOAK_ENABLED = ${KEYCLOAK_ENABLED:-true};
    window.__env.REDIRECT_URI = '${REDIRECT_URI:-$ACTUAL_URL}';

    // Application settings
    window.__env.APPLICATION = '${APPLICATION:-NRPTI}';
    window.__env.FEATURE_FLAG = {
      "nris-emli-importer": ${FEATURE_FLAG_NRIS_EMLI_IMPORTER:-true}
    };

    // Import component defaults
    window.__env.IMPORT_TABLE_INTERVAL = ${IMPORT_TABLE_INTERVAL:-15000};
    window.__env.DEFAULT_IMPORT_TABLE_QUERY_PARAMS = {
        pathAPI: window.__env.API_LOCATION + window.__env.API_PATH,
        keys: '',
        dataset: ['Task'],
        fields: [],
        pageNum: 1,
        pageSize: ${IMPORT_TABLE_PAGE_SIZE:-20},
        sortBy: '${IMPORT_TABLE_SORT_BY:--startDate}'
    };
}(this));
EOF

# Start the server
exec serve -s /app/dist/admin-nrpti -p 80 