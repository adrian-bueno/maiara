import * as http from "http";
import * as https from "https";
import * as fs from "fs";


/**
 *
 */
export interface ServerConfig {
    port: number | string
    sslKeyPath?: string
    sslCertificatePath?: string
}

/**
 *
 */
export class Server {

    private port: number | string | boolean;
    private server: any;
    public app: any;

    constructor(config: ServerConfig, app: any) {
        if (!config) {
            throw new Error("No configuration for server constructor");
        }
        if (!app) {
            throw new Error("No app for server constructor");
        }

        this.app = app;

        if (config.sslKeyPath && config.sslCertificatePath) {
            let options = {
                key: fs.readFileSync(config.sslKeyPath),
                cert: fs.readFileSync(config.sslCertificatePath)
            }
            this.server = https.createServer(options, this.app);
        }
        else {
            this.server = http.createServer(this.app);
        }

        this.port = this.normalizePort(config.port);

        this.server.on('error', this.onError.bind(this));
        this.server.on('listening', this.onListening.bind(this));
    }

    /**
     *
     */
    start() {
        this.server.listen(this.port);
    }

    /**
     *
     */
    private normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

    /**
     *
     */
    private onError(error: NodeJS.ErrnoException): void {

        if (error.syscall !== 'listen') throw error;
        let bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;

        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
            default:
                throw error;
        }
    }

    /**
     *
     */
    private onListening(): void {
        let addr = this.server.address();
        let bind = (typeof addr === 'string')
            ? `pipe ${addr}`
            : `port ${addr.port}`;

        console.log(`Listening on ${bind}`);
    }

}
