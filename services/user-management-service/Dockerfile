FROM node:lts-bookworm-slim

RUN apt update && apt upgrade -y openssl

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npx prisma generate

ENTRYPOINT ["npm", "run"]

CMD ["start"]
