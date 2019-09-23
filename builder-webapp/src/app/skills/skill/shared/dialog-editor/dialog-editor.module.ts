import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SharedModule } from '@app/shared';
import { DialogEditorComponent } from './dialog-editor.component';
import { NodeComponent } from './node';
import { NodeEditorModule } from './node-editor';


@NgModule({
    imports: [
        DragDropModule,
        CommonModule,
        FormsModule,
        SharedModule,
        NodeEditorModule
    ],
    declarations: [
        DialogEditorComponent,
        NodeComponent
    ],
    providers: [],
    exports: [DialogEditorComponent]
})
export class DialogEditorModule { }
