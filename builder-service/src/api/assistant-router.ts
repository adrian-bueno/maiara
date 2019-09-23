import { Router, Request, Response, NextFunction } from "express";
import { Storage } from "@maiara/core";
import { AppLauncherService } from "../services";


export function assistantRouter(storage: Storage, appLauncherService: AppLauncherService): Router {

    const router = Router();
    const endpointRoot = "/assistant";


    router.get(`${endpointRoot}`, async (_req: Request, res: Response, _next: NextFunction) => {
        res.send(await storage.listAssistants());
    })

    router.get(`${endpointRoot}/:assistantId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.getAssistant(req.params.assistantId));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Assistant not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.delete(`${endpointRoot}/:assistantId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            await storage.deleteAssistant(req.params.assistantId);
            return res.sendStatus(204);
        } catch(error) {
            console.error(error);
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Assistant not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:assistantId/environment/:environmentId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.getAssistantEnvironment(req.params.assistantId, req.params.environmentId));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Assistant environment not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:assistantId/environment`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.getAssistantEnvironments(req.params.assistantId));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Assistant not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.post(`${endpointRoot}/:assistantId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            // TODO validate body
            await storage.saveAssistant(req.body);
            return res.sendStatus(204);
        } catch(error) {
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.post(`${endpointRoot}/:assistantId/environment/:environmentId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            // TODO validate assistant exists
            // TODO validate body
            await storage.saveAssistantEnvironment(req.params.assistantId, req.body);
            return res.sendStatus(204);
        } catch(error) {
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.delete(`${endpointRoot}/:assistantId/environment/:environmentId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            await storage.deleteAssistantEnvironment(req.params.assistantId, req.params.environmentId);
            return res.sendStatus(204);
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Assistant environment not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.post(`${endpointRoot}/:assistantId/environment/:environmentId/start`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const assistantsIds = await storage.listAssistants();
            if (!assistantsIds.includes(req.params.assistantId)) {
                return res.status(404).send({ message: "Assistant not found" });
            }

            const assistantEnvironments = await storage.listAssistantEnvironments(req.params.assistantId);
            if (!assistantEnvironments.includes(req.params.environmentId)) {
                return res.status(404).send({ message: "Assistant environment not found" });
            }

            await appLauncherService.startAssistant(req.params.assistantId, req.params.environmentId);

            return res.sendStatus(204);
        } catch(error) {
            console.error(error);
            return res.status(500).send({ message: error.message });
        }
    });

    router.post(`${endpointRoot}/:assistantId/environment/:environmentId/stop`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            // TODO stop only assistantId services
            await appLauncherService.stopAllActiveServices();
            return res.sendStatus(204);
        } catch(error) {
            return res.status(500).send({ message: error.message });
        }
    });



    // TODO method that check if services are up



    return router;
}
