FROM node:18.17.0-alpine AS base

# Directory used in container
WORKDIR /usr/api/

# Copy everything
COPY . .

##################
### PROD IMAGE ###
##################
FROM node:18.17.0-alpine AS prod
ENV NODE_ENV=production

# Add curl for health check
RUN apk --update --no-cache add curl

# Directory used in container
WORKDIR /usr/api/

# Install packages. Needed even for compiled build.
COPY package.json .
RUN yarn

# Copy compiled build from base
COPY --from=base /usr/api .

CMD [ "node", "app.js" ]
