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
    erroresLineales: number[], entradas: number[]): MatrizPesosSinapticos {
    for (let i = 0; i < parametrosEntrada.numeroSalidas; i++) {
      let indiceEntradas = 0;
      pesosSinapticos.filas.forEach(fila => {
        let pesoNuevo = fila.columnas[i] + (rataAprendizaje * erroresLineales[i] * entradas[indiceEntradas]);
        fila.columnas[i] = pesoNuevo;
        indiceEntradas += 1;
      })
    }
    return pesosSinapticos;
  }

  calcularErroresLineales(parametrosEntrada: ParametrosEntrada, pesosSinapticos: MatrizPesosSinapticos, checkRampa: boolean,
    checkEscalon: boolean, patron: Patron): any {
    let erroresLineales: number[] = [];
    let salidasRed: number[] = [];
    let entrada = patron.valores[0];
    for (let i = 0; i < parametrosEntrada.numeroSalidas; i++) {
      let salidaDeseada = patron.valores[parametrosEntrada.numeroEntradas + i];
      let indicePatrones = 0;
      let salidaSoma = 0;
      pesosSinapticos.filas.forEach(fila => {
        salidaSoma += patron.valores[indicePatrones] * fila.columnas[i];
        indicePatrones += 1;
      })
      let salidaRed = this.funcionActivacion(patron.valores, salidaSoma, entrada, checkRampa, checkEscalon, parametrosEntrada.numeroEntradas);
      salidasRed.push(salidaRed);
      erroresLineales.push(salidaDeseada - salidaRed);
    }
    return { erroresLineales: erroresLineales, salidas: salidasRed };
  }

  funcionActivacion(entradas: number[], salidaSoma: number, entrada: number, checkRampa: boolean,
    checkEscalon: boolean, numeroEntradas): number {
    if (checkRampa) return this.funcionRampa(salidaSoma, entrada);
    if (checkEscalon) return this.funcionEscalon(salidaSoma);
    let valoresIguales = true;
    let valorInicial = entradas[0];
    for (let i = 0; i < numeroEntradas; i++) {
      if (entradas[i] != valorInicial) valoresIguales = false;
    }
    return valoresIguales ? this.funcionRampa(salidaSoma, entrada) : this.funcionEscalon(salidaSoma);
  }

  funcionRampa(salidaSoma: number, entrada: number): number {
    return salidaSoma < 0 ? 0 : (salidaSoma >= 0 || salidaSoma <= 1) ? entrada : 1;
  }

  funcionEscalon(salidaSoma: number): number {
    return salidaSoma >= 0 ? 1 : 0;
  }

  errorPatron(erroresLineales: number[], numeroSalidas: number) {
    return (erroresLineales.reduce((sum, current) => sum + Math.abs(current), 0)) / numeroSalidas;
  }

  errorRMS(erroresPatrones: number[]) {
    return (erroresPatrones.reduce((sum, current) => sum + current, 0)) / erroresPatrones.length;
  }

  getSalidasDeseadas(patrones: Patron[], numeroEntradas: number, numeroSalidas: number): any[] {
    let listaSalidas: any[] = [];
    for (let i = 0; i < numeroSalidas; i++) {
      let salidas: number[] = [];
      patrones.forEach(patron => {
        salidas.push(patron.valores[numeroEntradas+i]);
      });
      listaSalidas.push(salidas);
    }
    return listaSalidas;
  }

  getInitSalidasRed(numeroSalidas: number): any[] {
    let listaSalidas: any[] = [];
    for (let i = 0; i < numeroSalidas; i++) {
      let salidas: number[] = [];
      listaSalidas.push(salidas);
    }
    return listaSalidas;
  }

  getSalidasRed(numeroSalidas: number): any[] {
    let listaSalidas: any[] = [];
    for (let i = 0; i < numeroSalidas; i++) {
      let salidas: number[] = [];
      listaSalidas.push(salidas);
    }
    return listaSalidas;
  }

}
