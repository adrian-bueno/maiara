import { Client, BucketItem, BucketStream } from 'minio';
import {
    Storage, Assistant, MultiLanguageSkill, Skill, Environment,
    NLUDataset, Dialog, DialogNode, SystemEntity, Entity, Intent, SnipsIntent,
    SnipsEntity, EntityData, transformMapToObject
} from '@maiara/core';
import { Stream } from 'stream';



export interface MinioStorageConfig {
    endpoint: string;
    port: number;
    useSSL?: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
}


export class MinioStorage implements Storage {

    minioClient: Client;
    bucket: string;

    constructor(config: MinioStorageConfig) {
        this.minioClient = new Client({
            endPoint: config.endpoint,
            port: config.port,
            useSSL: config.useSSL ? config.useSSL : false,
            accessKey: config.accessKey,
            secretKey: config.secretKey
        });

        this.bucket = config.bucket;

        this.minioClient.bucketExists(this.bucket).then(exists => {
            if (!exists) {
                this.minioClient.makeBucket(this.bucket, 'us-east-1')
                    .then(() => console.log(`Bucket ${this.bucket} created`))
                    .catch(error => console.error(`Error creating bucket ${this.bucket}`,error));
            }
        })
    }

    private async streamToObject(stream: Stream): Promise<any> {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', function(chunk) {
                chunks.push(chunk);
            })
            stream.on('end', function() {
                resolve(JSON.parse(Buffer.concat(chunks).toString()));
            })
            stream.on('error', function(err) {
                reject(err);
            })
        })
    }

    private async bucketStreamToBucketItemList(stream: BucketStream<BucketItem>): Promise<BucketItem[]> {
        return new Promise((resolve, reject) => {
            const objects = [];
            stream.on('data', function(obj) {
                objects.push(obj);
            })
            stream.on('end', function() {
                resolve(objects);
            })
            stream.on('error', function(err) {
                reject(err);
            })
        })
    }

    private async bucketStreamToObjectNameList(stream: BucketStream<BucketItem>): Promise<string[]> {
        const list: string[] = [];
        (await this.bucketStreamToBucketItemList(stream)).forEach(item => {
            if (item.name) list.push(item.name);
        });
        return list;
    }

    private async bucketStreamToObjectPrefixList(stream: BucketStream<BucketItem>): Promise<string[]> {
        const list: string[] = [];
        (await this.bucketStreamToBucketItemList(stream)).forEach(item => {
            if (item.prefix) list.push(item.prefix);
        });
        return list;
    }

    private async downloadObject(objectName: string): Promise<any> {
        return this.minioClient.getObject(this.bucket, objectName)
            .then(stream => this.streamToObject(stream));
    }

    private async downloadObjects(prefix: string): Promise<any[]> {
        const objectNames = await this.listObjectsWithPrefix(prefix);
        return await Promise.all(objectNames.map(async name => await this.downloadObject(name)));
    }

    private async listObjectsWithPrefix(prefix: string): Promise<string[]> {
        const stream = this.minioClient.listObjectsV2(this.bucket, prefix, true);
        return this.bucketStreamToObjectNameList(stream);
    }

    private async getNamesInsidePrefix(prefix: string) {
        if (!prefix.endsWith("/"))
            prefix = prefix + "/";

        const stream = this.minioClient.listObjectsV2(this.bucket, prefix, false);
        return (await this.bucketStreamToObjectNameList(stream))
            .map(prefix => {
                const dirs = prefix.split("/");
                return dirs[dirs.length-1]
            });
    }

    private async getPrefixInsidePrefix(prefix: string) {
        if (!prefix.endsWith("/"))
            prefix = prefix + "/";

        const stream = this.minioClient.listObjectsV2(this.bucket, prefix, false);
        return (await this.bucketStreamToObjectPrefixList(stream))
            .map(prefix => {
                const dirs = prefix.split("/");
                return dirs[dirs.length-2]
            });
    }

    private async uploadObject(objectName: string, objectData: any): Promise<any> {
        return this.minioClient.putObject(this.bucket, objectName, JSON.stringify(objectData));
    }

    private async removeObjectsWithPrefix(prefix: string): Promise<any> {
        const objectNames = await this.listObjectsWithPrefix(prefix);
        return this.minioClient.removeObjects(this.bucket, objectNames);
    }

    private async removeObject(objectName: string): Promise<any> {
        return this.minioClient.removeObject(this.bucket, objectName);
    }

    async getAssistant(assistantId: string): Promise<Assistant> {
        return this.downloadObject(`assistants/${assistantId}/info.json`);
    }

    async getAssistantEnvironment(assistantId: string, environmentId: string): Promise<Environment> {
        return this.downloadObject(`assistants/${assistantId}/environments/${environmentId}.json`);
    }

    async getAssistantEnvironments(assistantId: string): Promise<Environment[]> {
        return this.downloadObjects(`assistants/${assistantId}/environments`);
    }

    // FIXME return only info.jsons but not environments
    async getAllAssistants(): Promise<Assistant[]> {
        return this.downloadObjects("assistants");
    }

    async listAssistants(): Promise<string[]> {
        return this.getPrefixInsidePrefix(`assistants`);
    }

    async saveAssistant(assistant: Assistant): Promise<any> {
        return this.uploadObject(`assistants/${assistant.id}/info.json`, assistant);
    }

    async saveAssistantEnvironment(assistantId: string, environment: Environment): Promise<any> {
        return this.uploadObject(`assistants/${assistantId}/environments/${environment.id}.json`, environment);
    }

    async listAssistantEnvironments(assistantId: string): Promise<string[]> {
        return (await this.getNamesInsidePrefix(`assistants/${assistantId}/environments/`))
            .map(name => name.endsWith(".json") ? name.substring(0, name.length-5) : name);
    }

    async deleteAssistant(assistantId: string): Promise<any> {
        // TODO check if exists to return 404
        this.removeObjectsWithPrefix(`assistants/${assistantId}`);
    }

    async deleteAssistantEnvironment(assistantId: string, environmentId: string): Promise<any> {
        // TODO check if exists to return 404
        this.removeObject(`assistants/${assistantId}/environments/${environmentId}.json`);
    }

    private async downloadSnipsIntents(skillId: string, version: string, language: string): Promise<Intent[]> {
        const intents: Intent[] = [];
        const rootPath = `skills/${skillId}/${version}/${language}/dataset/intents`;
        let intentNames = (await this.listObjectsWithPrefix(rootPath))
            .map(objectName => { const list = objectName.split("/"); return list[list.length-1] })
            .map(name => name.endsWith(".json") ? name.substring(0, name.length-5) : name);

        intentNames.forEach(async name => {
            const snipsIntent: SnipsIntent = await this.downloadObject(`${rootPath}/${name}.json`);
            intents.push({
                name,
                utterances: snipsIntent.utterances.filter(u => u).map(u => u.data)
            });
        });

        return intents;
    }

    private async downloadSnipsEntities(skillId: string, version: string, language: string): Promise<Entity[]> {
        const entities: Entity[] = [];
        const rootPath = `skills/${skillId}/${version}/${language}/dataset/entities`;
        let entityNames = (await this.listObjectsWithPrefix(rootPath))
            .map(objectName => { const list = objectName.split("/"); return list[list.length-1] })
            .map(name => name.endsWith(".json") ? name.substring(0, name.length-5) : name)
            .filter(name => name);

        entityNames.forEach(async name => {
            const snipsEntity: SnipsEntity = await this.downloadObject(`${rootPath}/${name}.json`);
            entities.push({
                name,
                data: snipsEntity.data
            });
        });

        return entities;
    }

    async getSkill(skillId: string, version: string, language: string): Promise<Skill> {
        const skillRootPrefix = `skills/${skillId}/${version}`
        const languagePrefix = `${skillRootPrefix}/${language}`;

        const skill: Skill = {
            ...(await this.downloadObject(`${skillRootPrefix}/info.json`)),
            language,
            nluDataset: {
                ...(await this.downloadObject(`${languagePrefix}/dataset/info.json`)),
                intents: await this.downloadSnipsIntents(skillId, version, language),
                entities: await this.downloadSnipsEntities(skillId, version, language),
                systemEntities: await this.downloadObject(`${languagePrefix}/dataset/system-entities.json`)
            },
            dialog: {
                nodes: await this.downloadObjects(`${languagePrefix}/dialog/nodes`),
                edges: await this.downloadObject(`${languagePrefix}/dialog/edges.json`).catch(_error => [])
            }
        }

        return skill;
    }

    async getSkillOnlyDialog(skillId: string, version: string, language: string): Promise<Skill> {
        const skillRootPrefix = `skills/${skillId}/${version}`
        const languagePrefix = `${skillRootPrefix}/${language}`;

        const skill: Skill = {
            ...(await this.downloadObject(`${skillRootPrefix}/info.json`)),
            language,
            dialog: {
                nodes: await this.downloadObjects(`${languagePrefix}/dialog/nodes`),
                edges: await this.downloadObject(`${languagePrefix}/dialog/edges.json`).catch(_error => [])
            }
        }

        return skill;
    }

    async getMultilanguageSkill(skillId: string, version: string): Promise<MultiLanguageSkill> {
        const rootPath = `skills/${skillId}/${version}`;

        const languages = await this.getPrefixInsidePrefix(rootPath);

        const info: MultiLanguageSkill = await this.downloadObject(`${rootPath}/info.json`);

        const skillsMap = new Map<string, Skill>();

        for (const lang of languages) {
            const skill = await this.getSkill(skillId, version, lang);
            skillsMap.set(lang, skill);
        }

        return {
            id: info.id,
            description: info.description,
            languages: languages,
            name: info.name,
            skills: skillsMap
        };
    }

    async getMultilanguageSkillOnlyDialog(skillId: string, version: string): Promise<MultiLanguageSkill> {
        const rootPath = `skills/${skillId}/${version}`;

        const languages = await this.getPrefixInsidePrefix(rootPath);

        const info: MultiLanguageSkill = await this.downloadObject(`${rootPath}/info.json`);

        const skillsMap = new Map<string, Skill>();

        for (const lang of languages) {
            const skill = await this.getSkillOnlyDialog(skillId, version, lang);
            skillsMap.set(lang, skill);
        }

        return {
            id: info.id,
            description: info.description,
            languages: languages,
            name: info.name,
            skills: skillsMap
        };
    }

    async getAllSkillsInfoDevelopVersion(): Promise<Skill[]> {
        const skillIds = await this.listMultiLanguageSkills();
        return await Promise.all(skillIds.map(async skillId => await this.downloadObject(`skills/${skillId}/develop/info.json`)));
    }

    async saveMultiLanguageSkill(multiLanguageSkill: MultiLanguageSkill, version: string): Promise<any> {

        // FIXME FIRST APPROACH, NOT THE BEST SOLUTION

        await this.deleteMultiLanguageSkillVersion(multiLanguageSkill.id, version);

        const { id, name, description } = multiLanguageSkill;
        await this.uploadObject(`skills/${multiLanguageSkill.id}/${version}/info.json`, { id, name, description });

        await Promise.all(multiLanguageSkill.languages.map(async language => {
            const skill = multiLanguageSkill.skills.get(language);
            await this.saveSkill(multiLanguageSkill.id, version, skill);
        }));
    }

    private async saveSkill(multiLanguageSkillId: string, version: string, skill: Skill): Promise<any> {
        const rootPath: string = `skills/${multiLanguageSkillId}/${version}/${skill.language}`;
        const datasetPath: string = `${rootPath}/dataset`;
        const dialogPath: string = `${rootPath}/dialog`;

        await this.uploadObject(`${datasetPath}/info.json`, { language: skill.nluDataset.language });

        await this.uploadObject(`${datasetPath}/system-entities.json`, skill.nluDataset.systemEntities);

        await Promise.all(skill.nluDataset.intents.map(async intent => {
            const snipsUtterances = intent.utterances.map(u => {
                return { data: u }
            });
            await this.uploadObject(`${datasetPath}/intents/${intent.name}.json`, { utterances: snipsUtterances });
        }));

        await Promise.all(skill.nluDataset.entities.map(async entity => {
            await this.uploadObject(`${datasetPath}/entities/${entity.name}.json`, {
                data: entity.data,
                use_synonyms: true,
                automatically_extensible: true,
                matching_strictness: 1.0
            });
        }));

        await this.uploadObject(`${dialogPath}/edges.json`, skill.dialog.edges);

        await Promise.all(skill.dialog.nodes.map(async node => {
            await this.uploadObject(`${dialogPath}/nodes/${node.id}.json`, node);
        }));
    }

    async listMultiLanguageSkills(): Promise<string[]> {
        return this.getPrefixInsidePrefix(`skills`);
    }

    async listMultiLanguageSkillLanguages(skillId: string, version: string): Promise<string[]> {
        return this.getPrefixInsidePrefix(`skills/${skillId}/${version}/`);
    }
    async listMultiLanguageSkillVersions(skillId: string): Promise<string[]> {
        return this.getPrefixInsidePrefix(`skills/${skillId}/`);
    }

    async deleteMultiLanguageSkill(skillId: string): Promise<any> {
        return this.removeObjectsWithPrefix(`skills/${skillId}`);
    }

    async deleteMultiLanguageSkillVersion(skillId: string, version: string): Promise<any> {
        return this.removeObjectsWithPrefix(`skills/${skillId}/${version}`);
    }

    async deleteMultiLanguageSkillLanguage(skillId: string, version: string, language: string): Promise<any> {
        return this.removeObjectsWithPrefix(`skills/${skillId}/${version}/${language}`);
    }

}
