FROM node:lts-bookworm-slim

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

ENTRYPOINT ["npm", "run"]

CMD ["start"]
