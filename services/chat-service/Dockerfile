FROM node:lts-bookworm-slim

RUN apt update && apt upgrade -y && apt install -y sqlite3

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

ENTRYPOINT ["npm", "run"]

CMD ["start"]
