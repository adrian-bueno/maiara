import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app/shared';
import { StyleGalleryRoutingModule, routerComponents } from './style-gallery-routing.module';

@NgModule({
  imports: [
      CommonModule,
      StyleGalleryRoutingModule,
      SharedModule
  ],
  declarations: [
      ...routerComponents
  ],
  providers: [],
  exports: []
})
export class StyleGalleryModule { }
