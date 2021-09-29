import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ParametrosEntrada } from '../Modelos/parametrosEntrada';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HandleHttpErrorService } from '../../@base/handle-http-error.service';

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {

  constructor() { }

  post(ParametrosEntrada: ParametrosEntrada) {
    let ParametrosEntradas: ParametrosEntrada[];
    ParametrosEntradas = (this.get() != null)? this.get() : [];
    ParametrosEntradas.push(ParametrosEntrada);
    localStorage.setItem('datos', JSON.stringify(ParametrosEntradas));
  }

  get(): ParametrosEntrada[] {
    return JSON.parse(localStorage.getItem('datos'));
  }

  TotalizarPorTipo(tipo: string): number {
    return (tipo != "Todos")? this.get().filter(p => p.sexo == tipo).length : this.TotalizarParametrosEntradas();
  }

  TotalizarParametrosEntradas(): number {
    return this.get().length;
  }
}
