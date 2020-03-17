import { Component, ChangeDetectionStrategy,
    ChangeDetectorRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dialog } from '../shared';
import { SkillService } from '../skill.service';
import { MultiLanguageSkill } from '../shared/models/skill';


@Component({
    selector: "dialog-page",
    templateUrl: './dialog-page.component.html',
    styleUrls: ['./dialog-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogPageComponent implements OnInit, OnDestroy, AfterViewInit {

    dialog: Dialog;

    multiLanguageSkillChangeSubscription: Subscription;
    activeLanguageChangeSubscription: Subscription;


    constructor(private skillService: SkillService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.updateDialog(this.skillService.multiLanguageSkill, this.skillService.activeLanguage);

        this.multiLanguageSkillChangeSubscription = this.skillService.multiLanguageSkillChange$
            .subscribe(multiLanguageSkill => this.updateDialog(this.skillService.multiLanguageSkill, this.skillService.activeLanguage));

        this.activeLanguageChangeSubscription = this.skillService.activeLanguageChange$
            .subscribe(language => this.updateDialog(this.skillService.multiLanguageSkill, this.skillService.activeLanguage));
    }

    ngOnDestroy() {
        this.multiLanguageSkillChangeSubscription.unsubscribe();
        this.activeLanguageChangeSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.cdRef.detach();
    }

    private updateDialog(multiLanguageSkill: MultiLanguageSkill, language: string) {
        if (!multiLanguageSkill || !multiLanguageSkill.skills || !language) {
            this.dialog = {
                nodes: [],
                edges: []
            }
            return;
        }

        const skill = multiLanguageSkill.skills.get(language);

        if (!skill || !skill.dialog) {
            this.dialog = {
                nodes: [],
                edges: []
            }
        } else {
            this.dialog = skill.dialog;
        }

        this.cdRef.detectChanges();
    }

}
