import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './components/help/help.component';
import { EditComponent } from './components/edit/edit.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component:  HomeComponent},
  { path: 'edit', component: EditComponent },
  { path: 'help', component:  HelpComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }