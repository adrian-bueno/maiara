import express from "express";
import * as bodyParser from "body-parser";


export function expressApp(): express.Application {
    const app: express.Application = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use((_req, res, next) => {
        res.header("Access-Control-Allow-Origin",
            process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*");
        res.header("Access-Control-Allow-Methods",
            process.env.ACCESS_CONTROL_ALLOW_METHODS || "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers",
            process.env.ACCESS_CONTROL_ALLOW_HEADERS || "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers");
        next();
    });

    return app;
}
