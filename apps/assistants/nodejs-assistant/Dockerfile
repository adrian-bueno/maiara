FROM node:12.18.4 as builder

ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_COLOR=false

ENV PACKAGES_ROOT_DIR=./packages/nodejs-packages
ENV APP_ROOT_DIR=./apps/assistants/nodejs-assistant

WORKDIR /usr/src/build

# Install general devDependencies
COPY lerna.json ./
COPY package*.json ./
RUN npm install

# Copy package.json from node-packages
COPY $PACKAGES_ROOT_DIR/core/package*.json $PACKAGES_ROOT_DIR/core/
COPY $PACKAGES_ROOT_DIR/telegram/package*.json $PACKAGES_ROOT_DIR/telegram/
COPY $PACKAGES_ROOT_DIR/facebook-messenger/package*.json $PACKAGES_ROOT_DIR/facebook-messenger/
COPY $PACKAGES_ROOT_DIR/minio/package*.json $PACKAGES_ROOT_DIR/minio/

# Copy nodejs-assistant package.json
COPY $APP_ROOT_DIR/package*.json $APP_ROOT_DIR/

RUN npm run bootstrap

# Remove not needed source code from node-cld library
RUN rm -rf /usr/src/app/nodejs-assistant/node_modules/cld/deps

# Copy everything from node-packages
COPY $PACKAGES_ROOT_DIR/core $PACKAGES_ROOT_DIR/core/
COPY $PACKAGES_ROOT_DIR/telegram $PACKAGES_ROOT_DIR/telegram/
COPY $PACKAGES_ROOT_DIR/facebook-messenger $PACKAGES_ROOT_DIR/facebook-messenger/
COPY $PACKAGES_ROOT_DIR/minio $PACKAGES_ROOT_DIR/minio/

# Copy everything from nodejs-assistant
COPY $APP_ROOT_DIR $APP_ROOT_DIR/

# Build packages and nodejs-assistant
RUN npm run build

# Remove devDependencies from root
RUN npm prune --production
# RUN npm run clean:devDependencies



FROM node:12.18.4-alpine

ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

COPY --from=builder /usr/src/build /usr/src/app

WORKDIR /usr/src/app/apps/assistants/nodejs-assistant

EXPOSE 8080
CMD [ "npm", "start" ]
