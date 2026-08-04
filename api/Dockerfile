FROM node:22.23.2-bookworm

WORKDIR /app

COPY package*.json .

RUN npm install --ignore-scripts

COPY . .

CMD [ "node", "app.js" ]
