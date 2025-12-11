FROM node:18.19.1

WORKDIR /app

COPY package*.json .

RUN npm install --ignore-scripts

COPY . .

CMD [ "node", "app.js" ]
