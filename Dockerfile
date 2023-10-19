# syntax=docker/dockerfile:1

# Build
FROM node:18-alpine as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm ci --silent
COPY . ./

RUN npm config set update-notifier false

EXPOSE 5000

CMD ["npm", "start"]