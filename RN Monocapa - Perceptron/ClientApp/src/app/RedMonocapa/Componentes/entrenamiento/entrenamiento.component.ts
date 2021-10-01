import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ParametrosEntrada } from '../../Modelos/parametrosEntrada';
import { EntrenamientoService } from '../../Servicios/entrenamiento.service';
import { ToastrService } from 'ngx-toastr';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThrowStmt } from '@angular/compiler';
import { MatTableDataSource } from '@angular/material/table';
import { Patron } from '../../Modelos/patron';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GetterEntradasService } from '../../Servicios/getterEntradas.service';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Patron>;
  parametrosEntrada: ParametrosEntrada;
  fileInput: any;
  getterEntradas: GetterEntradasService;
  formParametrosEntrada: FormGroup;
  formParametrosEntrenamiento: FormGroup;
  checkRampa: boolean = true;
  checkEscalon: boolean = false;
  displayedColumns: string[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private builder: FormBuilder,
    private entrenamientoService: EntrenamientoService,
    private toastr: ToastrService) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    let data = this.entrenamientoService.getParametrosEntrada();
    this.parametrosEntrada = data ? data : new ParametrosEntrada();
    this.formParametrosEntrada = this.builder.group({
      numeroEntradas: [0, Validators.required],
      numeroSalidas: [0, Validators.required],
      numeroPatrones: [0, Validators.required]
    });
    this.formParametrosEntrenamiento = this.builder.group({
      numeroIteraciones: [1, Validators.required],
      rataAprendizaje: [0.1, Validators.required],
      errorMaximoPermitido: [0.1, Validators.required]
    });
    this.mostrarContenidoEntradas();
    this.getterEntradas = new GetterEntradasService();
  }

  crearArchivo(event) {
    if (event.target.files.length > 0) {
      var inputFile = <HTMLInputElement>document.getElementById('file-1');
      var fileName = <HTMLSpanElement>document.getElementById('iborrainputfile');
      if (!inputFile.files[0].name.includes('.txt')) {
        this.toastr.warning("Debe subir un archivo de texto plano (.txt)", '¡Advertencia!');
        inputFile.value = '';
        fileName.innerHTML = 'Cargar Archivo';
        this.fileInput = undefined;
        return;
      }
      fileName.innerHTML = inputFile.files[0].name;
      this.convertirATexto(event.target.files[0]);
      
    }
  }

  convertirATexto(inputFile) {
    var reader = new FileReader;
    reader.onloadend = () => {
      this.fileInput = reader.result;
      this.parametrosEntrada = this.getterEntradas.getParametrosEntrada(this.fileInput);
      this.mostrarContenidoEntradas();
      this.entrenamientoService.postParametrosEntrada(this.parametrosEntrada);
    };
    reader.readAsText(inputFile, 'ISO-8859-1');
  }

  mostrarContenidoEntradas() {
    this.displayedColumns = this.parametrosEntrada.encabezados;
    this.dataSource = new MatTableDataSource<Patron>(this.parametrosEntrada.patrones);
    this.numeroEntradas.setValue(this.parametrosEntrada.numeroEntradas);
    this.numeroSalidas.setValue(this.parametrosEntrada.numeroSalidas);
    this.numeroPatrones.setValue(this.parametrosEntrada.numeroPatrones);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleRampa(event) {
    switch (event) {
      case true: this.checkEscalon = false; break;
      case false: this.checkEscalon = true; break;
    }
  }

  toggleEscalon(event) {
    switch (event) {
      case true: this.checkRampa = false; break;
      case false: this.checkRampa = true; break;
    }
  }

  reiniciarEntrenamiento() {
    this.parametrosEntrada = new ParametrosEntrada();
    this.mostrarContenidoEntradas();
    this.entrenamientoService.deleteParametrosEntrada();
    this.numeroIteraciones.setValue(1);
    this.rataAprendizaje.setValue(0.1);
    this.errorMaximoPermitido.setValue(0.1);
  }

  get numeroEntradas() { return this.formParametrosEntrada.get('numeroEntradas') }
  get numeroSalidas() { return this.formParametrosEntrada.get('numeroSalidas'); }
  get numeroPatrones() { return this.formParametrosEntrada.get('numeroPatrones'); }
  get numeroIteraciones() { return this.formParametrosEntrada.get('numeroIteraciones') }
  get rataAprendizaje() { return this.formParametrosEntrada.get('rataAprendizaje'); }
  get errorMaximoPermitido() { return this.formParametrosEntrada.get('errorMaximoPermitido'); }
}