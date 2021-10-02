import { Injectable, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatrizPesosSinapticos } from '../Modelos/matrizPesosSinapticos';
import { ParametrosEntrada } from '../Modelos/parametrosEntrada';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {

  constructor(
    private toastr: ToastrService
  ) { }

  getParametrosEntrada(): ParametrosEntrada {
    let parametrosEntrada = localStorage.getItem('ParametrosEntrada');
    return parametrosEntrada ? JSON.parse(parametrosEntrada) : null;
  }

  postParametrosEntrada(parametrosEntrada: ParametrosEntrada) {
    localStorage.setItem('ParametrosEntrada',JSON.stringify(parametrosEntrada));
  }

  deleteParametrosEntrada() {
    localStorage.removeItem('ParametrosEntrada');
  }

  postPesosOptimos(pesosOptimos: MatrizPesosSinapticos) {
    localStorage.setItem('PesosOptimos',JSON.stringify(pesosOptimos));
  }

  getPesosOptimos(): MatrizPesosSinapticos {
    let pesosOptimos = localStorage.getItem('PesosOptimos');
    return pesosOptimos ? JSON.parse(pesosOptimos) : null;
  }

  deletePesosOptimos() {
    localStorage.removeItem('PesosOptimos');
  }
}
