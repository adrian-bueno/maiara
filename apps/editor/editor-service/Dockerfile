FROM node:12.18.4-alpine as builder

ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_COLOR=false

ENV PACKAGES_ROOT_DIR=./packages/nodejs-packages
ENV APP_ROOT_DIR=./apps/editor/editor-service

WORKDIR /usr/src/build

# Install general devDependencies
COPY lerna.json ./
COPY package*.json ./
RUN npm install

# Copy package.json from node-packages
COPY $PACKAGES_ROOT_DIR/core/package*.json $PACKAGES_ROOT_DIR/core/
COPY $PACKAGES_ROOT_DIR/minio/package*.json $PACKAGES_ROOT_DIR/minio/

# Copy editor-service package.json
COPY $APP_ROOT_DIR/package*.json $APP_ROOT_DIR/

RUN npm run bootstrap

# Copy everything from node-packages
COPY $PACKAGES_ROOT_DIR/core $PACKAGES_ROOT_DIR/core/
COPY $PACKAGES_ROOT_DIR/minio $PACKAGES_ROOT_DIR/minio/

# Copy everything from editor-service
COPY $APP_ROOT_DIR $APP_ROOT_DIR/

# Build packages and editor-service
RUN npm run build

# Remove devDependencies from root
RUN npm prune --production
# RUN npm run clean:devDependencies



FROM node:12.18.4-alpine

ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

COPY --from=builder /usr/src/build /usr/src/app

WORKDIR /usr/src/app/apps/editor/editor-service

EXPOSE 8080
CMD [ "npm", "start" ]
