import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillComponent } from './skill.component';
import { SkillRoutingModule, routerComponents } from './skill-routing.module';
import {
    SkillSharedModule
} from './shared';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SkillRoutingModule,
        SharedModule,
        SkillSharedModule,
        CoreModule
    ],
    declarations: [
        ...routerComponents,
        SkillComponent,
    ],
    providers: []
})
export class SkillModule { }
