import { Injectable, EventEmitter } from '@angular/core';
import { BuilderService } from '@app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Environment, Assistant } from '../models';
import { MultiLanguageSkill } from '@app/skills/skill/shared/models/skill';


@Injectable()
export class AssistantService {

    assistantId: string;

    assistant: Assistant;
    assistantChange$ = new EventEmitter<Assistant>();
    environments: Environment[] = [];
    environmentsChange$ = new EventEmitter<Environment[]>();
    skillsInfo: MultiLanguageSkill[] = [];
    skillsInfoChange$ = new EventEmitter<MultiLanguageSkill[]>();

    environmentsToDelete: string[] = [];


    constructor(
        private builderService: BuilderService,
        private route: ActivatedRoute, private router: Router) {

        this.assistantId = this.route.snapshot.params["assistantId"];

        this.builderService.getAssistant(this.assistantId)
            .then(assistant => {
                this.assistant = assistant;
                this.assistantChange$.emit(this.assistant);
            }).catch(error => {
                this.router.navigate(["/assistants"]);
                console.error(error);
            });

        this.builderService.getAllAssistantEnvironments(this.assistantId)
            .then(environments => {
                this.environments = environments;
                this.environmentsChange$.emit(this.environments);
            }).catch(error => {
                console.error(error);
            });

        this.builderService.getAllSkillsInfoDevelopVersion()
            .then(skillsInfo => {
                this.skillsInfo = skillsInfo;
                this.skillsInfoChange$.emit(this.skillsInfo);
            }).catch(error => {
                console.error(error);
            });

    }

    // updateAssistandInfo(assistant: Assistant) {
    //     this.assistant = assistant;
    //     this.assistantChange$.emit(this.assistant);
    // }

    async saveAssistant() {
        for (const environmentId of this.environmentsToDelete) {
            await this.builderService.deleteAssistantEnvironment(this.assistantId, environmentId);
        }
        this.environmentsToDelete = [];
        return this.builderService.saveAssistantAndEnvironments(this.assistant, this.environments);
    }

    startAssistant(environmentId: string) {
        return this.builderService.startAssistant(this.assistant.id, environmentId);
    }

    stopAssistant(environmentId: string) {
        return this.builderService.stopAssistant(this.assistant.id, environmentId);
    }

    newEnvironment(environmentId: string) {
        this.environments.push({
            "id": environmentId,
            "TELEGRAM_TOKEN": "",
            "TELEGRAM_POLLING": "true",
            "TELEGRAM_PUBLIC_DOMAIN": "",
            "TELEGRAM_ENDPOINT": "/telegram",
            "FACEBOOK_PAGE_ACCESS_TOKEN": "",
            "FACEBOOK_VERIFY_TOKEN": "",
            "FACEBOOK_PUBLIC_DOMAIN": "",
            "FACEBOOK_ENDPOINT": "/facebook-messenger"
        });
        this.environmentsChange$.emit(this.environments);
    }

    deleteEnvironment(environmentId: string) {
        const index = this.environments.findIndex(env => env.id === environmentId);
        if (index > -1) {
            this.environmentsToDelete.push(environmentId);
            this.router.navigate([`/assistants/${this.assistant.id}`]);
            window.scroll(0,0);
            this.environments.splice(index, 1);
            this.environmentsChange$.emit(this.environments);
        }
    }

    deleteAssistant() {
        this.builderService.deleteAssistant(this.assistantId)
            .then(() => {
                this.router.navigate(["/assistants"]);
                window.scroll(0,0);
            })
            .catch(error => {
                console.error(error);
            });
    }

}
