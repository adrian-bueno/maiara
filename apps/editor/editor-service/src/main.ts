import dotenv = require("dotenv");
import { Server, DBConfig } from '@maiara/core';

import { API, APIConfig } from './api';
import { MinioStorageConfig, MinioStorage } from "@maiara/minio";
import { MongoClient } from "mongodb";
import { AppLauncherService } from "./services";

dotenv.config();


const storageConfig: MinioStorageConfig = {
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET,
    endpoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_SECURE === "true" ? true : false
}

const databaseConfig: DBConfig = {
    host: process.env.MONGODB_HOST,
    port: Number(process.env.MONGODB_PORT),
    database: process.env.MONGODB_DATABASE
}


async function configureStorage(config: MinioStorageConfig) {
    return new MinioStorage(config);
}

async function configureDatabase(config: DBConfig) {
    const mongoUrl = `mongodb://${config.host}:${config.port || 27017}`
    const mongodb = new MongoClient(mongoUrl);
    return await mongodb.connect().then(() => {
        console.log("Connected successfully to database server");
        return mongodb.db(config.database)
    })
}

Promise.all([

    configureStorage(storageConfig),
    configureDatabase(databaseConfig)

]).then(([minioStorage, database]) => {

    const appLauncherService = new AppLauncherService({
        db: database,
        storage: minioStorage,
        dockerConfig: {
            protocol: "http",
            host: process.env.DOCKER_HOST || "localhost",
            port: Number(process.env.DOCKER_PORT || 2376)
        }
    });

    const apiConfig: APIConfig = {
        endpointRoot: "api",
        version: "v1",
        storage: minioStorage,
        database,
        appLauncherService
    }

    const api = new API(apiConfig);
    const server = new Server({ port: process.env.PORT || 8080 }, api.app);
    server.start();
});




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
