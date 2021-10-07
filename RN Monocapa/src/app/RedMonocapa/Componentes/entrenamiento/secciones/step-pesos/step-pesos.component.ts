import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatrizPesosSinapticos } from 'src/app/RedMonocapa/Modelos/matrizPesosSinapticos';
import { Fila } from 'src/app/RedMonocapa/Modelos/fila';
import { ValidacionesService } from 'src/app/RedMonocapa/Servicios/validaciones.service';
import { ParametrosEntrenamientoService } from 'src/app/RedMonocapa/Servicios/parametrosEntrenamiento.service';
import { GetterEntradasService } from 'src/app/RedMonocapa/Servicios/getterEntradas.service';
import { ParametrosEntrada } from 'src/app/RedMonocapa/Modelos/parametrosEntrada';

@Component({
  selector: 'step-pesos',
  templateUrl: './step-pesos.component.html',
  styleUrls: ['./step-pesos.component.css']
})
export class StepPesosComponent implements OnInit, AfterViewInit {
  dataSourcePesos: MatTableDataSource<Fila>;
  pesosSinapticos: MatrizPesosSinapticos;
  disabledFilePesos: boolean = true;
  checkFilePesos: boolean = false;
  checkPesosAleatorios: boolean = false;
  checkPesosAnteriores: boolean = false;
  displayedColumnsPesos: string[];
  @ViewChild('paginatorPesos') paginatorPesos: MatPaginator;
  @ViewChild('sortPesos') sortPesos: MatSort;
  labelAleatorio: string = 'Sin procesar';
  spinnerAleatorioValue: number = 0;
  spinnerAleatorioMode: string = 'determinate';
  labelAnterior: string = 'Sin cargar';
  spinnerAnteriorValue: number = 0;
  spinnerAnteriorMode: string = 'determinate';
  errorCheckAleatorio: boolean = false;
  errorCheckAnterior: boolean = false;
  errorCheckFile: boolean = false;
  parametrosEntrada: ParametrosEntrada;
  @Output() reloadTraining = new EventEmitter<unknown>();

  constructor(private getterEntradas: GetterEntradasService,
    private parametrosEntrenamientoService: ParametrosEntrenamientoService,
    private validaciones: ValidacionesService,
    private toastr: ToastrService) { }

  ngAfterViewInit() {
    this.dataSourcePesos.paginator = this.paginatorPesos;
    this.dataSourcePesos.sort = this.sortPesos;
  }

  ngOnInit() {
    let data = this.parametrosEntrenamientoService.getParametrosEntrada();
    this.parametrosEntrada = data ? data : new ParametrosEntrada();
    this.pesosSinapticos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesos();
  }

  //Cargue del archivo de los parametros de entrada

  crearArchivo(event) {
    if (event.target.files.length > 0) {
      var inputFile = <HTMLInputElement>document.getElementById('file-2');
      var fileName = <HTMLSpanElement>document.getElementById('iborrainputfile2');
      if (!inputFile.files[0].name.includes('.txt')) {
        this.toastr.warning("Debe subir un archivo de texto plano (.txt)", '¡Advertencia!');
        inputFile.value = '';
        fileName.innerHTML = 'Cargar Archivo';
        return;
      }
      fileName.innerHTML = inputFile.files[0].name;
      this.convertirATexto(event.target.files[0], inputFile, fileName);

    }
  }

  convertirATexto(inputFile, fileHtml: HTMLInputElement, fileName: HTMLSpanElement) {
    var reader = new FileReader;
    reader.onloadend = () => {
      this.pesosSinapticos = this.getterEntradas.getPesosSinapticosFile(reader.result, this.parametrosEntrada.numeroEntradas,
        this.parametrosEntrada.numeroSalidas);
      if (!this.validaciones.checkMatrizPesos(this.pesosSinapticos)) {
        fileHtml.value = '';
        fileName.innerHTML = 'Cargar Archivo';
      }
      this.parametrosEntrenamientoService.postPesosSinapticos(this.pesosSinapticos);
      this.mostrarContenidoPesos();
    };
    reader.readAsText(inputFile, 'ISO-8859-1');
  }

  //Visualizacion del contenido de los parametros de entrada y de los pesos sinapticos

  mostrarContenidoPesos() {
    this.displayedColumnsPesos = this.pesosSinapticos.encabezados;
    this.dataSourcePesos = new MatTableDataSource<Fila>(this.pesosSinapticos.filas);
    this.dataSourcePesos.paginator = this.paginatorPesos;
    this.dataSourcePesos.sort = this.sortPesos;
  }

  //Operaciones de los slide toggles de los pesos sinapticos

