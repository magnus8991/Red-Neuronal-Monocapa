import { AfterViewInit, Component, OnInit, Output, ViewChild, EventEmitter } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { Fila } from "src/app/RedMonocapa/Modelos/fila";
import { GraficaErrores } from "src/app/RedMonocapa/Modelos/graficaErrores";
import { MatrizPesosSinapticos } from "src/app/RedMonocapa/Modelos/matrizPesosSinapticos";
import { ParametrosEntrada } from "src/app/RedMonocapa/Modelos/parametrosEntrada";
import { TablaErroresRMS } from "src/app/RedMonocapa/Modelos/tablaErroresRms";
import { EntrenamientoService } from "src/app/RedMonocapa/Servicios/entrenamiento.service";
import { ParametrosEntrenamientoService } from "src/app/RedMonocapa/Servicios/parametrosEntrenamiento.service";
import { ValidacionesService } from "src/app/RedMonocapa/Servicios/validaciones.service";


@Component({
  selector: 'step-entrenamiento',
  templateUrl: './step-entrenamiento.component.html',
  styleUrls: ['./step-entrenamiento.component.css']
})
export class StepEntrenamientoComponent implements OnInit, AfterViewInit {
  dataSourcePesosOptimos: MatTableDataSource<Fila>;
  dataSourceErrores: MatTableDataSource<TablaErroresRMS>;
  tablaErroresRMS: TablaErroresRMS[] = [];
  displayedColumnsPesosOptimos: string[];
  displayedColumnsErrores: string[] = ['No. Iteración', 'Error RMS'];
  @ViewChild('paginatorPesosOptimos') paginatorPesosOptimos: MatPaginator;
  @ViewChild('sortPesosOptimos') sortPesosOptimos: MatSort;
  @ViewChild('paginatorErrores') paginatorErrores: MatPaginator;
  @ViewChild('sortErrores') sortErrores: MatSort;
  redEntrenada: boolean = false;
  graficaErrores: GraficaErrores;
  erroresRMS: number[] = [];
  erroresMaximosPermitidos: number[] = [];
  numerosIteraciones: number[] = [];
  pesosOptimos: MatrizPesosSinapticos;
  @Output() reloadEntrenamiento = new EventEmitter<unknown>();
  @Output() trainingNetwork = new EventEmitter<unknown>();
  @Output() saveWeightAndNetworkConfiguration = new EventEmitter<unknown>();

  constructor(private parametrosEntrenamientoService: ParametrosEntrenamientoService,
    private entrenamientoService: EntrenamientoService,
    private validaciones: ValidacionesService,
    private toastr: ToastrService) {
    for (let i = 0; i < 5; i++) this.tablaErroresRMS.push(new TablaErroresRMS(i + 1, 'N/A'));
  }

  ngAfterViewInit() {
    this.dataSourcePesosOptimos.paginator = this.paginatorPesosOptimos;
    this.dataSourcePesosOptimos.sort = this.sortPesosOptimos;
    this.dataSourceErrores.paginator = this.paginatorErrores;
    this.dataSourceErrores.sort = this.sortErrores;
    this.graficaErrores = new GraficaErrores(document.getElementById('chartErrores'), 'Error RMS vs Error Máximo Permitido',
      ['Error RMS', 'Error Máximo Permitido'], [this.erroresRMS, this.erroresMaximosPermitidos], this.numerosIteraciones);
  }

  ngOnInit() {
    this.pesosOptimos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesosOptimos();
    this.mostrarContenidoErrores();
  }

  //Visualizacion del contenido

  mostrarContenidoPesosOptimos() {
    this.displayedColumnsPesosOptimos = this.pesosOptimos.encabezados;
    this.dataSourcePesosOptimos = new MatTableDataSource<Fila>(this.pesosOptimos.filas);
    this.dataSourcePesosOptimos.paginator = this.paginatorPesosOptimos;
    this.dataSourcePesosOptimos.sort = this.sortPesosOptimos;
  }

  mostrarContenidoErrores() {
    this.dataSourceErrores = new MatTableDataSource<TablaErroresRMS>(this.tablaErroresRMS);
    this.dataSourceErrores.paginator = this.paginatorErrores;
    this.dataSourceErrores.sort = this.sortErrores;
  }

  //Operaciones de reinicio de valores

  reiniciarEntrenamiento() {
    this.reloadEntrenamiento.emit();
  }

  reiniciarStepEntrenamiento() {
    this.reiniciarMatrizDePesos();
    this.reiniciarMatrizDeErrores();
    this.redEntrenada = false;
  }

  reiniciarMatrizDePesos() {
    this.pesosOptimos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesosOptimos();
  }

