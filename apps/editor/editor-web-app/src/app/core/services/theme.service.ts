import { Injectable, EventEmitter } from '@angular/core';

export enum Theme {
    Light = "light-theme",
    Dark = "dark-theme"
}

@Injectable()
export class ThemeService {

    private currentTheme: Theme;
    private readonly LOCAL_STORAGE_VAR = "currentTheme";
    private readonly META_THEME_COLOR_ID = "meta-theme-color";
    private readonly META_THEME_COLOR_LIGHT = "#fff";
    private readonly META_THEME_COLOR_DARK = "#222a2d";

    onThemeChange$: EventEmitter<Theme> = new EventEmitter<Theme>();

    constructor() {
        let savedTheme = this.getSavedCurrentTheme();
        this.changeTheme(savedTheme);
        this.changeMetaThemeColor(savedTheme);
        window.addEventListener('storage', event => this.onLocalStorageEvent(event));
    }

    getCurrentTheme(): Theme {
        return this.currentTheme;
    }

    private emitCurrentTheme() {
        this.onThemeChange$.emit(this.currentTheme);
    }

    changeTheme(theme: Theme) {
        if (this.currentTheme === theme)
            return;

        document.body.classList.add(theme);
        document.body.classList.remove(this.currentTheme);

        this.changeMetaThemeColor(theme);

        this.currentTheme = theme;
        localStorage.setItem(this.LOCAL_STORAGE_VAR, this.currentTheme);

        this.emitCurrentTheme();
    }

    toggleDarkTheme() {
        if (this.currentTheme === Theme.Dark) {
            this.changeTheme(Theme.Light);
        } else {
            this.changeTheme(Theme.Dark);
        }
    }

    changeMetaThemeColor(theme: Theme) {
        const meta = document.getElementById(this.META_THEME_COLOR_ID);
        if (meta) {
            if (theme === Theme.Light) {
                meta.setAttribute("content", this.META_THEME_COLOR_LIGHT);
            } else {
                meta.setAttribute("content", this.META_THEME_COLOR_DARK);
            }
        }
    }

    private getSavedCurrentTheme(): Theme {
        switch (localStorage.getItem(this.LOCAL_STORAGE_VAR)) {
            case Theme.Light:
                return Theme.Light;
            case Theme.Dark:
                return Theme.Dark;
            default:
                return Theme.Light;
        }
    }

    onLocalStorageEvent(event: any) {
        if (event.key === this.LOCAL_STORAGE_VAR) {
            this.changeTheme(this.getSavedCurrentTheme());
            this.emitCurrentTheme();
        }
    }

}
