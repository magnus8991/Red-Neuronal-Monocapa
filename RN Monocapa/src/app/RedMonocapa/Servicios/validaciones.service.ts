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
    checkRampa: boolean, numeroIteraciones: any, rataAprendizaje: any, errorMaximoPermitido: any, checkSistema: boolean) {
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

  checkParametrosEntrenamiento(numeroIteraciones: any, rataAprendizaje: any, errorMaximoPermitido: any) {
    return this.checkNumeroIteraciones(numeroIteraciones) && this.checkRataAprendizaje(rataAprendizaje) &&
      this.checkErrorMaximoPermitido(errorMaximoPermitido) ? true : false;
  }

  checkNumeroIteraciones(numeroIteraciones: any) {
    return numeroIteraciones <= 0 || numeroIteraciones == null || numeroIteraciones == undefined ? false : true;
  }

  checkRataAprendizaje(rataAprendizaje: any) {
    return parseFloat(rataAprendizaje) <= 0 || parseFloat(rataAprendizaje) > 1 ||
      rataAprendizaje == null || rataAprendizaje == undefined ? false : true;
  }

  checkErrorMaximoPermitido(errorMaximoPermitido: any) {
    return parseFloat(errorMaximoPermitido) < 0 || errorMaximoPermitido == null || errorMaximoPermitido == undefined ? false : true;
  }

}
