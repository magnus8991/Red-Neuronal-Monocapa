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
}
