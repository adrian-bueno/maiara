import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SkillComponent } from './skill.component';
import { HomePageComponent } from './home-page';
import { IntentsPageComponent } from './intents-page';
import { EntitiesPageComponent } from './entities-page';
import { DialogPageComponent } from './dialog-page';


const routes: Routes = [
    {
        path: '',
        component: SkillComponent,
        children: [
            {
                path: '',
                component: HomePageComponent
            },
            {
                path: 'intents',
                component: IntentsPageComponent
            },
            {
                path: 'entities',
                component: EntitiesPageComponent
            },
            {
                path: 'dialog',
                component: DialogPageComponent,
            }
        ]
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
export class SkillRoutingModule { }

export const routerComponents = [
    HomePageComponent,
    IntentsPageComponent,
    EntitiesPageComponent,
    DialogPageComponent
];
