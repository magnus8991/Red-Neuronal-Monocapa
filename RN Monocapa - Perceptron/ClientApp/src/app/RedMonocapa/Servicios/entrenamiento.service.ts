import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { MatrizPesosSinapticos } from "../Modelos/matrizPesosSinapticos";
import { ParametrosEntrada } from "../Modelos/parametrosEntrada";
import { Patron } from "../Modelos/patron";

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {

  constructor() { }

  obtenerPesosNuevos(parametrosEntrada: ParametrosEntrada, pesosSinapticos: MatrizPesosSinapticos, rataAprendizaje: number,
    erroresLineales: number[], entrada: number): MatrizPesosSinapticos {
    for (let i = 0; i < parametrosEntrada.numeroSalidas; i++) {
      pesosSinapticos.filas.forEach(fila => {
        let pesoNuevo = fila.columnas[i] + (rataAprendizaje * erroresLineales[i] * entrada);
        fila.columnas[i] = pesoNuevo;
      })
    }
    return pesosSinapticos;
  }

  calcularErroresLineales(parametrosEntrada: ParametrosEntrada, pesosSinapticos: MatrizPesosSinapticos, checkRampa: boolean,
    checkEscalon: boolean, patron: Patron): number[] {
    let erroresLineales: number[] = [];
    let entrada = patron.valores[0];
    for (let i = 0; i < parametrosEntrada.numeroSalidas; i++) {
      let salidaDeseada = patron.valores[parametrosEntrada.numeroEntradas + i];
      let indicePatrones = 0;
      let salidaSoma = 0;
      pesosSinapticos.filas.forEach(fila => {
        salidaSoma += patron.valores[indicePatrones] * fila.columnas[i];
        indicePatrones += 1;
      })
      let salidaRed = this.funcionActivacion(salidaSoma, entrada, checkRampa, checkEscalon);
      erroresLineales.push(salidaDeseada - salidaRed);
    }
    return erroresLineales;
  }

  funcionActivacion(salidaSoma: number, entrada: number, checkRampa: boolean, checkEscalon: boolean): number {
    let salidaRed = 0;
    if (checkRampa) {
      return salidaSoma < 0 ? 0 : (salidaSoma >= 0 || salidaSoma <= 1) ? entrada : 1;
    } else if (checkEscalon) {
      return salidaSoma >= 0 ? 1 : 0;
    }
    return salidaRed;
  }

  errorPatron(erroresLineales: number[], numeroSalidas: number) {
    return (erroresLineales.reduce((sum, current) => sum + current, 0)) / numeroSalidas;
  }

  errorRMS(erroresPatrones: number[]) {
    return (erroresPatrones.reduce((sum, current) => sum + current, 0)) / erroresPatrones.length;
  }

}
