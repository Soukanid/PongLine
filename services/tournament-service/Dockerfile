FROM node:lts-bookworm-slim

RUN apt update && apt upgrade -y 

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

ENTRYPOINT ["npm", "run"]

CMD ["start"]
