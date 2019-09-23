import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import { ThemeService, Theme } from '@app/core/services';
import { Subscription } from 'rxjs';


@Component({
    selector: 'global-navbar',
    templateUrl: './global-navbar.component.html',
    styleUrls: ['./global-navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalNavbarComponent implements OnInit, OnDestroy, AfterViewInit {

    private readonly BRAND_IMAGE_LIGHT = "/assets/images/brand-alpha-light.png";
    private readonly BRAND_IMAGE_DARK = "/assets/images/brand-alpha.png";

    brandImageUrl: string = this.BRAND_IMAGE_DARK;
    darkThemeActive: boolean = false;

    onThemeChangeSubscription: Subscription;

    constructor(private themeService: ThemeService, private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.onThemeChangeSubscription = this.themeService.onThemeChange$.subscribe((theme: Theme) => this.onThemeChange(theme));
        this.onThemeChange(this.themeService.getCurrentTheme());
    }

    ngOnDestroy() {
        this.onThemeChangeSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.cdRef.detach();
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

    toggleDarkTheme() {
        this.themeService.toggleDarkTheme();
    }

}
