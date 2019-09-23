import { Router, Request, Response, NextFunction } from "express";
import { Storage, transformMapToObject, MultiLanguageSkill, transformObjectToMap } from "@maiara/core";


export function skillRouter(storage: Storage): Router {

    const router = Router();
    const endpointRoot = "/skill";


    router.get(`${endpointRoot}`, async (_req: Request, res: Response, _next: NextFunction) => {
        res.send(await storage.listMultiLanguageSkills());
    })

    router.get(`${endpointRoot}/version/develop/info`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.getAllSkillsInfoDevelopVersion());
        } catch(error) {
            console.error(error);
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:skillId/version`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.listMultiLanguageSkillVersions(req.params.skillId));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:skillId/version/:versionId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const multiLanguageSkill: any = await storage.getMultilanguageSkill(req.params.skillId, req.params.versionId);
            multiLanguageSkill.skills = transformMapToObject(multiLanguageSkill.skills);
            return res.send(multiLanguageSkill);
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:skillId/version/:versionId/dialog`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const multiLanguageSkill: any = await storage.getMultilanguageSkillOnlyDialog(req.params.skillId, req.params.versionId);
            multiLanguageSkill.skills = transformMapToObject(multiLanguageSkill.skills);
            return res.send(multiLanguageSkill);
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:skillId/version/:versionId/language`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.listMultiLanguageSkillLanguages(req.params.skillId, req.params.versionId));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:skillId/version/:versionId/language/:languageCode`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.getSkill(req.params.skillId, req.params.versionId, req.params.languageCode));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.get(`${endpointRoot}/:skillId/version/:versionId/language/:languageCode/dialog`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            return res.send(await storage.getSkillOnlyDialog(req.params.skillId, req.params.versionId, req.params.languageCode));
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.post(`${endpointRoot}/:skillId/version/:versionId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0 || !req.body.id) { // TODO improve validation
                return res.status(400).send({ message: "Not valid object" });
            }
            const multiLanguageSkill: MultiLanguageSkill = req.body;
            multiLanguageSkill.skills = transformObjectToMap(<any> multiLanguageSkill.skills);
            await storage.saveMultiLanguageSkill(multiLanguageSkill, req.params.versionId);
            return res.sendStatus(204);
        } catch(error) {
            return res.status(500).send({ message: error.message });
        }
    });

    router.delete(`${endpointRoot}/:skillId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            await storage.deleteMultiLanguageSkill(req.params.skillId);
            return res.sendStatus(204);
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.delete(`${endpointRoot}/:skillId/version/:versionId`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            await storage.deleteMultiLanguageSkillVersion(req.params.skillId, req.params.versionId);
            return res.sendStatus(204);
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });

    router.delete(`${endpointRoot}/:skillId/version/:versionId/language/:languageCode`, async (req: Request, res: Response, _next: NextFunction) => {
        try {
            await storage.deleteMultiLanguageSkillLanguage(req.params.skillId, req.params.versionId, req.params.languageCode);
            return res.sendStatus(204);
        } catch(error) {
            if (error.code === "NoSuchKey") {
                return res.status(404).send({ message: "Skill not found" });
            }
            return res.status(500).send({ message: "Internal error" });
        }
    });


    return router;
}
