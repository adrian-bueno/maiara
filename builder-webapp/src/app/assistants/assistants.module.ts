import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AssistantsRoutingModule, routerComponents } from './assistants-routing.module';
import { CoreModule } from '@app/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AssistantsRoutingModule,
        CoreModule
    ],
    declarations: [
        ...routerComponents,
    ],
    providers: [],
})
export class AssistantsModule { }
