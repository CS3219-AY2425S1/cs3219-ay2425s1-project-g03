FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 8084

CMD ["npm", "start"]