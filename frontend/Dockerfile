FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @angular/cli@18.0.0
COPY . .
EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]
