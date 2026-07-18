#for frontend

FROM node:20-alpine as frontend-builder

# The Yjs websocket server is its own process/port even in
# production (see docker-compose.yml), so its URL is baked into the
# frontend bundle at build time rather than hardcoded.
ARG VITE_YJS_URL=ws://localhost:1234
ENV VITE_YJS_URL=$VITE_YJS_URL

COPY ./Frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

#for backend

FROM node:20-alpine as backend-builder

WORKDIR /app

COPY ./Backend /app

RUN npm install

RUN npx prisma generate

COPY --from=frontend-builder /app/dist /app/Public

# Two processes share this image: the API (server.js, also serves
# the frontend build above) and the standalone Yjs websocket server
# (websocket/yjs-server.js). docker-compose.yml runs each as its own
# service from this same image via `command:` overrides, and runs
# `npx prisma migrate deploy` as a one-off service before either
# starts. CMD here is just the default for `docker run` with no
# override.
CMD [ "node", "server.js" ]