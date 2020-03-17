import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StyleGalleryComponent } from './style-gallery.component';

const routes: Routes = [
    {
        path: '',
        component: StyleGalleryComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StyleGalleryRoutingModule { }

export const routerComponents = [
    StyleGalleryComponent
];
