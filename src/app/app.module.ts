import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';

//components
import { AppComponent } from './app.component';
import { ConfigComponent } from './components/config/config.component';
import { PreviewComponent } from './components/preview/preview.component';
import { HelpComponent } from './components/help/help.component';
import { EditComponent } from './components/edit/edit.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';

//services
import { AppsService } from './services/apps.service';

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    PreviewComponent,
    HelpComponent,
    EditComponent,
    HomeComponent,
    FooterComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [AppsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
