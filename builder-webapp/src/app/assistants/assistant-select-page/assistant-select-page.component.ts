import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Assistant } from '../models/assistant';
import { BuilderService } from '@app/core';


@Component({
    templateUrl: './assistant-select-page.component.html',
    styleUrls: ['./assistant-select-page.component.scss']
})
export class AssistantSelectPageComponent implements OnInit {

    assistants: Assistant[] = [];
    showAssistantCreationPopup: boolean = false;

    newAssistantId: string;
    newAssistantName: string;
    newAssistantDescription: string;

    constructor(private builderService: BuilderService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.builderService.getAllAssistantsInfo().then(assistants => {
            this.assistants = assistants;
            this.cdRef.detectChanges();
        });
    }

    createNewAssistant() {
        this.showAssistantCreationPopup = true;
    }

    cancelAssistantCreation() {
        this.newAssistantId = "";
        this.newAssistantName = "";
        this.newAssistantDescription = "";
        this.showAssistantCreationPopup = false;
    }

    onNewAssistantIdChange() {
        if (this.newAssistantId) {
            this.newAssistantId = this.newAssistantId.replace(/[^a-z0-9_]+/g, "");
        }
    }

    confirmAssistantCreation() {

        if (!this.newAssistantId || this.newAssistantId.trim().length === 0
            || !this.newAssistantName || this.newAssistantName.trim().length === 0) {
                return;
        }

        this.newAssistantId = this.newAssistantId.trim();
        this.newAssistantName = this.newAssistantName.trim();

        this.newAssistantId = this.newAssistantId.replace(/[^a-z0-9_]+/g, "");

        const assistant: Assistant = {
            id: this.newAssistantId,
            name: this.newAssistantName,
            description: this.newAssistantDescription,
            detectLanguage: false,
            fallbackReplies: [],
            welcomeMessageStart: [],
            skillsIds: [],
            channelsConfig: [],
            defaultLanguage: null
        }

        console.log("new assistant", assistant);

        this.assistants.push(assistant);

        // TODO update service

        this.showAssistantCreationPopup = false;
    }


}
