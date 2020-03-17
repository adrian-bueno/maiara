import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MultiLanguageSkill, Skill } from '../skill/shared/models/skill';
import { BuilderService } from '@app/core';
import { SkillService } from '../skill/skill.service';
import { newEmptyMultiLanguageSkill } from '../utils';

@Component({
    templateUrl: './skill-select-page.component.html',
    styleUrls: ['./skill-select-page.component.scss']
})
export class SkillSelectPageComponent implements OnInit {

    skills: MultiLanguageSkill[];
    showSkillCreationPopup: boolean = false;

    newSkillId: string = "";
    newSkillName: string = "";
    newSkillDescription: string = "";

    loadingSkills: boolean = false;

    constructor(private builderService: BuilderService, private cdRef: ChangeDetectorRef) {

        this.builderService.getAllSkillsInfoDevelopVersion().then(skills => {
            this.skills = skills;
            // this.loadingSkills = false;
            this.cdRef.detectChanges();
        });

    }

    ngOnInit() {

    }

    createNewSkill() {
        this.showSkillCreationPopup = true;
    }

    cancelSkillCreation() {
        this.newSkillId = "";
        this.newSkillName = "";
        this.newSkillDescription = "";
        this.showSkillCreationPopup = false;
    }

    onNewSkillIdChange() {
        if (this.newSkillId) {
            this.newSkillId = this.newSkillId.replace(/[^a-z0-9_]+/g, "");
            this.cdRef.detectChanges();
        }
    }

    confirmSkillCreation() {

        if (!this.newSkillId || this.newSkillId.trim().length === 0
            || !this.newSkillName || this.newSkillName.trim().length === 0) {
                return;
        }

        this.newSkillId = this.newSkillId.trim();
        this.newSkillName = this.newSkillName.trim();

        this.newSkillId = this.newSkillId.replace(/[^a-z0-9_]+/g, "");

        if (this.newSkillId.length === 0) {
            return;
        }

        const index = this.skills.findIndex(skill => skill.id === this.newSkillId);
        if (index > -1) {
            return;
        }

        const multiLanguageSkill = newEmptyMultiLanguageSkill(this.newSkillId, this.newSkillName, this.newSkillDescription);


        this.builderService.saveMultiLanguageSkill(multiLanguageSkill, "develop")
            .then(() => {
                this.skills.push(multiLanguageSkill);
                this.cdRef.detectChanges();
            })
            .catch(error => {
                console.error(error);
            });


        this.showSkillCreationPopup = false;
    }


}
