import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared';
import { SkillNavbarComponent } from './skill-navbar'
import { IntentEditorComponent } from './intent-editor'
import { DialogEditorModule } from './dialog-editor'
import { UtteranceEditorModule } from './utterance-editor'
import { EntityEditorModule } from './entity-editor';
import { SystemEntitiesEditorComponent } from './system-entities-editor';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        DialogEditorModule,
        UtteranceEditorModule,
        EntityEditorModule,
        SharedModule
    ],
    declarations: [
        SkillNavbarComponent,
        IntentEditorComponent,
        SystemEntitiesEditorComponent
    ],
    exports: [
        SkillNavbarComponent,
        DialogEditorModule,
        UtteranceEditorModule,
        IntentEditorComponent,
        EntityEditorModule,
        SystemEntitiesEditorComponent
    ]
})
export class SkillSharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SkillSharedModule,
            providers: []
        }
    }
}
