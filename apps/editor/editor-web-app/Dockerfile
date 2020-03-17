FROM node:12.16.1-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod


FROM nginx:1.17-alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/editor-web-app /usr/share/nginx/html
EXPOSE 80
