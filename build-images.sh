#!/usr/bin/env bash

docker build -f apps/assistants/nodejs-assistant/Dockerfile -t maiara/nodejs-assistant .

docker build -f apps/editor/editor-service/Dockerfile -t maiara/editor-service .

docker build -f apps/editor/editor-web-app/Dockerfile -t maiara/editor-web-app ./apps/editor/editor-web-app

docker build -f apps/nlu/snips-nlu-service/Dockerfile -t maiara/snips-nlu-service ./apps/nlu/snips-nlu-service

# docker-compose build
