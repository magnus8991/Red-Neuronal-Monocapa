import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { MatrizPesosSinapticos } from "../Modelos/matrizPesosSinapticos";
import { ParametrosEntrada } from "../Modelos/parametrosEntrada";

@Injectable({
  providedIn: 'root'
})
export class ValidacionesService {

  constructor() { }

  checkConfiguracionRed(parametrosEntrada: ParametrosEntrada, pesosSinapticos: MatrizPesosSinapticos, checkEscalon: boolean,
    checkRampa: boolean, numeroIteraciones: AbstractControl, rataAprendizaje: AbstractControl, errorMaximoPermitido: AbstractControl,
    checkSistema: boolean) {
    return this.checkParametrosEntrada(parametrosEntrada) && this.checkFuncionActivacion(checkEscalon, checkRampa, checkSistema) &&
    this.checkParametrosEntrenamiento(numeroIteraciones, rataAprendizaje, errorMaximoPermitido) && this.checkMatrizPesos(pesosSinapticos) ? true : false;
  }

  checkParametrosEntrada(parametrosEntrada: ParametrosEntrada) {
    return parametrosEntrada.numeroEntradas == 'N/A' || parametrosEntrada.numeroSalidas == 'N/A' ? false : true;
  }

  checkMatrizPesos(pesosSinapticos: MatrizPesosSinapticos) {
    return pesosSinapticos.filas[0].columnas[0] == 'N/A' ? false : true;
  }

  checkFuncionActivacion(checkEscalon: boolean, checkRampa: boolean, checkSistema: boolean) {
    return checkEscalon || checkRampa || checkSistema ? true : false;
  }

  checkParametrosEntrenamiento(numeroIteraciones: AbstractControl, rataAprendizaje: AbstractControl,
    errorMaximoPermitido: AbstractControl) {
    return this.checkNumeroIteraciones(numeroIteraciones) && this.checkRataAprendizaje(rataAprendizaje) &&
    this.checkErrorMaximoPermitido(errorMaximoPermitido) ? true : false;
  }

  checkNumeroIteraciones(numeroIteraciones: AbstractControl) {
    return numeroIteraciones.value <= 0 || numeroIteraciones.value == null || numeroIteraciones.value == undefined ? false : true;
  }

  checkRataAprendizaje(rataAprendizaje: AbstractControl) {
    return parseFloat(rataAprendizaje.value) <= 0 || parseFloat(rataAprendizaje.value) > 1 ||
      rataAprendizaje.value == null || rataAprendizaje.value == undefined ? false : true;
  }

  checkErrorMaximoPermitido(errorMaximoPermitido: AbstractControl) {
    return parseFloat(errorMaximoPermitido.value) < 0 || errorMaximoPermitido.value == null || errorMaximoPermitido.value == undefined ? false : true;
  }

}
