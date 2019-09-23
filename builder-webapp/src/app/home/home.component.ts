import { Component, ChangeDetectorRef } from '@angular/core';

import { ThemeService, Theme, BuilderService } from '@app/core';


@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    private readonly BRAND_IMAGE_LIGHT = "/assets/images/home-brand-light.png";
    private readonly BRAND_IMAGE_DARK = "/assets/images/home-brand.png";

    brandImageUrl: string = this.BRAND_IMAGE_DARK;
    darkThemeActive: boolean = false;

    numAssistants: number = 0;
    numSkills: number = 0;

    constructor(private themeService: ThemeService, private cdRef: ChangeDetectorRef,
        private builderService: BuilderService) {
            
        this.cdRef.detach();
        this.themeService.onThemeChange$.subscribe((theme: Theme) => this.onThemeChange(theme));
    }

    ngOnInit() {
        this.onThemeChange(this.themeService.getCurrentTheme());
        this.builderService.getAllAssistantIds().then(list => {
            this.numAssistants = list.length;
            this.cdRef.detectChanges();
        });
        this.builderService.getAllSkillsIds().then(list => {
            this.numSkills = list.length;
            this.cdRef.detectChanges();
        });
    }

    private onThemeChange(theme: Theme) {
        if (theme === Theme.Dark) {
            this.darkThemeActive = true;
        } else {
            this.darkThemeActive = false;
        }
        this.changeBrandImage(theme);
        this.cdRef.detectChanges();
    }

    private changeBrandImage(theme: Theme) {
        if (theme === Theme.Dark) {
            this.brandImageUrl = this.BRAND_IMAGE_LIGHT;
        } else {
            this.brandImageUrl = this.BRAND_IMAGE_DARK;
        }
    }

}
