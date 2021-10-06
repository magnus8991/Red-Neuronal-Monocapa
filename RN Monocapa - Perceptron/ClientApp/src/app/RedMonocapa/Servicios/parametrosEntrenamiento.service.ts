import { Injectable, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatrizPesosSinapticos } from '../Modelos/matrizPesosSinapticos';
import { ParametrosEntrada } from '../Modelos/parametrosEntrada';

@Injectable({
  providedIn: 'root'
})
export class ParametrosEntrenamientoService {

  constructor(
    private toastr: ToastrService
  ) { }

  getParametrosEntrada(): ParametrosEntrada {
    let parametrosEntrada = localStorage.getItem('ParametrosEntrada');
    return parametrosEntrada ? JSON.parse(parametrosEntrada) : null;
  }

  postParametrosEntrada(parametrosEntrada: ParametrosEntrada) {
    localStorage.setItem('ParametrosEntrada', JSON.stringify(parametrosEntrada));
  }

  deleteParametrosEntrada() {
    localStorage.removeItem('ParametrosEntrada');
  }

  getPesosOptimos(): MatrizPesosSinapticos {
    let pesosOptimos = localStorage.getItem('PesosOptimos');
    return pesosOptimos ? JSON.parse(pesosOptimos) : null;
  }

  getConfiguracionRed(): string {
    return localStorage.getItem('ConfiguracionRed');
  }

  postPesosOptimosYConfRed(redEntrenada: boolean, pesosOptimos: MatrizPesosSinapticos, configuracionRed: string) {
    if (!redEntrenada) {
      this.toastr.warning('Debe entrenar la red primero', '¡Advertencia!');
      return;
    }
    localStorage.setItem('PesosOptimos', JSON.stringify(pesosOptimos));
    localStorage.setItem('ConfiguracionRed', configuracionRed);
    this.toastr.info('Pesos óptimos y configuración guardados correctamente (se almacenaron en localStorage)', '¡Operación exitosa!');
  }

  deletePesosOptimos() {
    let pesosOptimos = localStorage.getItem('PesosOptimos');
    if (!pesosOptimos) {
      this.toastr.error('No existen pesos óptimos para eliminar', '¡Oh no!');
      return;
    }
    localStorage.removeItem('PesosOptimos');
    this.toastr.info('Pesos óptimos eliminados correctamente', '¡Operación exitosa!');
  }

  exportPesosOptimos(redEntrenada: boolean, pesosOptimos: MatrizPesosSinapticos) {
    if (!redEntrenada) {
      this.toastr.warning('Debe entrenar la red primero', '¡Advertencia!');
      return;
    }
    let textoArchivo = this.obtenerTextoArchivo(pesosOptimos);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textoArchivo));
    element.setAttribute('download', 'PesosOptimos.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.toastr.info('Pesos sinápticos exportados correctamente', '¡Operación exitosa!');
  }

  obtenerTextoArchivo(pesosOptimos: MatrizPesosSinapticos): string {
    let textoArchivo = '';
    pesosOptimos.filas.forEach(fila => {
      for (let i = 0; i < fila.columnas.length; i++) {
        textoArchivo += fila.columnas[i];
        textoArchivo += i == fila.columnas.length - 1 ? '' : ';';
      }
      if (pesosOptimos.filas.indexOf(fila) < pesosOptimos.filas.length - 1)  textoArchivo += '\n';
    });
    return textoArchivo;
  }

  postPesosSinapticos(pesosOptimos: MatrizPesosSinapticos) {
    localStorage.setItem('PesosSinapticos', JSON.stringify(pesosOptimos));
  }

  getPesosSinapticos(): MatrizPesosSinapticos {
    let pesosOptimos = localStorage.getItem('PesosSinapticos');
    return pesosOptimos ? JSON.parse(pesosOptimos) : null;
  }
}
