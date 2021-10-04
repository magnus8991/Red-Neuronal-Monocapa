import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ParametrosEntrada } from '../../Modelos/parametrosEntrada';
import { ParametrosEntrenamientoService } from '../../Servicios/parametrosEntrenamiento.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Patron } from '../../Modelos/patron';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GetterEntradasService } from '../../Servicios/getterEntradas.service';
import { MatrizPesosSinapticos } from '../../Modelos/matrizPesosSinapticos';
import { Fila } from '../../Modelos/fila';
import { TablaErroresRMS } from '../../Modelos/tablaErroresRms';
import { EntrenamientoService } from '../../Servicios/entrenamiento.service';
import { ValidacionesService } from '../../Servicios/validaciones.service';

@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Patron>;
  dataSourcePesos: MatTableDataSource<Fila>;
  dataSourcePesosOptimos: MatTableDataSource<Fila>;
  dataSourceErrores: MatTableDataSource<TablaErroresRMS>;
  parametrosEntrada: ParametrosEntrada;
  pesosSinapticos: MatrizPesosSinapticos;
  tablaErrores: TablaErroresRMS[] = [];
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
  displayedColumnsPesosOptimos: string[];
  displayedColumnsErrores: string[] = ['No. Iteración', 'Error RMS'];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('sort') sort: MatSort;
  @ViewChild('paginatorPesos') paginatorPesos: MatPaginator;
  @ViewChild('sortPesos') sortPesos: MatSort;
  @ViewChild('paginatorPesosOptimos') paginatorPesosOptimos: MatPaginator;
  @ViewChild('sortPesosOptimos') sortPesosOptimos: MatSort;
  @ViewChild('paginatorErrores') paginatorErrores: MatPaginator;
  @ViewChild('sortErrores') sortErrores: MatSort;
  labelAleatorio: string = 'Sin procesar';
  spinnerAleatorioValue: number = 0;
  spinnerAleatorioMode: string = 'determinate';
  labelAnterior: string = 'Sin cargar';
  spinnerAnteriorValue: number = 0;
  spinnerAnteriorMode: string = 'determinate';
  errorCheckAleatorio: boolean = false;
  errorCheckAnterior: boolean = false;
  errorCheckFile: boolean = false;
  redEntrenada: boolean = false;

  constructor(private builder: FormBuilder,
    private getterEntradas: GetterEntradasService,
    private parametrosEntrenamientoService: ParametrosEntrenamientoService,
    private entrenamientoService: EntrenamientoService,
    private validaciones: ValidacionesService,
    private toastr: ToastrService) {
    for (let i = 0; i < 5; i++) this.tablaErrores.push(new TablaErroresRMS(i + 1, 'N/A'));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSourcePesos.paginator = this.paginatorPesos;
    this.dataSourcePesos.sort = this.sortPesos;
    this.dataSourcePesosOptimos.paginator = this.paginatorPesosOptimos;
    this.dataSourcePesosOptimos.sort = this.sortPesosOptimos;
    this.dataSourceErrores.paginator = this.paginatorErrores;
    this.dataSourceErrores.sort = this.sortErrores;
  }

  ngOnInit(): void {
    let data = this.parametrosEntrenamientoService.getParametrosEntrada();
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
    this.mostrarContenidoPesosOptimos();
    this.mostrarContenidoErrores();
  }

  //Cargue del archivo de los parametros de entrada

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
          this.parametrosEntrenamientoService.postParametrosEntrada(this.parametrosEntrada);
          this.reiniciarStepPesos();
          break;
        case 'pesos':
          this.pesosSinapticos = this.getterEntradas.getPesosSinapticosFile(reader.result, this.parametrosEntrada.numeroEntradas,
            this.parametrosEntrada.numeroSalidas);
          if (!this.validaciones.checkMatrizPesos(this.pesosSinapticos)) {
            fileHtml.value = '';
            fileName.innerHTML = 'Cargar Archivo';
          }
          this.mostrarContenidoPesos();
          break;
      }
    };
    reader.readAsText(inputFile, 'ISO-8859-1');
  }

  //Visualizacion del contenido de los parametros de entrada y de los pesos sinapticos

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

  mostrarContenidoPesosOptimos() {
    this.displayedColumnsPesosOptimos = this.pesosSinapticos.encabezados;
    this.dataSourcePesosOptimos = new MatTableDataSource<Fila>(this.pesosSinapticos.filas);
    this.dataSourcePesos.paginator = this.paginatorPesosOptimos;
    this.dataSourcePesos.sort = this.sortPesosOptimos;
  }

  mostrarContenidoErrores() {
    this.dataSourceErrores = new MatTableDataSource<TablaErroresRMS>(this.tablaErrores);
    this.dataSourceErrores.paginator = this.paginatorErrores;
    this.dataSourceErrores.sort = this.sortErrores;
  }

  //Operaciones de los slide toggles de la funcion de activacion

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

  //Operaciones de los slide toggles de los pesos sinapticos

  toggleArchivoPesos(event) {
    if (this.errorCheckFile) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        if (!this.validaciones.checkParametrosEntrada(this.parametrosEntrada)) {
          event.source.checked = false;
          this.deshabilitarCargueArchivoPesos();
          this.toastr.warning('Debe cargar el archivo de los parámetros de entrada', '¡Advertencia!');
          this.errorCheckFile = true;
          return;
        }
        this.errorCheckFile = false;
        this.pesosSinapticos = new MatrizPesosSinapticos();
        this.checkPesosAleatorios = false; this.checkPesosAnteriores = false;
        this.disabledFilePesos = false;
        this.deshabilitarPesoAnterior();
        this.deshabilitarPesoAleatorio();
        this.reiniciarMatrizDePesos();
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
        if (!this.validaciones.checkParametrosEntrada(this.parametrosEntrada)) {
          event.source.checked = false;
          this.deshabilitarPesoAnterior();
          this.toastr.warning('Debe cargar el archivo de los parámetros de entrada', '¡Advertencia!');
          this.errorCheckAnterior = true;
          return;
        }
        let data = this.parametrosEntrenamientoService.getPesosOptimos();
        this.pesosSinapticos = data ? data : new MatrizPesosSinapticos();
        if (!data) {
          event.source.checked = false;
          this.deshabilitarPesoAnterior();
          this.toastr.error('No existen pesos en almacenamiento local', '¡Oh no!');
          this.errorCheckAnterior = true;
          return;
        }
        if (data.filas.length != this.parametrosEntrada.numeroEntradas || data.filas[0].columnas.length != this.parametrosEntrada.numeroSalidas) {
          event.source.checked = false;
          this.deshabilitarPesoAnterior();
          this.toastr.warning('El numero de filas o columnas del archivo cargado no coincide con el numero de entradas o salidas', 'Advertencia');
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
    this.spinnerAnteriorMode = 'determinate';
    this.spinnerAnteriorValue = 100;
    this.labelAnterior = '¡Listo!';
  }

  entrenamientoAleatorioListo() {
    this.spinnerAleatorioMode = 'determinate';
    this.spinnerAleatorioValue = 100;
    this.labelAleatorio = '¡Listo!';
  }

  //Operaciones de reinicio de valores

  reiniciarParametrosYConfiguracion() {
    this.reiniciarStepEntradas();
    this.reiniciarStepPesos();
  }

  reiniciarEntrenamiento() {
    this.reiniciarStepEntradas();
    this.reiniciarStepPesos();
    this.mostrarContenidoPesosOptimos();
    this.reiniciarMatrizDeErrores();
    this.redEntrenada = false;
  }

  reiniciarStepEntradas() {
    this.parametrosEntrada = new ParametrosEntrada();
    this.mostrarContenidoEntradas();
    this.parametrosEntrenamientoService.deleteParametrosEntrada();
    this.checkRampa = false;
    this.checkEscalon = false;
    this.numeroIteraciones.setValue(1);
    this.rataAprendizaje.setValue(0.1);
    this.errorMaximoPermitido.setValue(0.1);
    var inputFile = <HTMLInputElement>document.getElementById('file-1');
    var fileName = <HTMLSpanElement>document.getElementById('iborrainputfile');
    inputFile.value = '';
    fileName.innerHTML = 'Cargar Archivo';
  }

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

  reiniciarMatrizDeErrores() {
    this.tablaErrores = [];
    for (let i = 0; i < 5; i++) this.tablaErrores.push(new TablaErroresRMS(i + 1, 'N/A'));
    this.mostrarContenidoErrores();
  }

  //Operaciones de entrenamiento de la red neuronal

  entrenar() {
    if (!this.validaciones.checkConfiguracionRed(this.parametrosEntrada, this.pesosSinapticos, this.checkEscalon, this.checkRampa,
      this.numeroIteraciones, this.rataAprendizaje, this.errorMaximoPermitido)) {
      this.toastr.warning(!this.validaciones.checkParametrosEntrada(this.parametrosEntrada) ?
        'Verifique el cargue y la configuración de los parámetros de entrada' :
        !this.validaciones.checkFuncionActivacion(this.checkEscalon, this.checkRampa) ?
          'Verifique la configuración de la función de activación' :
          !this.validaciones.checkParametrosEntrenamiento(this.numeroIteraciones, this.rataAprendizaje, this.errorMaximoPermitido) ?
            'Verifique la configuración de los parámetros de entrenamiento' :
            'Verifique la configuración de los pesos sinápticos', '¡Advertencia!');
      return;
    }
    let indiceIteraciones = 0;
    this.tablaErrores = [];
    while (indiceIteraciones < this.numeroIteraciones.value) {
      let erroresPatrones: number[] = [];
      this.parametrosEntrada.patrones.forEach(patron => {
        let entrada = patron.valores[0];
        let erroresLineales = this.entrenamientoService.calcularErroresLineales(this.parametrosEntrada, this.pesosSinapticos,
          this.checkRampa, this.checkEscalon, patron);
        let errorPatron = this.entrenamientoService.errorPatron(erroresLineales, this.parametrosEntrada.numeroSalidas);
        erroresPatrones.push(errorPatron);
        this.pesosSinapticos = this.entrenamientoService.obtenerPesosNuevos(this.parametrosEntrada,this.pesosSinapticos,
          this.rataAprendizaje.value,erroresLineales,entrada);
        this.mostrarContenidoPesosOptimos();
      });
      let errorRMS = this.entrenamientoService.errorRMS(erroresPatrones);
      this.tablaErrores.push(new TablaErroresRMS(indiceIteraciones+1,errorRMS));
      this.mostrarContenidoErrores();
      indiceIteraciones = this.tablaErrores[indiceIteraciones].error <= 0 ? this.numeroIteraciones.value : indiceIteraciones + 1;
    }
    this.redEntrenada = true;
  }

  guardarPesosOptimos() {
    this.parametrosEntrenamientoService.postPesosOptimos(this.redEntrenada, this.pesosSinapticos);
  }

  exportarPesosOptimos() {
    this.parametrosEntrenamientoService.exportPesosOptimos(this.redEntrenada, this.pesosSinapticos);
  }

  eliminarPesosOptimos() {
    this.parametrosEntrenamientoService.deletePesosOptimos();
  }

  //Obtencion de los controles del formulario

  get numeroEntradas() { return this.formParametrosEntrada.get('numeroEntradas') }
  get numeroSalidas() { return this.formParametrosEntrada.get('numeroSalidas'); }
  get numeroPatrones() { return this.formParametrosEntrada.get('numeroPatrones'); }
  get numeroIteraciones() { return this.formParametrosEntrenamiento.get('numeroIteraciones') }
  get rataAprendizaje() { return this.formParametrosEntrenamiento.get('rataAprendizaje'); }
  get errorMaximoPermitido() { return this.formParametrosEntrenamiento.get('errorMaximoPermitido'); }
}