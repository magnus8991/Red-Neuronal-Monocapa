import { AfterViewInit, Component, OnInit, Output, ViewChild, EventEmitter } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { Fila } from "src/app/RedMonocapa/Modelos/fila";
import { Grafica } from "src/app/RedMonocapa/Modelos/grafica";
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
  graficaErrores: Grafica;
  graficaSalidas: Grafica;
  erroresRMS: number[] = [];
  erroresMaximosPermitidos: number[] = [];
  numerosIteraciones: number[] = [];
  salidasDeseadas: any[] = [];
  salidasRed: any[] = [];
  pesosOptimos: MatrizPesosSinapticos;
  @Output() reloadEntrenamiento = new EventEmitter<unknown>();
  @Output() trainingNetwork = new EventEmitter<unknown>();
  @Output() saveWeightAndNetworkConfiguration = new EventEmitter<unknown>();

  constructor(private parametrosEntrenamientoService: ParametrosEntrenamientoService,
    private entrenamientoService: EntrenamientoService,
    private toastr: ToastrService) {
    for (let i = 0; i < 5; i++) this.tablaErroresRMS.push(new TablaErroresRMS(i + 1, 'N/A'));
  }

  ngAfterViewInit() {
    this.dataSourcePesosOptimos.paginator = this.paginatorPesosOptimos;
    this.dataSourcePesosOptimos.sort = this.sortPesosOptimos;
    this.dataSourceErrores.paginator = this.paginatorErrores;
    this.dataSourceErrores.sort = this.sortErrores;
    this.graficaErrores = new Grafica(document.getElementById('chartErrores'), 'Error RMS vs Error Máximo Permitido',
      ['Error RMS', 'Error Máximo Permitido'], [this.erroresRMS, this.erroresMaximosPermitidos], this.numerosIteraciones);
    this.graficaSalidas = new Grafica(document.getElementById('chartSalidas'), 'Salida deseada (YD) vs Salida de la red (YR) -- Última iteración',
      ['YD', 'YR'], [this.salidasDeseadas, this.salidasRed], []);
    this.actualizarGraficaSalidasDeseadas();
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
    this.reiniciarGraficas();
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
    let indiceIteraciones = 0;
    this.inicializarValores();
    while (indiceIteraciones < ConfigYParamsTraining.numeroIteraciones) {
      this.salidasRed = this.entrenamientoService.getInitSalidasRed(parametrosEntrada.numeroSalidas);
      let erroresPatrones: number[] = [];
      let indicePatron = 0;
      parametrosEntrada.patrones.forEach(patron => {
        let erroresYSalidaRed = this.entrenamientoService.calcularErroresLineales(parametrosEntrada, this.pesosOptimos,
          ConfigYParamsTraining.checkRampa, ConfigYParamsTraining.checkEscalon, patron);
        let erroresLineales = erroresYSalidaRed.erroresLineales;
        for (let i = 0; i < parametrosEntrada.numeroSalidas; i++) this.salidasRed[i].push(erroresYSalidaRed.salidas[i]);
        let errorPatron = this.entrenamientoService.errorPatron(erroresLineales, parametrosEntrada.numeroSalidas);
        erroresPatrones.push(errorPatron);
        this.pesosOptimos = this.entrenamientoService.obtenerPesosNuevos(parametrosEntrada, this.pesosOptimos,
          ConfigYParamsTraining.rataAprendizaje, erroresLineales, patron.valores);
        this.mostrarContenidoPesosOptimos();
        indicePatron += 1;
      });
      let errorRMS = this.entrenamientoService.errorRMS(erroresPatrones);
      this.tablaErroresRMS.push(new TablaErroresRMS(indiceIteraciones + 1, errorRMS));
      this.actualizarGraficaErrores(indiceIteraciones, errorRMS, ConfigYParamsTraining.errorMaximoPermitido);
      this.actualizarGraficaSalidas(parametrosEntrada.numeroSalidas, parametrosEntrada.numeroPatrones);
      this.mostrarContenidoErrores();
      indiceIteraciones = this.tablaErroresRMS[indiceIteraciones].error <= ConfigYParamsTraining.errorMaximoPermitido ?
        ConfigYParamsTraining.numeroIteraciones : indiceIteraciones + 1;
    }
    this.redEntrenada = true;
    this.toastr.info('La red neuronal ha sido entrenada correctamente', '¡Enhorabuena!');
  }

  inicializarValores() {
    this.tablaErroresRMS = [];
    this.numerosIteraciones = [];
    this.erroresMaximosPermitidos = [];
    this.erroresRMS = [];
    this.pesosOptimos = this.parametrosEntrenamientoService.getPesosSinapticos();
  }

  entrenarEvent() {
    this.trainingNetwork.emit();
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

  //Operaciones de las graficas

  reiniciarGraficas() {
    this.erroresRMS = [];
    this.erroresMaximosPermitidos = [];
    this.salidasDeseadas = [];
    this.salidasRed = [];
    this.graficaErrores.actualizarDatos(['Error RMS', 'Error Máximo Permitido'], [this.erroresRMS, this.erroresMaximosPermitidos]);
    this.graficaSalidas.actualizarDatosYCategorias(['YD', 'YR'], [this.salidasDeseadas, this.salidasRed], 0);
  }

  actualizarGraficaErrores(indiceIteraciones: number, errorRMS: number, errorMaximoPermitido: number) {
    this.numerosIteraciones.push(indiceIteraciones + 1);
    this.erroresRMS.push(errorRMS);
    this.erroresMaximosPermitidos.push(errorMaximoPermitido);
    this.graficaErrores.actualizarDatos(['Error RMS', 'Error Máximo Permitido'], [this.erroresRMS, this.erroresMaximosPermitidos]);
  }

  actualizarGraficaSalidasDeseadas() {
    let data = this.parametrosEntrenamientoService.getParametrosEntrada();
    if (data) {
      this.salidasDeseadas = this.entrenamientoService.getSalidasDeseadas(data.patrones, data.numeroEntradas, data.numeroSalidas);
      this.salidasRed = this.entrenamientoService.getInitSalidasRed(data.numeroSalidas);
      this.actualizarGraficaSalidas(data.numeroSalidas, data.numeroPatrones);
    }
  }

  actualizarGraficaSalidas(numeroSalidas: number, numeroPatrones: number) {
    let salidasTotales: any[] = [];
    this.salidasDeseadas.forEach(salidaDeseada => {
      salidasTotales.push(salidaDeseada);
    });
    this.salidasRed.forEach(salidaRed => {
      salidasTotales.push(salidaRed);
    });
    this.graficaSalidas.actualizarDatosYCategorias(this.obtenerNombresSeries(numeroSalidas), salidasTotales, numeroPatrones);
  }

  obtenerNombresSeries(numeroSalidas: number): string[] {
    let series: string[] = [];
    for (let i = 0; i < numeroSalidas; i++) {
      series.push('YD' + (i + 1).toString());
    }
    for (let i = 0; i < numeroSalidas; i++) {
      series.push('YR' + (i + 1).toString());
    }
    return series;
  }
}