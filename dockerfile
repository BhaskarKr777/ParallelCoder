# for frontend

FROM node:20.18.0-alpine as frontend-builder

ARG VITE_YJS_URL=ws://localhost:1234
ENV VITE_YJS_URL=$VITE_YJS_URL

WORKDIR /app

COPY ./Frontend/package.json ./Frontend/package-lock.json ./
RUN npm ci

COPY ./Frontend ./
RUN npm run build

# for backend

FROM node:20.18.0-alpine as backend-builder

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY ./Backend/package.json ./Backend/package-lock.json ./
RUN npm ci

COPY ./Backend ./
RUN npx prisma generate

COPY --from=frontend-builder /app/dist /app/Public

RUN chown -R node:node /app

ENV NODE_ENV=production

CMD [ "sh", "-c", "npx prisma migrate deploy && node server.js" ]