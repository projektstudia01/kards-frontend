FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

# Build-time arguments dla Vite
ARG VITE_API_BASE_URL
ARG VITE_API_WS_GATEWAY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_WS_GATEWAY=$VITE_API_WS_GATEWAY

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
