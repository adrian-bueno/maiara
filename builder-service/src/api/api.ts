import { DBConfig } from "@maiara/core";
import { MinioStorageConfig, MinioStorage } from "@maiara/minio";
import { Db, MongoClient } from "mongodb";
import { Application as ExpressApplication, Router } from "express";

import { assistantRouter } from "./assistant-router";
import { skillRouter } from "./skill-router";
import { expressApp } from "./express-app";
import { AppLauncherService } from "../services";


export interface APIConfig {
    endpointRoot?: string;                 // "/api"
    version?: string;                      // "v1"
    storage: MinioStorage;
    database: Db;
    appLauncherService: AppLauncherService;
}

export class API {

    private storage: MinioStorage;
    private db: Db;
    private appLauncherService: AppLauncherService;
    app: ExpressApplication;

    constructor(config: APIConfig) {
        this.storage = config.storage;
        this.db = config.database;
        this.appLauncherService = config.appLauncherService;
        this.configureRoutes(config);
    }

    private configureRoutes(config: APIConfig) {
        this.app = expressApp();

        const root: string = this.buildEndpointRoot(config.endpointRoot, config.version);
        const rootRouter = Router();

        rootRouter.use(assistantRouter(this.storage, this.appLauncherService));
        rootRouter.use(skillRouter(this.storage));

        this.app.use(root, rootRouter);
    }

    private buildEndpointRoot(endpointRoot: string, version: string): string {
        let root: string = "";
        if (endpointRoot) {
            root += `/${endpointRoot}`;
        }
        if (version) {
            root += `/${version}`;
        }
        return root;
    }



}
