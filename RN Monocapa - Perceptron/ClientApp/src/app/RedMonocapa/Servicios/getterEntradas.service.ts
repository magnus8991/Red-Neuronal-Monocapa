import { Columna } from "../Modelos/columna";
import { MatrizPesosSinapticos } from "../Modelos/matrizPesosSinapticos";
import { ParametrosEntrada } from "../Modelos/parametrosEntrada";
import { Patron } from "../Modelos/patron";

export class GetterEntradasService {

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
      patrones.push(new Patron(indice,valores));
    });
    return patrones;
  }
  
  getPesosSinapticosRandom(numeroColumnas: number, numeroFilas: number): MatrizPesosSinapticos {
    let matrizPesosSinapticos = new MatrizPesosSinapticos();
    for(let i=0; i< numeroColumnas; i++) matrizPesosSinapticos.columnas.push(new Columna());
    matrizPesosSinapticos.columnas.forEach(columna => {
      for(let i=0; i< numeroFilas; i++) columna.filas.push();
    });
    return matrizPesosSinapticos;
  }
}