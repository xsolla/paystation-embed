FROM node:10.24.1

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3100

CMD ["npm", "run", "dev"]
