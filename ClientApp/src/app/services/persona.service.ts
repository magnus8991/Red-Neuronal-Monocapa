import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Persona } from '../pulsacion/models/persona';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HandleHttpErrorService } from '../@base/handle-http-error.service';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  constructor() { }

  post(persona: Persona) {
    let personas: Persona[];
    personas = (this.get() != null)? this.get() : [];
    personas.push(persona);
    localStorage.setItem('datos', JSON.stringify(personas));
  }

  get(): Persona[] {
    return JSON.parse(localStorage.getItem('datos'));
  }

  TotalizarPorTipo(tipo: string): number {
    return (tipo != "Todos")? this.get().filter(p => p.sexo == tipo).length : this.TotalizarPersonas();
  }

  TotalizarPersonas(): number {
    return this.get().length;
  }
}
