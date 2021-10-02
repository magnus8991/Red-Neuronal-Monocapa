import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Fila } from "../Modelos/fila";
import { MatrizPesosSinapticos } from "../Modelos/matrizPesosSinapticos";
import { ParametrosEntrada } from "../Modelos/parametrosEntrada";
import { Patron } from "../Modelos/patron";

@Injectable({
  providedIn: 'root'
})
export class GetterEntradasService {

  constructor(
    private toastr: ToastrService
  ) {}

  getParametrosEntrada(inputFile): ParametrosEntrada {
    let parametros = new ParametrosEntrada();
    parametros.numeroEntradas = this.getNumeroEntradas(inputFile);
    parametros.numeroSalidas = this.getNumeroSalidasDeseadas(inputFile);
    parametros.numeroPatrones = this.getNumberoPatrones(inputFile);
    parametros.encabezados = this.getEncabezados(parametros.numeroEntradas, parametros.numeroSalidas);
    parametros.patrones = this.getPatrones(inputFile);
    return parametros;
  }

  getEncabezados(entradas: number, salidas: number): string[] {
    let encabezados: string[] = [];
    encabezados.push('#');
    for (let i = 1; i <= entradas; i++) encabezados.push('X' + i);
    for (let i = 1; i <= salidas; i++) encabezados.push('YD' + i);
    return encabezados;
  }

  getNumeroSalidasDeseadas(textFile): number {
    let primeraLinea = this.getPrimeraLinea(textFile);
    let salidas = this.getSalidas(primeraLinea);
    return salidas.length;
  }

  getNumeroEntradas(textFile): number {
    let primeraLinea = this.getPrimeraLinea(textFile);
    let entradas = this.getEntradas(primeraLinea);
    return entradas.length;
  }

  getNumberoPatrones(textFile): number {
    return textFile.split("\n").length;
  }

  getEntradas(linea): string[] {
    let entradas = linea.split("|")[0];
    return entradas.split(';');
  }

  getSalidas(linea): string[] {
    let salidas = linea.split("|")[1];
    return salidas.split(';');
  }

  getPrimeraLinea(textFile): string {
    return textFile.split("\n")[0];
  }

  getPatrones(textFile): Patron[] {
    let patrones: Patron[] = [];
    let lineas: string[] = textFile.split("\n");
    let indice = 0;
    lineas.forEach(linea => {
      indice += 1;
      let valores: number[] = [];
      this.getEntradas(linea).forEach(entrada => {
        valores.push(parseInt(entrada));
      });;
      this.getSalidas(linea).forEach(salida => {
        valores.push(parseInt(salida));
      });
      patrones.push(new Patron(indice, valores));
    });
    return patrones;
  }

  getPesosSinapticosFile(inputFile, numeroFilas: number, numeroColumnas: number): MatrizPesosSinapticos {
    let matrizPesosSinapticos = new MatrizPesosSinapticos();
    let lineas: string[] = inputFile.split("\n");
    if (lineas.length != numeroFilas || lineas[0].split(';').length != numeroColumnas) {
      this.toastr.warning('El numero de filas o columnas del archivo cargado no coincide con el numero de entradas o salidas', 'Advertencia');
      return matrizPesosSinapticos;
    }
    matrizPesosSinapticos.encabezados = [];
    matrizPesosSinapticos.filas = [];
    matrizPesosSinapticos.encabezados.push('#');
    let indiceFilas = 0;
    for (let i = 0; i < numeroColumnas; i++) matrizPesosSinapticos.encabezados.push((i + 1).toString());
    lineas.forEach(linea => {
      indiceFilas += 1;
      let columnas: number[] = [];
      this.getEntradas(linea).forEach(columna => {
        columnas.push(parseFloat(columna));
      });;
      matrizPesosSinapticos.filas.push(new Fila(indiceFilas, columnas));
    });
    return matrizPesosSinapticos;
  }

  getPesosSinapticosRandom(numeroFilas: number, numeroColumnas: number): MatrizPesosSinapticos {
    let matrizPesosSinapticos = new MatrizPesosSinapticos();
    matrizPesosSinapticos.encabezados = [];
    matrizPesosSinapticos.filas = [];
    matrizPesosSinapticos.encabezados.push('#');
    for (let i = 0; i < numeroColumnas; i++) matrizPesosSinapticos.encabezados.push((i + 1).toString());
    for (let i = 0; i < numeroFilas; i++) matrizPesosSinapticos.filas.push(new Fila(i + 1, []));
    matrizPesosSinapticos.filas.forEach(fila => {
      for (let i = 0; i < numeroColumnas; i++) {
        fila.columnas.push(Math.random() * (1 - (-1)) + (-1));
      }
    });
    return matrizPesosSinapticos;
  }
}