  reiniciarMatrizDeErrores() {
    this.tablaErroresRMS = [];
    for (let i = 0; i < 5; i++) this.tablaErroresRMS.push(new TablaErroresRMS(i + 1, 'N/A'));
    this.mostrarContenidoErrores();
  }

  //Operaciones de entrenamiento de la red neuronal

  entrenar(ConfigYParamsTraining, parametrosEntrada: ParametrosEntrada) {
    if (!this.validaciones.checkConfiguracionRed(parametrosEntrada, this.pesosOptimos,
      ConfigYParamsTraining.checkEscalon, ConfigYParamsTraining.checkRampa, ConfigYParamsTraining.numeroIteraciones,
      ConfigYParamsTraining.rataAprendizaje, ConfigYParamsTraining.errorMaximoPermitido, ConfigYParamsTraining.checkSistema)) {
      this.toastr.warning(!this.validaciones.checkParametrosEntrada(parametrosEntrada) ?
        'Verifique el cargue y la configuración de los parámetros de entrada' :
        !this.validaciones.checkFuncionActivacion(ConfigYParamsTraining.checkEscalon, ConfigYParamsTraining.checkRampa,
          ConfigYParamsTraining.checkSistema) ? 'Verifique la configuración de la función de activación' :
          !this.validaciones.checkParametrosEntrenamiento(ConfigYParamsTraining.numeroIteraciones,
            ConfigYParamsTraining.rataAprendizaje, ConfigYParamsTraining.errorMaximoPermitido) ?
            'Verifique la configuración de los parámetros de entrenamiento' : 'Verifique la configuración de los pesos sinápticos', '¡Advertencia!');
      return;
    }
    let indiceIteraciones = 0;
    this.tablaErroresRMS = [];
    this.numerosIteraciones = [];
    this.erroresMaximosPermitidos = [];
    this.erroresRMS = [];
    this.pesosOptimos = this.parametrosEntrenamientoService.getPesosSinapticos();
    while (indiceIteraciones < ConfigYParamsTraining.numeroIteraciones.value) {
      let erroresPatrones: number[] = [];
      parametrosEntrada.patrones.forEach(patron => {
        let erroresLineales = this.entrenamientoService.calcularErroresLineales(parametrosEntrada, this.pesosOptimos,
          ConfigYParamsTraining.checkRampa, ConfigYParamsTraining.checkEscalon, patron);
        let errorPatron = this.entrenamientoService.errorPatron(erroresLineales, parametrosEntrada.numeroSalidas);
        erroresPatrones.push(errorPatron);
        this.pesosOptimos = this.entrenamientoService.obtenerPesosNuevos(parametrosEntrada, this.pesosOptimos,
          ConfigYParamsTraining.rataAprendizaje.value, erroresLineales, patron.valores);
        this.mostrarContenidoPesosOptimos();
      });
      let errorRMS = this.entrenamientoService.errorRMS(erroresPatrones);
      this.tablaErroresRMS.push(new TablaErroresRMS(indiceIteraciones + 1, errorRMS));
      this.actualizarGraficaErrores(indiceIteraciones, errorRMS, ConfigYParamsTraining.errorMaximoPermitido);
      this.mostrarContenidoErrores();
      indiceIteraciones = this.tablaErroresRMS[indiceIteraciones].error <= ConfigYParamsTraining.errorMaximoPermitido.value ?
        ConfigYParamsTraining.numeroIteraciones.value : indiceIteraciones + 1;
    }
    this.redEntrenada = true;
    this.toastr.info('La red neuronal ha sido entrenada correctamente', '¡Enhorabuena!');
  }

  entrenarEvent() {
    this.trainingNetwork.emit();
  }

  actualizarGraficaErrores(indiceIteraciones: number, errorRMS: number, errorMaximoPermitido: number) {
    this.numerosIteraciones.push(indiceIteraciones + 1);
    this.erroresRMS.push(errorRMS);
    this.erroresMaximosPermitidos.push(errorMaximoPermitido);
    this.graficaErrores.actualizarDatos(['Error RMS', 'Error Máximo Permitido'], [this.erroresRMS, this.erroresMaximosPermitidos]);
  }

  guardarPesosYConfRed(funcionesActivacion) {
    let configuracionRed = funcionesActivacion.checkRampa ? 'rampa' : funcionesActivacion.checkEscalon ? 'escalon' : 'sistema';
    this.parametrosEntrenamientoService.postPesosOptimosYConfRed(this.redEntrenada, this.pesosOptimos, configuracionRed);
  }

  guardarPesosYConfRedEvent() {
    this.saveWeightAndNetworkConfiguration.emit();
  }

  exportarPesosOptimos() {
    this.parametrosEntrenamientoService.exportPesosOptimos(this.redEntrenada, this.pesosOptimos);
  }

  eliminarPesosOptimos() {
    this.parametrosEntrenamientoService.deletePesosOptimos();
  }
}