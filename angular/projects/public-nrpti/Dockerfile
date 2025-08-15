# Base image for the container
FROM node:18.19 AS build

# Set the working directory
WORKDIR /app/

# Copy package.json and package-lock.json first to leverage Docker cache
COPY ./angular/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

WORKDIR /app/angular

# Build for production - clean, build library, and build public-nrpti
RUN npm run build:library && \
    cd dist/nrpti-angular-components && \
    npm link && \
    cd /app/angular && \
    npm link nrpti-angular-components && \
    npm run build:app:public-nrced

# Install a simple server to serve static files
RUN npm install -g serve

FROM node:18.19 AS production

# Make entrypoint script for public-nrpti
COPY --from=build ./angular/projects/public-nrpti/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port 80
EXPOSE 4300

# Use the entrypoint script
CMD ["/app/entrypoint.sh"] 