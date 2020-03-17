import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SkillSelectPageComponent } from './skill-select-page';

const routes: Routes = [
    {
        path: ':skillId',
        loadChildren: () => import('./skill/skill.module').then(m => m.SkillModule)
    },
    {
        path: '',
        component: SkillSelectPageComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillsRoutingModule { }

export const routerComponents = [
    SkillSelectPageComponent,
];
