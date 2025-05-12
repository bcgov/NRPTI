# This Dockerfile works, however it uses the 'ng serve' command, which isn't supposed to be used in production

# Base image for the container
FROM node:18.19-alpine

# Set the working directory
WORKDIR /app/

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build for production - clean, build library, and build admin-nrpti
RUN npm run build:prod:only-nrpti

# Install a simple server to serve static files
RUN npm install -g serve

# Make entrypoint script executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port 4200
EXPOSE 4200

# Use the entrypoint script
CMD ["/app/entrypoint.sh"]
