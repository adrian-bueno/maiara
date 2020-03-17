import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssistantSelectPageComponent } from './assistant-select-page';


const routes: Routes = [
    {
        path: ':assistantId',
        loadChildren: () => import('./assistant/assistant.module').then(m => m.AssistantModule)
    },
    {
        path: '',
        component: AssistantSelectPageComponent
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
export class AssistantsRoutingModule { }

export const routerComponents = [
    AssistantSelectPageComponent
];
