import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { EntrenamientoComponent } from './RedMonocapa/Componentes/entrenamiento/entrenamiento.component';
import { SimulacionComponent } from './RedMonocapa/Componentes/simulación/simulacion.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { EntrenamientoService } from './RedMonocapa/Servicios/entrenamiento.service';
import { SimulacionService } from './RedMonocapa/Servicios/simulacion.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavMenuComponent,
    FooterComponent,
    HomeComponent,
    EntrenamientoComponent,
    SimulacionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule
  ],
  providers: [ EntrenamientoService, SimulacionService ],
  bootstrap: [AppComponent]
})
export class AppModule { }