import { Component, OnInit, ViewChild } from '@angular/core';
import { StepEntradasComponent } from './secciones/step-entradas/step-entradas.component';
import { StepPesosComponent } from './secciones/step-pesos/step-pesos.component';
import { StepEntrenamientoComponent } from './secciones/step-entrenamiento/step-entrenamiento.component';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent implements OnInit {
  @ViewChild(StepEntradasComponent) childStepEntradas;
  @ViewChild(StepPesosComponent) childStepPesos;
  @ViewChild(StepEntrenamientoComponent) childStepEntrenamiento;

  constructor() { }

  ngOnInit() { }

  //Operaciones de reinicio de valores

  reiniciarParametrosYConfiguracion() {
    this.reiniciarStepEntradas();
    this.reiniciarStepPesos();
  }

  reiniciarEntrenamiento() {
    this.reiniciarStepEntradas();
    this.reiniciarStepPesos();
    this.reiniciarStepEntrenamiento();
  }

  entrenarEvent() {
    let ConfigYParamsTraining = {
      checkRampa: this.childStepEntradas.checkRampa,
      checkEscalon: this.childStepEntradas.checkEscalon,
      checkSistema: this.childStepEntradas.checkSistema,
      numeroIteraciones: this.childStepEntradas.numeroIteraciones,
      rataAprendizaje: this.childStepEntradas.rataAprendizaje,
      errorMaximoPermitido: this.childStepEntradas.errorMaximoPermitido,
    }
    this.childStepEntrenamiento.entrenar(ConfigYParamsTraining, this.childStepEntradas.parametrosEntrada);
  }

  guardarPesosYConfRedEvent() {
    let funcionesActivacion = {
      checkRampa: this.childStepEntradas.checkRampa,
      checkEscalon: this.childStepEntradas.checkEscalon
    };
    this.childStepEntrenamiento.guardarPesosYConfRed(funcionesActivacion);
  }

  //Operaciones de eventos (comunicación entre componentes)

  actualizarParametrosEntrada() {
    this.childStepPesos.parametrosEntrada = this.childStepEntradas.parametrosEntrada;
  }

  reiniciarStepPesos() {
    this.childStepPesos.reiniciarStepPesos();
  }

  //Operaciones de reinicio de valores (comunicación entre componentes)

  reiniciarStepEntradas() {
    this.childStepEntradas.reiniciarStepEntradas();
  }

  reiniciarStepEntrenamiento() {
    this.childStepEntrenamiento.reiniciarStepEntrenamiento();
  }
}