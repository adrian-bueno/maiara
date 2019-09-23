#!/usr/bin/env bash

docker build -f Dockerfile.nodejs-assistant -t maiara/nodejs-assistant .

cd snips-nlu-service
docker build -t maiara/snips-nlu-service .
cd ..

docker-compose build
