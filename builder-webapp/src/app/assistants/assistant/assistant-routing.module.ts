import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssistantPageComponent } from './assistant-page';
import { AssistantEnvironmentPageComponent } from './assistant-environment-page';
import { AssistantComponent } from './assistant.component';


const routes: Routes = [
    {
        path: '',
        component: AssistantComponent,
        children: [
            {
                path: 'environment/:environmentId',
                component: AssistantEnvironmentPageComponent
            },
            {
                path: '',
                component: AssistantPageComponent
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
export class AssistantRoutingModule { }

export const routerComponents = [
    AssistantComponent,
    AssistantPageComponent,
    AssistantEnvironmentPageComponent
];
