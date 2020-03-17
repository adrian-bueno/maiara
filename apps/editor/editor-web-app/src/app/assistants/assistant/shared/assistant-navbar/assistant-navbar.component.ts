import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AssistantService } from '../../assistant.service';
import { Subscription } from 'rxjs';
import { Assistant } from '@app/assistants/models';


@Component({
    selector: 'assistant-navbar',
    templateUrl: './assistant-navbar.component.html',
    styleUrls: ['./assistant-navbar.component.scss']
})
export class AssistantNavbarComponent implements OnInit, OnDestroy {

    assistant: Assistant;
    environmentsIds: string[];
    environmentsChangeSubscription: Subscription;
    savingAssistant: boolean = false;
    startingAssistant: boolean = false;
    showStartAssistantPopup: boolean = false;
    warningPopup: boolean = false;
    warningMessage: string = "";
    showNewEnvironmentPopup: boolean = false;
    newEnvironmentId: string = "";

    constructor(private assistantService: AssistantService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        if (this.assistantService.assistant) {
            this.assistant = this.assistantService.assistant;
        }
        this.environmentsIds = this.assistantService.environments.map(e => e["id"]);
        this.cdRef.detectChanges();

        this.assistantService.assistantChange$.subscribe(assistant => {
            this.assistant = assistant;
        })

        this.environmentsChangeSubscription = this.assistantService.environmentsChange$
            .subscribe(envs => {
                this.environmentsIds = envs.map(e => e["id"]);
                this.cdRef.detectChanges();
            });
    }

    ngOnDestroy() {
        this.environmentsChangeSubscription.unsubscribe();
    }

    newEnvironment() {

        // TODO

    }

    saveAssistant() {
        this.savingAssistant = true;
        this.cdRef.detectChanges();
        this.assistantService.saveAssistant()
            .then(() => {
                this.savingAssistant = false;
                this.cdRef.detectChanges();
            }).catch(error => {
                console.error(error);
                this.warningPopup = true;
                this.warningMessage = "Error saving assistant data";
                this.savingAssistant = false;
                this.cdRef.detectChanges();
            });
    }

    startAssistant() {
        this.savingAssistant = true;
        this.cdRef.detectChanges();
        this.assistantService.saveAssistant()
            .then(() => {
                this.savingAssistant = false;
                this.showStartAssistantPopup = true;

                if (this.assistant.skillsIds.length === 0) {
                    this.warningPopup = true;
                    this.warningMessage = "No skills. Add at least 1 skill to your assistant.";
                    this.showStartAssistantPopup = false;
                    this.cdRef.detectChanges();
                    return;
                }

                if (this.assistant.channelsConfig.length === 0) {
                    this.warningPopup = true;
                    this.warningMessage = "No active channels";
                    this.showStartAssistantPopup = false;
                    this.cdRef.detectChanges();
                    return;
                }

                this.cdRef.detectChanges();

            }).catch(error => {
                console.error(error);
                this.warningPopup = true;
                this.warningMessage = "Error saving assistant data";
                this.showStartAssistantPopup = false;
                this.savingAssistant = false;
                this.cdRef.detectChanges();
            });
    }

    confirmStartAssistant(environmentId: string) {
        this.showStartAssistantPopup = false;
        this.startingAssistant = true;
        this.cdRef.detectChanges();

        this.assistantService.startAssistant(environmentId)
            .then(() => {
                this.startingAssistant = false;
                this.cdRef.detectChanges();
            }).catch(error => {
                console.error(error);
                this.startingAssistant = false;
                this.cdRef.detectChanges();
            });
    }

    cancelStartAssistant() {
        this.showStartAssistantPopup = false;
        this.cdRef.detectChanges();
    }

    closeWarningPopup() {
        this.warningPopup = false;
        this.warningMessage = "";
        this.cdRef.detectChanges();
    }

    addNewEnvironment() {
        this.showNewEnvironmentPopup = true;
        this.cdRef.detectChanges();
    }

    confirmAddNewEnvironment() {
        this.assistantService.newEnvironment(this.newEnvironmentId);
        this.newEnvironmentId = "";
        this.showNewEnvironmentPopup = false;
        this.cdRef.detectChanges();
    }

    cancelAddNewEnvironment() {
        this.newEnvironmentId = "";
        this.showNewEnvironmentPopup = false;
        this.cdRef.detectChanges();
    }

}
