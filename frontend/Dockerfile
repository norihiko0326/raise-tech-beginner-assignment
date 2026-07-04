FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_PUBLIC_API_URL=http://localhost

RUN npm run build -- --no-lint

EXPOSE 3000

CMD ["npm", "start"]
