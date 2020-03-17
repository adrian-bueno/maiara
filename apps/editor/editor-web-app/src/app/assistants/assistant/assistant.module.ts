import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AssistantSharedModule } from './shared';
import { SharedModule } from '@app/shared';
import { AssistantRoutingModule, routerComponents } from './assistant-routing.module';
import { CoreModule } from '@app/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        AssistantRoutingModule,
        AssistantSharedModule,
        CoreModule
    ],
    declarations: [
        ...routerComponents
    ],
    providers: []
})
export class AssistantModule { }
