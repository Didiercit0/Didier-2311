FROM node:24-alpine AS frontend-build
WORKDIR /app
COPY [Ff]rontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY [Ff]rontend/ ./
ENV VITE_SNAILPAY_URL=/snailpay/payments
RUN npm run build

FROM node:24-alpine AS snailpay-build
WORKDIR /app
COPY [Ss]nail[Pp]ay/package*.json ./
RUN npm ci --no-audit --no-fund
COPY [Ss]nail[Pp]ay/ ./
RUN npm run build

FROM node:24-alpine AS snailpay
ENV NODE_ENV=production
WORKDIR /app
COPY [Ss]nail[Pp]ay/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=snailpay-build /app/dist ./dist
USER node
EXPOSE 4001
CMD ["node", "dist/index.js"]

FROM nginxinc/nginx-unprivileged:stable-alpine AS frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 8080
