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

# Build everything
RUN npm run build:prod

# Serve the production builds
CMD ["npm", "run", "start-prod"]

# Expose the ports
EXPOSE 4200 4200
EXPOSE 4300 4300
EXPOSE 4400 4400
