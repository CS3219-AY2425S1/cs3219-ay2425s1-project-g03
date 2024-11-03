FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 8086

CMD ["npm", "start"]