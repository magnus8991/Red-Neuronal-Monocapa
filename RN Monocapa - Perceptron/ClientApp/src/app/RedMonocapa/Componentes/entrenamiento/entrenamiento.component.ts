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
import { MatrizPesosSinapticos } from '../../Modelos/matrizPesosSinapticos';
import { Fila } from '../../Modelos/fila';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Patron>;
  dataSourcePesos: MatTableDataSource<Fila>;
  parametrosEntrada: ParametrosEntrada;
  getterEntradas: GetterEntradasService;
  formParametrosEntrada: FormGroup;
  formParametrosEntrenamiento: FormGroup;
  checkRampa: boolean = false;
  checkEscalon: boolean = false;
  disabledFilePesos: boolean = true;
  checkFilePesos: boolean = false;
  checkPesosAleatorios: boolean = false;
  checkPesosAnteriores: boolean = false;
  displayedColumns: string[];
  displayedColumnsPesos: string[];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('sort') sort: MatSort;
  @ViewChild('paginatorPesos') paginatorPesos: MatPaginator;
  @ViewChild('sortPesos') sortPesos: MatSort;
  pesosSinapticos: MatrizPesosSinapticos;
  labelAleatorio: string = 'Sin procesar';
  spinnerAleatorioValue: number = 0;
  spinnerAleatorioMode: string = 'determinate';
  labelAnterior: string = 'Sin cargar';
  spinnerAnteriorValue: number = 0;
  spinnerAnteriorMode: string = 'determinate';
  errorCheckAleatorio: boolean = false;
  errorCheckAnterior: boolean = false;

  constructor(private builder: FormBuilder,
    private entrenamientoService: EntrenamientoService,
    private toastr: ToastrService) { }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSourcePesos.paginator = this.paginatorPesos;
    this.dataSourcePesos.sort = this.sortPesos;
  }

  ngOnInit(): void {
    let data = this.entrenamientoService.getParametrosEntrada();
    this.parametrosEntrada = data ? data : new ParametrosEntrada();
    this.pesosSinapticos = new MatrizPesosSinapticos();
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
    this.mostrarContenidoPesos();
    this.getterEntradas = new GetterEntradasService();
  }

  crearArchivo(event, opcion: string) {
    if (event.target.files.length > 0) {
      var inputFile = <HTMLInputElement>document.getElementById(opcion == 'entradas' ? 'file-1' : 'file-2');
      var fileName = <HTMLSpanElement>document.getElementById(opcion == 'entradas' ? 'iborrainputfile' : 'iborrainputfile2');
      if (!inputFile.files[0].name.includes('.txt')) {
        this.toastr.warning("Debe subir un archivo de texto plano (.txt)", '¡Advertencia!');
        inputFile.value = '';
        fileName.innerHTML = 'Cargar Archivo';
        return;
      }
      fileName.innerHTML = inputFile.files[0].name;
      this.convertirATexto(event.target.files[0], opcion, inputFile, fileName);

    }
  }

  convertirATexto(inputFile, opcion: string, fileHtml: HTMLInputElement, fileName: HTMLSpanElement) {
    var reader = new FileReader;
    reader.onloadend = () => {
      switch (opcion) {
        case 'entradas':
          this.parametrosEntrada = this.getterEntradas.getParametrosEntrada(reader.result);
          this.mostrarContenidoEntradas();
          this.entrenamientoService.postParametrosEntrada(this.parametrosEntrada);
          this.deshabilitarCargueArchivoPesos();
          break;
        case 'pesos':
          this.pesosSinapticos = this.getterEntradas.getPesosSinapticosFile(reader.result,this.parametrosEntrada.numeroEntradas,
            this.parametrosEntrada.numeroSalidas,this.toastr);
          if (this.pesosSinapticos.filas[0].columnas[0] == 'N/A') {
            fileHtml.value = '';
            fileName.innerHTML = 'Cargar Archivo';
          }
          this.mostrarContenidoPesos();
          break;
      }
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

  mostrarContenidoPesos() {
    this.displayedColumnsPesos = this.pesosSinapticos.encabezados;
    this.dataSourcePesos = new MatTableDataSource<Fila>(this.pesosSinapticos.filas);
    this.dataSourcePesos.paginator = this.paginatorPesos;
    this.dataSourcePesos.sort = this.sortPesos;
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

  toggleArchivoPesos(event) {
    switch (event) {
      case true:
        this.pesosSinapticos = new MatrizPesosSinapticos();
        this.checkPesosAleatorios = false; this.checkPesosAnteriores = false;
        this.disabledFilePesos = false;
        this.deshabilitarPesoAnterior();
        this.deshabilitarPesoAleatorio();
        this.reiniciarMatrizDePesos();
        break;
      case false:
        this.reiniciarMatrizDePesos();
        this.deshabilitarCargueArchivoPesos();
        break;
    }
  }

  toggleAleatorio(event) {
    if (this.errorCheckAleatorio) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        this.spinnerAleatorioMode = 'indeterminate';
        if (this.parametrosEntrada.numeroEntradas == 'N/A' || this.parametrosEntrada.numeroSalidas == 'N/A') {
          event.source.checked = false;
          this.deshabilitarPesoAleatorio();
          this.toastr.warning('Debe cargar el archivo de los parámetros de entrada', '¡Advertencia!');
          this.errorCheckAleatorio = true;
          return;
        }
        this.errorCheckAleatorio = false;
        this.checkFilePesos = false; 
        this.checkPesosAnteriores = false;
        this.deshabilitarCargueArchivoPesos();
        this.pesosSinapticos = this.getterEntradas.getPesosSinapticosRandom(this.parametrosEntrada.numeroEntradas,
          this.parametrosEntrada.numeroSalidas);
        this.mostrarContenidoPesos();
        this.entrenamientoAleatorioListo();
        this.deshabilitarPesoAnterior();
        break;
      case false:
        if (!this.errorCheckAleatorio) this.reiniciarMatrizDePesos();
        this.deshabilitarPesoAleatorio();
        break;
    }
  }

  toggleEntrenamientoAnterior(event) {
    if (this.errorCheckAnterior) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        this.spinnerAnteriorMode = 'indeterminate';
        let data = this.entrenamientoService.getPesosOptimos();
        this.pesosSinapticos = data ? data : new MatrizPesosSinapticos();
        if (!data) {
          event.source.checked = false;
          this.deshabilitarPesoAnterior();
          this.toastr.error('No existen pesos en almacenamiento local', '¡Oh no!');
          this.errorCheckAnterior = true;
          return;
        }
        this.errorCheckAnterior = false;
        this.checkPesosAleatorios = false; 
        this.checkFilePesos = false;
        this.mostrarContenidoPesos();
        this.deshabilitarCargueArchivoPesos();
        this.entrenamientoAnteriorListo();
        this.deshabilitarPesoAleatorio();
        break;
      case false:
        if (!this.errorCheckAnterior) this.reiniciarMatrizDePesos();
        this.deshabilitarPesoAnterior();
        break;
    }
  }

  deshabilitarCargueArchivoPesos() {
    var inputFile = <HTMLInputElement>document.getElementById('file-2');
    var fileName = <HTMLSpanElement>document.getElementById('iborrainputfile2');
    inputFile.value = '';
    fileName.innerHTML = 'Cargar Archivo';
    this.disabledFilePesos = true;
  }

  deshabilitarPesoAnterior() {
    this.spinnerAnteriorMode = 'determinate';
    this.spinnerAnteriorValue = 0;
    this.labelAnterior = 'Sin cargar';
  }

  deshabilitarPesoAleatorio() {
    this.spinnerAleatorioMode = 'determinate';
    this.spinnerAleatorioValue = 0;
    this.labelAleatorio = 'Sin procesar';
  }

  entrenamientoAnteriorListo() {
    this.spinnerAnteriorMode = 'determinate';
    this.spinnerAnteriorValue = 100;
    this.labelAnterior = '¡Listo!';
  }

  entrenamientoAleatorioListo() {
    this.spinnerAleatorioMode = 'determinate';
    this.spinnerAleatorioValue = 100;
    this.labelAleatorio = '¡Listo!';
  }

  reiniciarMatrizDePesos() {
    this.pesosSinapticos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesos();
  }

  reiniciarStepPesos() {
    this.checkFilePesos = false;
    this.checkPesosAleatorios = false;
    this.checkPesosAnteriores = false;
    this.deshabilitarPesoAnterior();
    this.deshabilitarPesoAleatorio();
    this.reiniciarMatrizDePesos();
  }

  reiniciarStepEntradas() {
    this.parametrosEntrada = new ParametrosEntrada();
    this.mostrarContenidoEntradas();
    this.entrenamientoService.deleteParametrosEntrada();
    this.checkRampa = false;
    this.checkEscalon = false;
    this.numeroIteraciones.setValue(1);
    this.rataAprendizaje.setValue(0.1);
    this.errorMaximoPermitido.setValue(0.1);
  }

  reiniciarEntrenamiento() {
    this.reiniciarStepEntradas();
    this.reiniciarStepPesos();
  }

  get numeroEntradas() { return this.formParametrosEntrada.get('numeroEntradas') }
  get numeroSalidas() { return this.formParametrosEntrada.get('numeroSalidas'); }
  get numeroPatrones() { return this.formParametrosEntrada.get('numeroPatrones'); }
  get numeroIteraciones() { return this.formParametrosEntrada.get('numeroIteraciones') }
  get rataAprendizaje() { return this.formParametrosEntrada.get('rataAprendizaje'); }
  get errorMaximoPermitido() { return this.formParametrosEntrada.get('errorMaximoPermitido'); }
}