import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './components/config/config.component';
import { HelpComponent } from './components/help/help.component';

const routes: Routes = [
  { path: '', component:  ConfigComponent},
  { path: 'help', component:  HelpComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }