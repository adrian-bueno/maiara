import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared';
import { EntityEditorComponent } from './entity-editor.component';
import { EntityDataEditorComponent } from './entity-data-editor';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        EntityEditorComponent,
        EntityDataEditorComponent
    ],
    exports: [EntityEditorComponent]
})
export class EntityEditorModule { }
