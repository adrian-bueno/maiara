#!/usr/bin/env bash

MAIARA_ROOT_DIR=$PWD

docker build -f Dockerfile.nodejs-assistant -t maiara/nodejs-assistant .

cd apps/nlu/snips-nlu-service
docker build -t maiara/snips-nlu-service .
cd $MAIARA_ROOT_DIR

docker-compose build
