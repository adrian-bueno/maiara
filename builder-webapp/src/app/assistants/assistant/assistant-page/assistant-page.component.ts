import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Assistant } from '@app/assistants/models/assistant';
import { MultiLanguageSkill } from '@app/skills/skill/shared/models/skill';
import { AssistantService } from '../assistant.service';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './assistant-page.component.html',
    styleUrls: ['./assistant-page.component.scss']
})
export class AssistantPageComponent implements OnInit, OnDestroy {

    assistant: Assistant;
    assistantSkills: MultiLanguageSkill[] = [];
    notAddedSkills: MultiLanguageSkill[] = [];
    allSkills:  MultiLanguageSkill[] = [];

    showAddSkillsPopup: boolean = false;
    showNewEnvironmentPopup: boolean = false;

    assistantChangeSubscription: Subscription;
    skillsInfoChangeSubscription: Subscription;

    telegramActive: boolean = false;
    facebookMessengerActive: boolean = false;


    constructor(private assistantService: AssistantService, private cdRef: ChangeDetectorRef) {

        this.assistant = this.assistantService.assistant;
        this.allSkills = this.assistantService.skillsInfo;
        this.updateNotAddedSkills();
        this.updateAssistantSkills();
        this.updateChannelsConfigBooleans();

        this.assistantChangeSubscription = this.assistantService.assistantChange$
            .subscribe(assistant => {
                this.assistant = assistant;
                this.updateChannelsConfigBooleans();
                this.cdRef.detectChanges();
            });

        this.skillsInfoChangeSubscription = this.assistantService.skillsInfoChange$
            .subscribe(skillsInfo => {
                this.allSkills = skillsInfo;
                this.updateNotAddedSkills();
                this.updateAssistantSkills();
                this.cdRef.detectChanges();
            });

    }

    updateChannelsConfigBooleans() {
        this.telegramActive = false;
        this.facebookMessengerActive = false;
        if (this.assistant && this.assistant.channelsConfig) {
            this.assistant.channelsConfig.forEach(config => {
                if (config.channelType === "telegram") {
                    this.telegramActive = true;
                } else if (config.channelType === "facebookMessenger") {
                    this.facebookMessengerActive = true;
                }
            });
        }
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.assistantChangeSubscription.unsubscribe();
        this.skillsInfoChangeSubscription.unsubscribe();
    }

    onNameChange(name: string) {

    }

    onNameBlur() {

    }

    onDescriptionChange(description: string) {

    }

    onDescriptionBlur() {

    }

    updateAssistantSkills() {
        this.assistantSkills = this.allSkills.filter(skill => {
            for (const id of this.assistant.skillsIds) {
                if (id === skill.id) {
                    return true;
                }
            }
            return false;
        });
    }

    updateNotAddedSkills() {
        this.notAddedSkills = this.allSkills.filter(skill => {
            for (const id of this.assistant.skillsIds) {
                if (id === skill.id) {
                    return false;
                }
            }
            return true;
        });
    }

    removeSkill(index: number) {

        // this.assistantSkills.splice(index, 1);
        this.assistant.skillsIds.splice(index, 1); // TODO


        this.updateAssistantSkills();
        this.updateNotAddedSkills();

        // TODO update service
    }


    addSkill() {
        this.updateNotAddedSkills();
        this.showAddSkillsPopup = true;
    }

    cancelAddSkills() {
        this.showAddSkillsPopup = false;
    }

    confirmAddSkill(notAddedSkillIndex: number) {
        this.assistantSkills.push(this.notAddedSkills[notAddedSkillIndex]);
        this.showAddSkillsPopup = false;
        this.assistant.skillsIds = this.assistantSkills.map(assistant => assistant.id);
    }


    telegramActiveChange() {
        if (this.telegramActive === true) {
            this.assistant.channelsConfig.push(<any> {
                "channelType": "telegram",
                "credentials": {
                    "token": "{{TELEGRAM_TOKEN}}"
                },
                "polling": "{{TELEGRAM_POLLING}}",
                "publicDomain": "{{TELEGRAM_PUBLIC_DOMAIN}}",
                "endpoint": "{{TELEGRAM_ENDPOINT}}"
            });
        } else {
            const index = this.assistant.channelsConfig.findIndex(channelConfig => channelConfig.channelType === "telegram");
            if (index > -1) {
                this.assistant.channelsConfig.splice(index, 1);
            }
        }
        this.cdRef.detectChanges();
    }

    facebookMessengerActiveChange() {
        if (this.telegramActive === true) {
            this.assistant.channelsConfig.push(<any> {
                "channelType": "facebookMessenger",
                "credentials": {
                    "key": "{{FACEBOOK_MESSENGER_KEY}}",
                    "secret": "{{FACEBOOK_MESSENGER_SECRET}}"
                },
                "publicDomain": "{{FACEBOOK_MESSENGER_PUBLIC_DOMAIN}}",
                "endpoint": "{{FACEBOOK_MESSENGER_ENDPOINT}}"
            });
        } else {
            const index = this.assistant.channelsConfig.findIndex(channelConfig => channelConfig.channelType === "facebookMessenger");
            if (index > -1) {
                this.assistant.channelsConfig.splice(index, 1);
            }
        }
        this.cdRef.detectChanges();
    }

    deleteAssistant() {
        this.assistantService.deleteAssistant();
    }

    addWelcomeMessageVariation() {
        if (!this.assistant.welcomeMessageStart) {
            this.assistant.welcomeMessageStart = [];
        }
        this.assistant.welcomeMessageStart.push("");
    }

    removeWelcomeMessageVariation(index: number) {
        this.assistant.welcomeMessageStart.splice(index, 1);
    }

    addFallbackReplyVariation() {
        if (!this.assistant.fallbackReplies) {
            this.assistant.fallbackReplies = [];
        }
        this.assistant.fallbackReplies.push("");
    }

    removeFallbackReplyVariation(index: number) {
        this.assistant.fallbackReplies.splice(index, 1);
    }

    customTrackByIndex(index: number, obj: any): any {
    	return index;
    }

}
