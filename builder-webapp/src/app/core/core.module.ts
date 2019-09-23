import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { GlobalNavbarComponent } from './components';
import { ThemeService, BuilderService } from './services';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HttpClientModule
    ],
    declarations: [
        GlobalNavbarComponent
    ],
    exports: [
        GlobalNavbarComponent
    ]
})
export class CoreModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: [ThemeService, BuilderService]
        }
    }
}
