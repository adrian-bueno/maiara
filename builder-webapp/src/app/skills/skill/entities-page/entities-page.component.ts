import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { SystemEntity, Entity } from '../shared';
import { SkillService } from '../skill.service';
import { Subscription } from 'rxjs';
import { MultiLanguageSkill } from '../shared/models/skill';


@Component({
    templateUrl: './entities-page.component.html',
    styleUrls: ['./entities-page.component.scss']
})
export class EntitiesPageComponent implements OnInit, OnDestroy {

    entities: Entity[];
    systemEntities: SystemEntity[];
    firstChange: boolean = true;
    isEntityEditorOpen: boolean = false;
    activeClases: string;
    newEntityName: string;
    activeEntity: Entity;
    warningMessage: string = "";

    multiLanguageSkillChangeSubscription: Subscription;
    activeLanguageChangeSubscription: Subscription;


    constructor(private skillService: SkillService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.updateClasses();

        this.updateEntities(this.skillService.multiLanguageSkill, this.skillService.activeLanguage);

        this.multiLanguageSkillChangeSubscription = this.skillService.multiLanguageSkillChange$
            .subscribe(multiLanguageSkill => this.updateEntities(this.skillService.multiLanguageSkill, this.skillService.activeLanguage));

        this.activeLanguageChangeSubscription = this.skillService.activeLanguageChange$
            .subscribe(language => this.updateEntities(this.skillService.multiLanguageSkill, this.skillService.activeLanguage));
    }

    ngOnDestroy() {
        if (this.activeEntity && !this.activeEntity.name) {
            this.activeEntity.name = "<empty>"
        }
        this.removeActiveEntityEmptyData();

        this.multiLanguageSkillChangeSubscription.unsubscribe();
        this.activeLanguageChangeSubscription.unsubscribe();
    }

    private updateEntities(multiLanguageSkill: MultiLanguageSkill, language: string) {
        if (!multiLanguageSkill || !multiLanguageSkill.skills || !language) {
            this.entities = [];
            this.systemEntities = [];
            return;
        }

        const skill = multiLanguageSkill.skills.get(language);

        if (!skill || !skill.nluDataset || !skill.nluDataset.entities) {
            this.entities = [];
        } else {
            this.entities = skill.nluDataset.entities;
        }

        if (!skill || !skill.nluDataset || !skill.nluDataset.systemEntities) {
            this.systemEntities = [];
        } else {
            this.systemEntities = skill.nluDataset.systemEntities;
        }

        if (this.activeEntity) {
            const index = this.entities.findIndex(entity => entity.name === this.activeEntity.name);
            this.activeEntity = this.entities[index];
        }

        this.cdRef.detectChanges();
    }

    createNewEntity() {
        if (this.newEntityName) {

            const entity = this.entities.find(entity => entity.name === this.newEntityName);
            if (entity) {
                this.warningMessage = "There is already an entity with that name!";
                return;
            }

            this.entities.push({
                name: this.newEntityName,
                data: []
            });
        }
        this.skillService.addEntityNotActiveDatasets(this.newEntityName);
        this.newEntityName = "";
    }

    deleteEntity(event: TouchEvent, index: number) {
        const entity = this.entities[index];
        this.skillService.deleteEntityNotActiveDatasets(entity.name);
        this.entities.splice(index, 1);
        this.skillService.onEntityDeletedUpdateUtterances(entity.name);
    }

    closeEntityEditor() {
        this.toggleEntityEditor(null);
    }

    // TODO FIXME dont close editor if entity name is repeated
    toggleEntityEditor(index: number) {
        if (this.isEntityEditorOpen) {
            if (!this.activeEntity.name) {
                // Dont close if name is empty
                return;
            }
            this.removeActiveEntityEmptyData();
            this.isEntityEditorOpen = false;
            this.activeEntity = undefined;
        } else {
            this.isEntityEditorOpen = true;
            this.activeEntity = this.entities[index];
        }
        this.firstChange = false;
        this.updateClasses();
    }

    private updateClasses() {
        if (this.firstChange && this.isEntityEditorOpen)
            this.activeClases = "is-open";
        else if (this.firstChange && !this.isEntityEditorOpen)
            this.activeClases = "is-closed";
        else if (!this.firstChange && this.isEntityEditorOpen)
            this.activeClases = "open";
        else
            this.activeClases = "close";
    }

    onEntityChange(entity: Entity) {

    }

    onNewEntityName($event) {
        this.skillService.changeEntityNameNotActiveDatasets($event.currentName, $event.newName);
    }

    onSystemEntityChange(systemEntity: SystemEntity) {
        this.skillService.updateSystemEntityNotActiveDatasets(systemEntity.name, systemEntity.enabled);
    }

    removeActiveEntityEmptyData() {
        if (!this.activeEntity) {
            return;
        }
        this.activeEntity.data = this.activeEntity.data.filter(data => data.value);
    }

    closeWarningPopup() {
        this.warningMessage = "";
    }

    // TODO FIXME set original name if new name is repeated
    onEntityNameChange(name: string) {
        const entity = this.entities.find(entity => entity.name === name);
        if (entity && entity !== this.activeEntity) {
            this.warningMessage = "There is already an entity with that name!";
            return;
        }
    }

    onEntityValueDeleted($event) {
        console.log("onEntityValueDeleted", $event);
        this.skillService.onEntityDeletedUpdateUtterances(this.activeEntity.name, $event.value);
    }

}
