import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';

import { LANGUAGES } from '@app/shared';
import { MultiLanguageSkill } from '../shared/models/skill';
import { SkillService } from '../skill.service';
import { Subscription } from 'rxjs';
import { newEmptySkill, duplicateSkillAndEmptyValues } from '@app/skills/utils';

@Component({
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {

    skill: MultiLanguageSkill;
    numIntents: number = 0;
    numEntities: number = 0;
    numNodes: number = 0;

    availableLanguages: any;
    showWarningPopup: boolean = false;

    private pendingDeleteLanguageIndex: number;

    multiLanguageSkillChangeSubscription: Subscription;
    activeLanguageChangeSubscription: Subscription;


    constructor(private skillService: SkillService, private cdRef: ChangeDetectorRef) {
        this.skill = this.skillService.multiLanguageSkill;
        this.updateNumIntentsEntitiesAndNodes();
        this.updateLanguages();

        this.multiLanguageSkillChangeSubscription = this.skillService.multiLanguageSkillChange$
            .subscribe(multiLanguageSkill => {
                this.skill = multiLanguageSkill;
                this.updateLanguages();
                this.updateNumIntentsEntitiesAndNodes();
                this.cdRef.detectChanges();
            });

        this.activeLanguageChangeSubscription = this.skillService.activeLanguageChange$
            .subscribe(language => {
                this.updateNumIntentsEntitiesAndNodes();
                this.cdRef.detectChanges();
            });
    }


    ngOnInit() {

    }

    ngAfterViewInit() {
        this.cdRef.detach();
    }

    ngOnDestroy() {
        this.multiLanguageSkillChangeSubscription.unsubscribe();
        this.activeLanguageChangeSubscription.unsubscribe();
    }

    onNameChange(name: string) {
        this.cdRef.detectChanges();
    }

    onDescriptionChange(description: string) {
        this.cdRef.detectChanges();
    }

    updateLanguages() {
        this.availableLanguages = Object.keys(LANGUAGES).map(k => {
            return {
                id: LANGUAGES[k].id,
                name: LANGUAGES[k].name,
                isActive: this.isLanguageSelected(LANGUAGES[k].id)
            }
        });
    }

    isLanguageSelected(code: string): boolean {
        if (!this.skill) {
            return false;
        }
        return this.skill.languages.indexOf(code) > -1;
    }

    updateSkillLanguages(availableLanguagesIndex: number, code: string) {
        const index = this.skill.languages.indexOf(code);
        if (index > -1) {
            this.showWarningPopup = true;
            this.pendingDeleteLanguageIndex = index;
            this.cdRef.detectChanges();
        } else {
            this.skill.languages.push(code);
            this.updateCheckboxes();
            if (this.skill.languages.length === 1) {
                this.skill.skills.set(code, newEmptySkill(this.skill.id, this.skill.name, this.skill.description, code));
            } else {
                const firstSkill = this.skill.skills.values().next().value;
                this.skill.skills.set(code, duplicateSkillAndEmptyValues(firstSkill, code));
            }
            this.skillService.activeLanguage = code;
            this.skillService.activeLanguageChange$.emit(this.skillService.activeLanguage);
        }

    }

    cancelLanguageDelete() {
        this.showWarningPopup = false;
        this.pendingDeleteLanguageIndex = undefined;
        this.updateCheckboxes();
        this.cdRef.detectChanges();
    }

    confirmLanguageDelete() {
        const lang = this.skill.languages[this.pendingDeleteLanguageIndex];
        this.skill.skills.delete(this.skill.languages[this.pendingDeleteLanguageIndex]);
        this.skill.languages.splice(this.pendingDeleteLanguageIndex, 1);
        this.showWarningPopup = false;
        this.pendingDeleteLanguageIndex = undefined;
        this.updateCheckboxes();
        if (this.skill.languages.length === 0) {
            this.skillService.activeLanguage = "";
            this.skillService.activeLanguageChange$.emit(this.skillService.activeLanguage);
        } else if (lang === this.skillService.activeLanguage) {
            this.skillService.activeLanguage = this.skill.languages[0];
            this.skillService.activeLanguageChange$.emit(this.skillService.activeLanguage);
        }
        this.skillService.multiLanguageSkillChange$.emit(this.skillService.multiLanguageSkill);
    }

    private updateCheckboxes() {
        this.availableLanguages
            .forEach(lang => lang.isActive = this.isLanguageSelected(lang.id));
        this.cdRef.detectChanges();
    }

    private updateNumIntentsEntitiesAndNodes() {
        this.numIntents = 0;
        this.numEntities = 0;
        this.numNodes = 0;

        if (!this.skill || this.skill.skills.size === 0 || !this.skillService.activeLanguage) {
            return;
        }

        const langSkill = this.skill.skills.get(this.skillService.activeLanguage);

        if (langSkill.nluDataset) {
            this.numIntents = langSkill.nluDataset.intents.length;
            this.numEntities = langSkill.nluDataset.entities.length;
        }
        if (langSkill.dialog) {
            this.numNodes = langSkill.dialog.nodes.length;
        }
    }

    deleteSkill() {
        this.skillService.deleteMultiLanguageSkill();
    }

}
