# Base image for the container
FROM node:18.19.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY ./angular/package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# RUN npm install -g @angular/cli@19

# Copy the rest of the application code
COPY ./angular ./

# Build the shared library first
RUN npm run build:library

# Optional: link the library if your apps depend on npm link
RUN npm run library:link

RUN npm run build:app:public-nrced

EXPOSE 4300

# CMD ["npm" "start"]
