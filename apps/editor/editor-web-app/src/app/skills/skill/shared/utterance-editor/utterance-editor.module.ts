import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared';
import { UtteranceEditorComponent } from './utterance-editor.component';
import { UtteranceEntityEditorComponent } from './utterance-entity-editor';
import { UtteranceLineEditorComponent, UtteranceLineEditorItemComponent } from './utterance-line-editor';
import { NewEntityEditorComponent } from './new-entity-editor';

@NgModule({
    schemas: [],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        UtteranceEditorComponent,
        UtteranceLineEditorItemComponent,
        UtteranceEntityEditorComponent,
        UtteranceLineEditorComponent,
        NewEntityEditorComponent
    ],
    providers: [],
    exports: [UtteranceEditorComponent]
})
export class UtteranceEditorModule { }