  toggleArchivoPesos(event) {
    if (this.errorCheckFile) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        if (!this.validaciones.checkParametrosEntrada(this.parametrosEntrada)) {
          this.messageToggle(event,'file','warning','Debe cargar el archivo de los parámetros de entrada');
          return;
        }
        this.cargueArchivoListo();
        break;
      case false:
        if (!this.errorCheckFile) this.reiniciarMatrizDePesos();
        this.deshabilitarCargueArchivoPesos();
        break;
    }
  }

  toggleAleatorio(event) {
    if (this.errorCheckAleatorio) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        this.spinnerAleatorioMode = 'indeterminate';
        if (!this.validaciones.checkParametrosEntrada(this.parametrosEntrada)) {
          this.messageToggle(event,'aleatorio','warning','Debe cargar el archivo de los parámetros de entrada');
          return;
        }
        this.entrenamientoAleatorioListo();
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
        if (!this.isValidToggleEntrenamientoAnterior(event)) return;
        this.entrenamientoAnteriorListo();
        break;
      case false:
        if (!this.errorCheckAnterior) this.reiniciarMatrizDePesos();
        this.deshabilitarPesoAnterior();
        break;
    }
  }

  //Validación de toggle anterior

  isValidToggleEntrenamientoAnterior(event): boolean {
    if (!this.validaciones.checkParametrosEntrada(this.parametrosEntrada)) {
      this.messageToggle(event,'anterior','warning','Debe cargar el archivo de los parámetros de entrada');
      return false;
    }
    let data = this.parametrosEntrenamientoService.getPesosOptimos();
    this.pesosSinapticos = data ? data : new MatrizPesosSinapticos();
    if (!data) {
      this.messageToggle(event,'anterior','error','No existen pesos en almacenamiento local');
      return false;
    }
    if (data.filas.length != this.parametrosEntrada.numeroEntradas || data.filas[0].columnas.length != this.parametrosEntrada.numeroSalidas) {
      this.messageToggle(event,'anterior','warning','El numero de filas o columnas del archivo cargado no coincide con el numero de entradas o salidas');
      return false;
    }
    return true;
  }

  //Visualización de mensajes toggle

  messageToggle(event, check: string, type: string, message: string) {
    event.source.checked = false;
    switch (check) {
      case 'anterior':
        this.deshabilitarPesoAnterior();
        this.errorCheckAnterior = true;
        break;
      case 'aleatorio':
        this.deshabilitarPesoAleatorio();
        this.errorCheckAleatorio = true;
        break;
      case 'file':
        this.deshabilitarCargueArchivoPesos();
        this.errorCheckFile = true;
        break;
    }
    this.deshabilitarPesoAnterior();
    if (type == 'error') this.toastr.error(message, '¡Oh no!');
    else if (type == 'warning') this.toastr.warning(message, '¡Advertencia!');
    this.errorCheckAnterior = true;
  }

  //Operaciones de habilitacion y deshabilitacion de los toggles de los pesos sinapticos

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
    this.errorCheckAnterior = false;
    this.checkPesosAleatorios = false;
    this.checkFilePesos = false;
    this.mostrarContenidoPesos();
    this.deshabilitarCargueArchivoPesos();
    this.deshabilitarPesoAleatorio();
    this.parametrosEntrenamientoService.postPesosSinapticos(this.pesosSinapticos);
    this.spinnerAnteriorMode = 'determinate';
    this.spinnerAnteriorValue = 100;
    this.labelAnterior = '¡Listo!';
  }

  entrenamientoAleatorioListo() {
    this.errorCheckAleatorio = false;
    this.checkFilePesos = false;
    this.checkPesosAnteriores = false;
    this.deshabilitarCargueArchivoPesos();
    this.pesosSinapticos = this.getterEntradas.getPesosSinapticosRandom(this.parametrosEntrada.numeroEntradas,
      this.parametrosEntrada.numeroSalidas);
    this.mostrarContenidoPesos();
    this.deshabilitarPesoAnterior();
    this.parametrosEntrenamientoService.postPesosSinapticos(this.pesosSinapticos);
    this.spinnerAleatorioMode = 'determinate';
    this.spinnerAleatorioValue = 100;
    this.labelAleatorio = '¡Listo!';
  }

  cargueArchivoListo() {
    this.errorCheckFile = false;
    this.pesosSinapticos = new MatrizPesosSinapticos();
    this.checkPesosAleatorios = false; this.checkPesosAnteriores = false;
    this.disabledFilePesos = false;
    this.deshabilitarPesoAnterior();
    this.deshabilitarPesoAleatorio();
    this.reiniciarMatrizDePesos();
  }

  //Operaciones de reinicio de valores

  reiniciarStepPesos() {
    this.checkFilePesos = false;
    this.checkPesosAleatorios = false;
    this.checkPesosAnteriores = false;
    this.deshabilitarCargueArchivoPesos();
    this.deshabilitarPesoAnterior();
    this.deshabilitarPesoAleatorio();
    this.reiniciarMatrizDePesos();
  }

  reiniciarMatrizDePesos() {
    this.pesosSinapticos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesos();
  }

  //Eventos de reinicio de valores

  reiniciarEntrenamiento() {
    this.reloadTraining.emit();
  }
}