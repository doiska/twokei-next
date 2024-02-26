FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm ci

CMD ["npm", "run", "start:dev-shard"]
