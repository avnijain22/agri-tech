# Builds the React client, then serves it from the Express server (single container)
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY server/package*.json ./server/
RUN npm --prefix server install --omit=dev
COPY server/ ./server/
COPY --from=client /app/client/dist ./client/dist
EXPOSE 5000
CMD ["node", "server/src/index.js"]
