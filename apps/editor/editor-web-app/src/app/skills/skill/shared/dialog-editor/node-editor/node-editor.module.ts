import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared';
import { NodeEditorComponent } from './node-editor.component';
import {
    SendTextDialogActionComponent,
    AssignContextVariableDialogActionComponent
} from './dialog-actions';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        NodeEditorComponent,
        SendTextDialogActionComponent,
        AssignContextVariableDialogActionComponent
    ],
    providers: [],
    exports: [NodeEditorComponent]
})
export class NodeEditorModule { }
