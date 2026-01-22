FROM debian:bookworm-slim

RUN apt update -y && apt upgrade -y && apt install nodejs npm -y

RUN mkdir /app

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

CMD ["npm", "run"]
