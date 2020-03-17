import { Server, newDefaultExpressApp } from '@maiara/core';
import dotenv = require('dotenv');

import { AssistantEngine } from './assistant-engine';
import { MinioStorageConfig } from '@maiara/minio';

dotenv.config();


let app = newDefaultExpressApp();
let server = new Server({ port: process.env.PORT || 9999 }, app);


const storageConfig: MinioStorageConfig = {
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET,
    endpoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_SECURE === "true" ? true : false
}

// TODO mongodb configuration here

new AssistantEngine({
    assistantId: process.env.ASSISTANT_ID,
    environmentId: process.env.ENVIRONMENT_ID,
    app,
    storageConfig
});

server.start();




process.on("SIGINT", function() {

    // TODO graceful shutdown

    process.exit();
});

process.on('unhandledRejection', (reason, p) => {
    throw reason;
});

process.on('uncaughtException', (error) => {

    // TODO handle unhandled errors, decide if end process or not

    console.error(error);
    process.exit(1);
});
