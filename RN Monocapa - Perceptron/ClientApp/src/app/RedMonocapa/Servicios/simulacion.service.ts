import { Injectable } from '@angular/core';
import { MatrizPesosSinapticos } from '../Modelos/matrizPesosSinapticos';
import { ToastrService } from 'ngx-toastr';
import { Fila } from '../Modelos/fila';
import { EntrenamientoService } from './entrenamiento.service';

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {

  constructor(private toastr: ToastrService,
    private entrenamientoService: EntrenamientoService) { }

  getPesosOptimosFile(inputFile): MatrizPesosSinapticos {
    let matrizPesosSinapticos = new MatrizPesosSinapticos();
    let filas: string[] = inputFile.split("\n");
    let numeroColumnas = filas[0].split(';').length;
    matrizPesosSinapticos.encabezados = [];
    matrizPesosSinapticos.filas = [];
    matrizPesosSinapticos.encabezados.push('#');
    let indiceFilas = 0;
    for (let i = 0; i < numeroColumnas; i++) matrizPesosSinapticos.encabezados.push((i + 1).toString());
    filas.forEach(fila => {
      indiceFilas += 1;
      let columnas: number[] = [];
      this.getValores(fila).forEach(columna => {
        columnas.push(parseFloat(columna));
      });;
      matrizPesosSinapticos.filas.push(new Fila(indiceFilas, columnas));
    });
    return matrizPesosSinapticos;
  }

  getValores(fila): string[] {
    return fila.split(';');
  }

  getListValores(numeroValores: number) {
    let listValores: any[] = [];
    for (let i = 0; i < numeroValores; i++) listValores.push('');
    return listValores;
  }

  simular(entradas: any[], numeroSalidas, pesosOptimos: MatrizPesosSinapticos, checkRampa: boolean, checkEscalon: boolean): number[] {
    let errores = this.validarEntradas(entradas);
    if (errores > 0) {
      this.toastr.warning('Verifique que todas las entradas del patrón estén escritas correctamente y/o su valor sea 1 o 0', '¡Advertencia!');
      return;
    }
    let salidasRed: number[] = [];
    for (let i = 0; i < numeroSalidas; i++) {
      let indiceEntrada = 0;
      let salidaSoma = 0;
      pesosOptimos.filas.forEach(fila => {
        salidaSoma += entradas[indiceEntrada] * fila.columnas[i];
        indiceEntrada += 1;
      })
      let salidaRed = this.entrenamientoService.funcionActivacion(entradas, salidaSoma, entradas[0], checkRampa, checkEscalon, entradas.length);
      salidasRed.push(salidaRed);
    }
    this.toastr.info('Simulación realizada con éxito', 'Operación exitosa')
    return salidasRed;
  }

  validarEntradas(entradas: any[]) {
    let errores = 0;
    entradas.forEach(entrada => {
      errores += (entrada == undefined || entrada == null || entrada.toString().replace(' ') == ''
        || entrada < 0 || entrada > 1) ? 1 : 0;
    });
    return errores;
  }
}
