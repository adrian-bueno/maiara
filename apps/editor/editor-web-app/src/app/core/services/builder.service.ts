import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Skill, MultiLanguageSkill } from '@app/skills/skill/shared/models/skill';
import { Assistant, Environment } from '@app/assistants/models';


function transformMapToObject(map: Map<any, any>) {
    const object = {};
    [...map].forEach(([k, v]) => {
        object[k] = v;
    });
    return object;
}

function transformObjectToMap(object: any): Map<any, any> {
    if (!object) {
        return new Map();
    }
    return new Map(Object.entries(object));
}


@Injectable()
export class BuilderService {

    private apiRoot = `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;


    constructor(private http: HttpClient) {

    }

    async getAllAssistantIds(): Promise<string[]> {
        return this.http.get<string[]>(`${this.apiRoot}/assistant`).toPromise();
    }

    async getAllAssistantsInfo(): Promise<Assistant[]> {
        const assistantIds = await this.http.get<string[]>(`${this.apiRoot}/assistant`).toPromise();
        return await Promise.all(assistantIds.map(async assistantId =>
            await this.http.get<Assistant>(`${this.apiRoot}/assistant/${assistantId}`).toPromise()));
    }

    async getAssistant(assistantId: string): Promise<Assistant> {
        return this.http.get<Assistant>(`${this.apiRoot}/assistant/${assistantId}`).toPromise();
    }

    async getAllAssistantEnvironments(assistantId: string): Promise<Environment[]> {
        return this.http.get<Environment[]>(`${this.apiRoot}/assistant/${assistantId}/environment`).toPromise();
    }

    async getAllSkillsIds(): Promise<string[]> {
        return this.http.get<string[]>(`${this.apiRoot}/skill`).toPromise();
    }

    async getAllSkillsInfoDevelopVersion(): Promise<MultiLanguageSkill[]> {
        return this.http.get<MultiLanguageSkill[]>(`${this.apiRoot}/skill/version/develop/info`).toPromise();
    }

    async getMultiLanguageSkill(skillId: string): Promise<MultiLanguageSkill> {
        return this.http.get<MultiLanguageSkill>(`${this.apiRoot}/skill/${skillId}/version/develop`).toPromise()
            .then(multiLanguageSkill => {
                multiLanguageSkill.skills = transformObjectToMap(multiLanguageSkill.skills);
                return multiLanguageSkill;
            });
    }

    async saveAssistant(assistant: Assistant): Promise<any> {
        return this.http.post(`${this.apiRoot}/assistant/${assistant.id}`, assistant).toPromise();
    }

    async saveAssistantEnvironment(assistantId: string, environment: Environment): Promise<any> {
        return this.http.post(`${this.apiRoot}/assistant/${assistantId}/environment/${environment.id}`, environment).toPromise();
    }

    async saveAssistantAndEnvironments(assistant: Assistant, environments: Environment[]): Promise<any> {
        const saveAssistantPromise = this.saveAssistant(assistant);
        const saveEnvironmentsPromises = environments.map(env => this.saveAssistantEnvironment(assistant.id, env));
        return Promise.all([saveAssistantPromise, ...saveEnvironmentsPromises]);
    }

    async deleteAssistant(assistantId: string): Promise<any> {
        return this.http.delete(`${this.apiRoot}/assistant/${assistantId}`).toPromise();
    }

    async deleteAssistantEnvironment(assistantId: string, environmentId: string): Promise<any> {
        return this.http.delete(`${this.apiRoot}/assistant/${assistantId}/environment/${environmentId}`).toPromise();
    }

    async saveMultiLanguageSkill(multiLanguageSkill: MultiLanguageSkill, version: string): Promise<any> {
        const duplicate = JSON.parse(JSON.stringify(multiLanguageSkill));
        duplicate.skills = transformMapToObject(multiLanguageSkill.skills);
        return this.http.post(`${this.apiRoot}/skill/${multiLanguageSkill.id}/version/${version}`, duplicate).toPromise();
    }

    async deleteMultiLanguageSkill(skillId: string): Promise<any> {
        return this.http.delete(`${this.apiRoot}/skill/${skillId}`).toPromise();
    }

    async startAssistant(assistantId: string, environmentId: string) {
        return this.http.post(`${this.apiRoot}/assistant/${assistantId}/environment/${environmentId}/start`, {}).toPromise();
    }

    async stopAssistant(assistantId: string, environmentId: string) {
        return this.http.post(`${this.apiRoot}/assistant/${assistantId}/environment/${environmentId}/stop`, {}).toPromise();
    }

}
