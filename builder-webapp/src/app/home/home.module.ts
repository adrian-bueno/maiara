import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule, routerComponents } from './home-routing.module';
import { CoreModule } from '@app/core';


@NgModule({
  imports: [
      CommonModule,
      HomeRoutingModule,
      CoreModule
  ],
  declarations: [
      ...routerComponents
  ],
  providers: [],
  exports: []
})
export class HomeModule { }
