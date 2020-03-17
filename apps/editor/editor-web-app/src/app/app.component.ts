import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ThemeService } from '@app/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

    constructor(private themeService: ThemeService) {

    }

}
