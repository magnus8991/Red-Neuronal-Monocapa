import { Component, OnInit } from '@angular/core';
import { Persona } from '../models/persona';
import { PersonaService } from '../../services/persona.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-persona-consulta',
  templateUrl: './persona-consulta.component.html',
  styleUrls: ['./persona-consulta.component.css']
})
export class PersonaConsultaComponent implements OnInit {
  personas: Persona[];
  tipoConsulta: string;
  totalHombres: number;
  totalMujeres: number;
  totalPersonas: number;

  constructor(private personaService: PersonaService) { }

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
