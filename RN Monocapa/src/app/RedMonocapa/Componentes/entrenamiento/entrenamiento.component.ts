import { Component, OnInit, ViewChild } from '@angular/core';
import { StepEntradasComponent } from './secciones/step-entradas/step-entradas.component';
import { StepPesosComponent } from './secciones/step-pesos/step-pesos.component';
import { StepEntrenamientoComponent } from './secciones/step-entrenamiento/step-entrenamiento.component';
import { ValidacionesService } from '../../Servicios/validaciones.service';
import { ParametrosEntrada } from '../../Modelos/parametrosEntrada';
import { MatrizPesosSinapticos } from '../../Modelos/matrizPesosSinapticos';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent implements OnInit {
  @ViewChild(StepEntradasComponent) childStepEntradas;
  @ViewChild(StepPesosComponent) childStepPesos;
  @ViewChild(StepEntrenamientoComponent) childStepEntrenamiento;

  constructor(private validaciones: ValidacionesService,
    private toastr: ToastrService) { }

  ngOnInit() { }

  //Operaciones de eventos (comunicación entre componentes)

  reiniciarParametrosYConfiguracion() {
    this.reiniciarEntrenamiento();
  }

  reiniciarEntrenamiento() {
    this.reiniciarStepEntradas();
    this.reiniciarStepPesos();
    this.reiniciarStepEntrenamiento();
  }

  entrenar() {
    let ConfigYParamsTraining = {
      checkRampa: this.childStepEntradas.checkRampa,
      checkEscalon: this.childStepEntradas.checkEscalon,
      checkSistema: this.childStepEntradas.checkSistema,
      numeroIteraciones: this.childStepEntradas.numeroIteraciones.value,
      rataAprendizaje: this.childStepEntradas.rataAprendizaje.value,
      errorMaximoPermitido: this.childStepEntradas.errorMaximoPermitido.value,
    }
    if (!this.isValidConfigYParametros(ConfigYParamsTraining, this.childStepEntradas.parametrosEntrada, 
      this.childStepPesos.pesosSinapticos)) return;
    this.childStepEntrenamiento.entrenar(ConfigYParamsTraining, this.childStepEntradas.parametrosEntrada);
  }

  guardarPesosYConfRed() {
    let funcionesActivacion = {
      checkRampa: this.childStepEntradas.checkRampa,
      checkEscalon: this.childStepEntradas.checkEscalon
    };
    this.childStepEntrenamiento.guardarPesosYConfRed(funcionesActivacion);
  }

  actualizarParametrosEntrada() {
    this.childStepPesos.parametrosEntrada = this.childStepEntradas.parametrosEntrada;
    this.childStepEntrenamiento.actualizarGraficaSalidasDeseadas();
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

  //Pre-validacion del entrenamiento

  isValidConfigYParametros(ConfigYParamsTraining, parametrosEntrada: ParametrosEntrada, pesosSinapticos: MatrizPesosSinapticos): boolean {
    if (!this.validaciones.checkConfiguracionRed(parametrosEntrada, pesosSinapticos,
      ConfigYParamsTraining.checkEscalon, ConfigYParamsTraining.checkRampa, ConfigYParamsTraining.numeroIteraciones,
      ConfigYParamsTraining.rataAprendizaje, ConfigYParamsTraining.errorMaximoPermitido, ConfigYParamsTraining.checkSistema)) {
      this.toastr.warning(!this.validaciones.checkParametrosEntrada(parametrosEntrada) ?
        'Verifique el cargue y la configuración de los parámetros de entrada' :
        !this.validaciones.checkFuncionActivacion(ConfigYParamsTraining.checkEscalon, ConfigYParamsTraining.checkRampa,
          ConfigYParamsTraining.checkSistema) ? 'Verifique la configuración de la función de activación' :
          !this.validaciones.checkParametrosEntrenamiento(ConfigYParamsTraining.numeroIteraciones,
            ConfigYParamsTraining.rataAprendizaje, ConfigYParamsTraining.errorMaximoPermitido) ?
            'Verifique la configuración de los parámetros de entrenamiento' : 'Verifique la configuración de los pesos sinápticos', '¡Advertencia!');
      return false;
    }
    return true;
  }
}