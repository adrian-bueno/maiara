import Docker = require("dockerode");
import getPort = require("get-port");
import { Db, ObjectId } from "mongodb";
import { Storage, AssistantActiveServices } from "@maiara/core";


export interface DockerConfig {
    protocol?: "https" | "http";
    host?: string;
    port?: number;
}

export interface AppLauncherServiceConfig {
    db: Db;
    storage: Storage;
    dockerConfig: DockerConfig;
}

export class AppLauncherService {

    docker: Docker;
    db: Db;
    storage: Storage;

    constructor(config: AppLauncherServiceConfig) {
        this.db = config.db;
        this.storage = config.storage;
        this.docker = new Docker({
            protocol: config.dockerConfig.protocol,
            host: config.dockerConfig.host,
            port: config.dockerConfig.port
        });
    }

    async startAssistant(assistantId: string, environmentId: string) {

        await this.stopAllActiveServices();

        const assistantInfo = await this.storage.getAssistant(assistantId);

        const assistantActiveServices: AssistantActiveServices = {
            _id: `${assistantId}_${environmentId}` as any,
            environmentId,
            skills: [],
            dialog: null
        };

        // Start NLU services
        for (let skillId of assistantInfo.skillsIds) {

            const languages = await this.storage.listMultiLanguageSkillLanguages(skillId, "develop"); // TODO versions

            for (let language of languages) {

                console.debug(`Training dataset (Skill: ${skillId} - Language: ${language})`);
                await this.trainDataset(skillId, language);
                console.debug(`Training end (Skill: ${skillId} - Language: ${language})`);

                const port = await getPort({ port: getPort.makeRange(5000, 5999) });
                const endpoint = `http://localhost:${port}/nlu`;

                const containerInfo: Docker.ContainerCreateOptions = {
                    Image: 'maiara/snips-nlu-service',
                    AttachStdin: false,
                    AttachStdout: false,
                    AttachStderr: false,
                    HostConfig: {
                        PortBindings: {
                            // "5000/tcp": [
                            //     {
                            //         HostPort: String(port)
                            //     }
                            // ]
                        },
                        NetworkMode: "host"
                    },
                    Env: [
                        `PORT=${port}`
                    ],
                    // NetworkingConfig: {
                    //     EndpointsConfig: {
                    //         "maiara_maiara": {
                    //             Links: [
                    //                 "maiara_storage_1"
                    //             ]
                    //         }
                    //     }
                    // },
                    Cmd: [
                        "pipenv", "run", "start", "rest-service",
                        "--train-persist-location", `skills/${skillId}/develop/${language}/dataset/train.zip`
                    ]
                }

                // containerInfo.HostConfig.PortBindings[`${port}/tcp`] = [{
                //     HostPort: String(port)
                // }]

                console.debug(`Creating NLU service (Skill: ${skillId} - Language: ${language})`);
                const dockerContainer = await this.docker.createContainer(containerInfo);
                await dockerContainer.start();
                const dockerContainerId = dockerContainer.id;

                console.debug(`NLU service started (Skill: ${skillId} - Language: ${language} - ContainerID: ${dockerContainerId})`);

                assistantActiveServices.skills.push({ dockerContainerId, endpoint, language, skillId });
            }
        }

        // Save in DB NLU services info
        const servicesCollection = this.db.collection("services");

        await servicesCollection.replaceOne(
            { _id: `${assistantId}_${environmentId}` },
            assistantActiveServices,
            { upsert: true }
        );

        // Start nodejs-assistant service
        const dockerContainer = await this.docker.createContainer({
                Image: 'maiara/nodejs-assistant',
                AttachStdin: false,
                AttachStdout: false,
                AttachStderr: false,
                HostConfig: {
                    PortBindings: {
                        "9999/tcp": [
                            {
                                HostPort: "9999"
                            }
                        ]
                    },
                    NetworkMode: "host"
                },
                Env: [
                    "NODE_ENV=production",
                    `ASSISTANT_ID=${assistantId}`,
                    `ENVIRONMENT_ID=${environmentId}`
                ]
            })
        await dockerContainer.start();
        const dockerContainerId = dockerContainer.id;

        assistantActiveServices.dialog = { dockerContainerId };

        // Update info in DB
        await servicesCollection.replaceOne(
            { _id: `${assistantId}_${environmentId}` },
            assistantActiveServices,
            { upsert: true }
        );

    }

    async stopAssistant(assistantId: string, environmentId: string) {

        // TODO stop only assistantId services

        this.stopAllActiveServices();
    }

    async stopAllActiveServices() {
        const collections = await this.db.listCollections().toArray();
        if(!collections.find(c => c.name == "services"))
          return;

        const servicesCollection = this.db.collection("services");
        const activeServicesList = await servicesCollection.find().toArray() as AssistantActiveServices[];

        for (const activeServices of activeServicesList) {
            if (activeServices.dialog.dockerContainerId == null)
              return;

            try {
                const container = await this.docker.getContainer(activeServices.dialog.dockerContainerId);
                await container.stop();
                await container.remove();
            } catch (error) {
                if (error.statusCode === 304 || error.statusCode === 409) {
                    return;
                }
                console.error(error);
                throw error;
            }

            await Promise.all([activeServices.skills.forEach(async skill => {
                await this.docker.getContainer(skill.dockerContainerId).remove({ force: true })
                    .catch(error => {
                        if (error.statusCode === 304 || error.statusCode === 409) {
                            return;
                        }
                        console.error(error);
                        throw error;
                    });
            })]);
        }
        await servicesCollection.drop();
    }

    private async trainDataset(skillId: string, languageCode: string) {
        const containerOptions: Docker.ContainerCreateOptions = {
            Image: 'maiara/snips-nlu-service',
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            HostConfig: {
                NetworkMode: "host"
            },
            Cmd: [
                "pipenv", "run", "start", "train",
                "--dataset", `skills/${skillId}/develop/${languageCode}/dataset`,
                "--dataset-type", "files",
                "--train-persist-location", `skills/${skillId}/develop/${languageCode}/dataset/train.zip`
            ]
        }

        const container = await this.docker.createContainer(containerOptions);
        await container.start();
        await container.wait();
    }

}
