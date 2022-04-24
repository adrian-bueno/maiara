import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'assistants',
        loadChildren: () => import('@app/assistants/assistants.module').then(m => m.AssistantsModule)
    },
    {
        path: 'skills',
        loadChildren: () => import('@app/skills/skills.module').then(m => m.SkillsModule)
    },
    {
        path: 'home',
        loadChildren: () => import('@app/home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'style-gallery',
        loadChildren: () => import('@app/style-gallery/style-gallery.module').then(m => m.StyleGalleryModule)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
