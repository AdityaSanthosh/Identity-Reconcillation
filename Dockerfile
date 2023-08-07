FROM node:18-alpine AS builder

RUN apk add curl bash


# Create app directory
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/build ./dist

EXPOSE 3000
CMD [ "npm", "run", "start" ]