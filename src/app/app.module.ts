import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxEditorModule } from 'ngx-editor';

//components
import { AppComponent } from './app.component';
import { PreviewComponent } from './components/preview/preview.component';
import { HelpComponent } from './components/help/help.component';
import { EditComponent } from './components/edit/edit.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Error404Component } from './components/error404/error404.component';

//services
import { AppsService } from './services/apps.service';

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    HelpComponent,
    EditComponent,
    HomeComponent,
    FooterComponent,
    NavbarComponent,
    Error404Component
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule,
    NgxEditorModule
  ],
  providers: [AppsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
