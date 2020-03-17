import { Component } from '@angular/core';

import { ThemeService, Theme } from '@app/core';


@Component({
    templateUrl: './style-gallery.component.html',
    styleUrls: ['./style-gallery.component.scss']
})
export class StyleGalleryComponent {

    bottomPanelIsOpen: boolean = false;

    constructor(private themeService: ThemeService) {

    }

    changeToLightTheme() {
        this.themeService.changeTheme(Theme.Light);
    }

    changeToDarkTheme() {
        this.themeService.changeTheme(Theme.Dark);
    }

    toggleBottomPanel() {
        if (this.bottomPanelIsOpen)
            this.bottomPanelIsOpen = false;
        else
            this.bottomPanelIsOpen = true;
    }

}
