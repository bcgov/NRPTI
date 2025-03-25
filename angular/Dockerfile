# This Dockerfile works, however it uses the 'ng serve' command, which isn't supposed to be used in production

# Base image for the container
FROM node:18.19-alpine AS base

# Set the working directory
WORKDIR /app/

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build common folders and the NRPTI app
RUN npm run build:prod:only-nrpti

# Serve the app with NGINX
FROM nginx:alpine

COPY --from=base /app/dist/admin-nrpti /usr/share/nginx/html

# Expose port 80
EXPOSE 80 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
