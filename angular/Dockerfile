# This Dockerfile works, however it uses the 'ng serve' command, which isn't supposed to be used in production

# Base image for the container
FROM node:18.19-alpine AS build

# Set the working directory
WORKDIR /app/

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build only the admin-nrpti app with its required common components and globals
RUN npm run build:prod:only-nrpti

# Serve the app with NGINX
FROM nginx:alpine

# Copy the built app to the NGINX html directory
COPY --from=build /app/dist/admin-nrpti /usr/share/nginx/html

# Ensure env.js is available at runtime - copy it separately to ensure it's not being optimized away
COPY --from=build /app/projects/admin-nrpti/src/env.js /usr/share/nginx/html/env.js

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
