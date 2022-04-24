import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared';
import { AssistantNavbarComponent } from './assistant-navbar';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        AssistantNavbarComponent
    ],
    exports: [
        AssistantNavbarComponent
    ]
})
export class AssistantSharedModule {
    static forRoot(): ModuleWithProviders<AssistantSharedModule> {
        return {
            ngModule: AssistantSharedModule,
            providers: []
        }
    }
}
