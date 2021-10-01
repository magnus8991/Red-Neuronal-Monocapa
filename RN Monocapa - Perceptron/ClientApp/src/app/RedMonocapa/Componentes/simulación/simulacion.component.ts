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
}
