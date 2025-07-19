FROM node:lts-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ENV CHOKIDAR_USEPOLLING=true

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]