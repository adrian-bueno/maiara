import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillsRoutingModule, routerComponents } from './skills-routing.module';
import { CoreModule } from '@app/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SkillsRoutingModule,
        CoreModule
    ],
    declarations: [
        ...routerComponents,
    ],
    providers: [],
})
export class SkillsModule { }
