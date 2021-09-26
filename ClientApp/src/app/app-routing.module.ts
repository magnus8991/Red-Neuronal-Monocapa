import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PersonaRegistroComponent } from './pulsacion/persona-registro/persona-registro.component';
import { PersonaConsultaComponent } from './pulsacion/persona-consulta/persona-consulta.component';

const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'personaConsulta', component: PersonaConsultaComponent},
    {path: 'personaRegistro', component: PersonaRegistroComponent},
    { path: '', component: HomeComponent }
  ];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
