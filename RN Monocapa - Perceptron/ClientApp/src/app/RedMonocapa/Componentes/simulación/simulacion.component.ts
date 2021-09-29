import { Component, OnInit } from '@angular/core';
import { ParametrosEntrada } from '../../Modelos/parametrosEntrada';
import { SimulacionService } from '../../Servicios/simulacion.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-simulacion',
  templateUrl: './simulacion.component.html',
  styleUrls: ['./simulacion.component.css']
})
export class SimulacionComponent implements OnInit {
  personas: ParametrosEntrada[];
  tipoConsulta: string;
  totalHombres: number;
  totalMujeres: number;
  totalPersonas: number;

  constructor(private personaService: SimulacionService) { }

  ngOnInit(): void {
    this.personas = [];
  }

  filtradoDePersonas() {
    if (this.tipoConsulta != "0")
    {
      this.personas = (this.tipoConsulta == "Todos")?  this.personaService.get()
      : this.personaService.get().filter(p => p.sexo == this.tipoConsulta);
      this.llenarTotales();
    }
    else
    {
      this.personas = []; this.totalHombres = null;
      this.totalMujeres = null; this.totalPersonas = null;
    }
  }

  llenarTotales() {
    this.totalHombres = (this.tipoConsulta == "Femenino")? 0 : this.personaService.TotalizarPorTipo("Masculino");
    this.totalMujeres = (this.tipoConsulta == "Masculino" )? 0 : this.personaService.TotalizarPorTipo("Femenino");
    this.totalPersonas = (this.tipoConsulta == "Todos")? this.personaService.TotalizarPorTipo("Todos") 
    : this.totalPersonas = this.personaService.TotalizarPorTipo(this.tipoConsulta);
  }
}
