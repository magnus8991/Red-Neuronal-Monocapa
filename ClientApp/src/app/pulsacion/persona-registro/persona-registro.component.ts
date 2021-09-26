import { Component, OnInit } from '@angular/core';
import { Persona } from '../models/persona';
import { PersonaService } from '../../services/persona.service';

@Component({
  selector: 'app-persona-registro',
  templateUrl: './persona-registro.component.html',
  styleUrls: ['./persona-registro.component.css']
})
export class PersonaRegistroComponent implements OnInit {
  persona: Persona;

  constructor(private personaService: PersonaService) { }

  ngOnInit(): void {
    this.persona = new Persona();
  }

  add() {
    this.CalcularPulsacion();
    alert("Persona registrada con éxito" + JSON.stringify(this.persona));
    this.personaService.post(this.persona);
  }

  CalcularPulsacion() {
    this.persona.pulsaciones = (this.persona.sexo == "F")? (220 - this.persona.edad) / 10 : (210 - this.persona.edad) / 10;
  }
}