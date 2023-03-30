import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

//components
import { AppComponent } from './app.component';
import { ConfigComponent } from './components/config/config.component';
import { PreviewComponent } from './components/preview/preview.component';
import { HelpComponent } from './components/help/help.component';

//services
import { AppsService } from './services/apps.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    PreviewComponent,
    HelpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule
  ],
  providers: [AppsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
