import express from "express";
import * as bodyParser from "body-parser";


export type ExpressApp = express.Application;

export function newDefaultExpressApp(): ExpressApp {
    const expressApp: ExpressApp = express();

    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({ extended: true }));

    expressApp.use((_req, res, next) => {
        res.header("Access-Control-Allow-Origin",
            process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*");
        res.header("Access-Control-Allow-Methods",
            process.env.ACCESS_CONTROL_ALLOW_METHODS || "GET, POST, PUT, DELETE");
        res.header("Access-Control-Allow-Headers",
            process.env.ACCESS_CONTROL_ALLOW_HEADERS || "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        next();
    });

    return expressApp;
}
