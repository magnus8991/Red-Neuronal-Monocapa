import { Component, OnInit } from '@angular/core';
import { ParametrosEntrada } from '../../Modelos/parametrosEntrada';
import { EntrenamientoService } from '../../Servicios/entrenamiento.service';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent implements OnInit {
  persona: ParametrosEntrada;

  constructor(private personaService: EntrenamientoService) { }

  ngOnInit(): void {
    this.persona = new ParametrosEntrada();
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