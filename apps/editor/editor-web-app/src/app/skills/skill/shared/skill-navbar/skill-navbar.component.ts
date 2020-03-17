import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SkillService } from '../../skill.service';
import { Subscription } from 'rxjs';


const LANGUAGES = {
    undefined: "(No language)",
    "": "(No language)",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
    "pt_pt": "Portuguese (Europe)",
    "pt_br": "Portuguese (Brazil)",
    "ja": "Japanese",
    "ko": "Korean",
};


@Component({
    selector: 'skill-navbar',
    templateUrl: './skill-navbar.component.html',
    styleUrls: ['./skill-navbar.component.scss']
})
export class SkillNavbarComponent implements OnInit, OnDestroy {

    skillName: string;
    languages: string[];
    activeLanguage: string;

    savingSkill: boolean = false;

    activeLanguageChangeSubscription: Subscription;
    multiLanguageSkillChangeSubscription: Subscription;
    showChangeLanguagePopup: boolean = false;


    constructor(private skillService: SkillService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.skillService.activeLanguage;
        if (this.skillService.multiLanguageSkill) {
            this.skillName = this.skillService.multiLanguageSkill.name;
        }
        this.cdRef.detectChanges();

        this.activeLanguageChangeSubscription = this.skillService.activeLanguageChange$
            .subscribe(activeLanguage => {
                this.activeLanguage = activeLanguage;
                this.cdRef.detectChanges();
            });
        this.multiLanguageSkillChangeSubscription = this.skillService.multiLanguageSkillChange$
            .subscribe(multiLanguageSkill => {
                this.skillName = multiLanguageSkill.name;
                this.languages = multiLanguageSkill.languages;
                this.cdRef.detectChanges();
            });


    }

    ngOnDestroy() {
        this.activeLanguageChangeSubscription.unsubscribe();
        this.multiLanguageSkillChangeSubscription.unsubscribe();
    }

    getLanguageName(languageCode: string) {
        return LANGUAGES[languageCode];
    }

    changeActiveLanguage(languageCode: string) {
        this.showChangeLanguagePopup = false;
        
        if (this.activeLanguage === languageCode) {
            return;
        }

        this.skillService.changeActiveLanguage(languageCode);
    }

    saveChanges() {
        this.savingSkill = true;
        this.cdRef.detectChanges();
        this.skillService.saveChanges().then(() => {
            this.savingSkill = false;
            this.cdRef.detectChanges();
        }).catch(error => {
            console.error(error);
            this.savingSkill = false;
            this.cdRef.detectChanges();
        })
    }

    clickChangeLanguageDropdown() {
        if (window.outerWidth <= 550) {
            this.showChangeLanguagePopup = true;
        }
    }

    cancelChangeLanguage() {
        this.showChangeLanguagePopup = false;
    }

}
