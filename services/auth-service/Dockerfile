FROM node:lts-bookworm-slim

<<<<<<< HEAD
RUN apt update && apt install -y openssl
=======
RUN apt update && apt upgrade -y openssl
>>>>>>> 088b782 (auth service fixed and /validate added)

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npx prisma generate

ENTRYPOINT ["npm", "run"]

CMD ["dev"]
