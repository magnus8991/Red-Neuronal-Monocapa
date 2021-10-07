import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EntrenamientoComponent} from './RedMonocapa/Componentes/entrenamiento/entrenamiento.component';
import { SimulacionComponent} from './RedMonocapa/Componentes/simulación/simulacion.component';

const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'simulacion', component: SimulacionComponent},
    {path: 'entrenamiento', component: EntrenamientoComponent},
    { path: '', component: HomeComponent }
  ];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
