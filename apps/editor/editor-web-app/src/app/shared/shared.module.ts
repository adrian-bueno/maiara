import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BottomSlidePanelComponent } from './bottom-slide-panel';
import { ContentEditableTextComponent } from './content-editable-text';


@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        BottomSlidePanelComponent,
        ContentEditableTextComponent
    ],
    exports: [
        BottomSlidePanelComponent,
        ContentEditableTextComponent
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: []
        }
    }
}
