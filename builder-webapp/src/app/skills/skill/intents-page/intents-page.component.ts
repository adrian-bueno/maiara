import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { Intent, UtteranceItem } from '../shared';
import { SkillService } from '../skill.service';
import { Subscription } from 'rxjs';
import { MultiLanguageSkill } from '../shared/models/skill';



@Component({
    templateUrl: './intents-page.component.html',
    styleUrls: ['./intents-page.component.scss']
})
export class IntentsPageComponent implements OnInit, OnDestroy, AfterViewInit {

    intents: Intent[] = [];
    firstChange: boolean = true;
    isIntentEditorOpen: boolean = false;
    activeClases: string;
    activeIntent: Intent;
    newIntentName: string;
    warningMessage: string = "";

    multiLanguageSkillChangeSubscription: Subscription;
    activeLanguageChangeSubscription: Subscription;


    constructor(private skillService: SkillService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.updateClasses();

        this.updateIntents(this.skillService.multiLanguageSkill, this.skillService.activeLanguage);

        this.multiLanguageSkillChangeSubscription = this.skillService.multiLanguageSkillChange$
            .subscribe(multiLanguageSkill => this.updateIntents(this.skillService.multiLanguageSkill, this.skillService.activeLanguage));

        this.activeLanguageChangeSubscription = this.skillService.activeLanguageChange$
            .subscribe(language => this.updateIntents(this.skillService.multiLanguageSkill, this.skillService.activeLanguage));
    }

    ngOnDestroy() {
        if (this.activeIntent && !this.activeIntent.name) {
            this.activeIntent.name = "<empty>"
        }
        this.removeActiveIntentEmptyUtterances();

        this.multiLanguageSkillChangeSubscription.unsubscribe();
        this.activeLanguageChangeSubscription.unsubscribe();
    }

    ngAfterViewInit() {

    }

    private updateIntents(multiLanguageSkill: MultiLanguageSkill, language: string) {
        if (!multiLanguageSkill || !multiLanguageSkill.skills || !language) {
            this.intents = [];
            return;
        }
        const skill = multiLanguageSkill.skills.get(language);
        if (!skill || !skill.nluDataset || !skill.nluDataset.intents) {
            this.intents = [];
            return;
        }
        this.intents = skill.nluDataset.intents;

        if (this.activeIntent) {
            const index = this.intents.findIndex(intent => this.activeIntent.name === intent.name);
            this.activeIntent = this.intents[index];
        }

        this.cdRef.detectChanges();
    }

    private updateClasses() {
        if (this.firstChange && this.isIntentEditorOpen)
            this.activeClases = "is-open";
        else if (this.firstChange && !this.isIntentEditorOpen)
            this.activeClases = "is-closed";
        else if (!this.firstChange && this.isIntentEditorOpen)
            this.activeClases = "open";
        else
            this.activeClases = "close";
    }


    // TODO FIXME dont close if name is repeated
    toggleIntentEditor(intentIndex?: number) {
        if (this.isIntentEditorOpen) {
            if (!this.activeIntent.name) {
                // Dont close if name is empty
                return;
            }
            this.removeActiveIntentEmptyUtterances();
            this.isIntentEditorOpen = false;
            this.activeIntent = undefined;
        } else {
            this.isIntentEditorOpen = true;
            this.activeIntent = this.intents[intentIndex];
        }
        this.firstChange = false;
        this.updateClasses();
    }

    // TODO FIXME set original name if new name is repeated
    onIntentNameChange(name: string) {
        const intent = this.intents.find(intent => intent.name === name);
        if (intent && intent !== this.activeIntent) {
            this.warningMessage = "There is already an intent with that name!";
            return;
        }
    }

    // Alternative event to update all datasets intent name
    onNewIntentName($event) {
        this.skillService.changeIntentNameNotActiveDatasets($event.currentName, $event.newName);
    }

    onUtterancesChange(utterances: UtteranceItem[][]) {

    }

    createIntent() {
        if (this.newIntentName) {

            const intent = this.intents.find(intent => intent.name === this.newIntentName);
            if (intent) {
                this.warningMessage = "There is already an intent with that name!";
                return;
            }

            this.intents.push({
                name: this.newIntentName,
                utterances: []
            });
            this.skillService.addIntentNotActiveDatasets(this.newIntentName);
            this.newIntentName = "";
        }
    }

    deleteIntent(_event: Event, index: number) {
        const intent = this.intents[index];
        this.skillService.deleteIntentNotActiveDatasets(intent.name);
        this.intents.splice(index, 1);
    }

    removeActiveIntentEmptyUtterances() {
        if (!this.activeIntent) {
            return;
        }
        this.activeIntent.utterances = this.activeIntent.utterances.filter(u => u.length > 0);
    }

    closeWarningPopup() {
        this.warningMessage = "";
    }

    onNewEntityAssigned($event) {
        this.skillService.onNewEntityAssigned($event);
    }

}
