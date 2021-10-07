import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Fila } from '../../Modelos/fila';
import { MatrizPesosSinapticos } from '../../Modelos/matrizPesosSinapticos';
import { Patron } from '../../Modelos/patron';
import { ParametrosEntrenamientoService } from '../../Servicios/parametrosEntrenamiento.service';
import { SimulacionService } from '../../Servicios/simulacion.service';
import { ValidacionesService } from '../../Servicios/validaciones.service';

@Component({
  selector: 'app-simulacion',
  templateUrl: './simulacion.component.html',
  styleUrls: ['./simulacion.component.css']
})
export class SimulacionComponent implements OnInit, AfterViewInit {
  entradas: any[] = [];
  salidasRed: any[] = [];
  pesosOptimos: MatrizPesosSinapticos;
  displayedColumnsPesosOptimos: string[];
  dataSourcePesosOptimos: MatTableDataSource<Fila>;
  @ViewChild('paginatorPesosOptimos') paginatorPesosOptimos: MatPaginator;
  @ViewChild('sortPesosOptimos') sortPesosOptimos: MatSort;
  disabledFilePesos: boolean = true;
  checkFilePesos: boolean = false;
  checkPesosAnteriores: boolean = false;
  labelAnterior: string = 'Sin cargar';
  spinnerAnteriorValue: number = 0;
  spinnerAnteriorMode: string = 'determinate';
  errorCheckAnterior: boolean = false;
  errorCheckFile: boolean = false;
  numeroEntradas: number = 0;
  numeroSalidas: number = 0;
  checkRampa: boolean = false;
  checkEscalon: boolean = false;
  checkSistema: boolean = false;

  constructor(private toastr: ToastrService,
    private simulacionService: SimulacionService,
    private validaciones: ValidacionesService,
    private parametrosEntrenamientoService: ParametrosEntrenamientoService) { }

    ngAfterViewInit() {
      this.dataSourcePesosOptimos.paginator = this.paginatorPesosOptimos;
      this.dataSourcePesosOptimos.sort = this.sortPesosOptimos;
    }

  ngOnInit(): void {
    this.pesosOptimos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesosOptimos();
  }

  //Cargue del archivo de los pesos óptimos de entrada

  crearArchivo(event) {
    if (event.target.files.length > 0) {
      var inputFile = <HTMLInputElement>document.getElementById('file-1');
      var fileName = <HTMLSpanElement>document.getElementById('iborrainputfile');
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
      this.pesosOptimos = this.simulacionService.getPesosOptimosFile(reader.result);
      if (!this.validaciones.checkMatrizPesos(this.pesosOptimos)) {
        fileHtml.value = '';
        fileName.innerHTML = 'Cargar Archivo';
      }
      this.mostrarContenidoPesosOptimos();
      this.crearEntradasYSalidas();
    };
    reader.readAsText(inputFile, 'ISO-8859-1');
  }

  //Operaciones de los slide toggles de la funcion de activacion

  toggleRampa(event) {
    if (event) {
      this.checkEscalon = false;
      this.checkSistema = false;
    }
  }

  toggleEscalon(event) {
    if (event) {
      this.checkRampa = false;
      this.checkSistema = false;
    }
  }

  toggleSistema(event) {
    if (event) {
      this.checkRampa = false;
      this.checkEscalon = false;
    }
  }

  //Creción de valores de entrada y salida

  crearEntradasYSalidas() {
    this.numeroEntradas = this.pesosOptimos.filas.length;
    this.numeroSalidas = this.pesosOptimos.filas[0].columnas.length;
    this.entradas = this.simulacionService.getListValores(this.numeroEntradas);
    this.salidasRed = this.simulacionService.getListValores(this.numeroSalidas);
  }

  //Visualizacion del contenido de los parametros de entrada y de los pesos sinapticos

  mostrarContenidoPesosOptimos() {
    this.displayedColumnsPesosOptimos = this.pesosOptimos.encabezados;
    this.dataSourcePesosOptimos = new MatTableDataSource<Fila>(this.pesosOptimos.filas);
    this.dataSourcePesosOptimos.paginator = this.paginatorPesosOptimos;
    this.dataSourcePesosOptimos.sort = this.sortPesosOptimos;
  }

  //Operaciones de los slide toggles de los pesos sinapticos

  toggleArchivoPesos(event) {
    if (this.errorCheckFile) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        this.errorCheckFile = false;
        this.pesosOptimos = new MatrizPesosSinapticos();
        this.checkPesosAnteriores = false;
        this.disabledFilePesos = false;
        this.deshabilitarPesoAnterior();
        this.reiniciarMatrizDePesos();
        this.reiniciarEntradasYSalidas();
        break;
      case false:
        if (!this.errorCheckFile) this.reiniciarMatrizDePesos();
        if (!this.errorCheckFile) this.reiniciarEntradasYSalidas();
        this.deshabilitarCargueArchivoPesos();
        break;
    }
  }

  toggleEntrenamientoAnterior(event) {
    if (this.errorCheckAnterior) event.source.checked = true;
    switch (event.source.checked) {
      case true:
        this.spinnerAnteriorMode = 'indeterminate';
        let data = this.parametrosEntrenamientoService.getPesosOptimos();
        this.pesosOptimos = data ? data : new MatrizPesosSinapticos();
        if (!data) {
          event.source.checked = false;
          this.deshabilitarPesoAnterior();
          this.toastr.error('No existen pesos en almacenamiento local', '¡Oh no!');
          this.errorCheckAnterior = true;
          return;
        }
        this.obtenerConfiguracionRed();
        this.errorCheckAnterior = false;
        this.checkFilePesos = false;
        this.mostrarContenidoPesosOptimos();
        this.deshabilitarCargueArchivoPesos();
        this.entrenamientoAnteriorListo();
        this.crearEntradasYSalidas();
        break;
      case false:
        if (!this.errorCheckAnterior) this.reiniciarMatrizDePesos();
        if (!this.errorCheckAnterior) this.reiniciarEntradasYSalidas();
        this.deshabilitarPesoAnterior();
        break;
    }
  }

  //Operaciones de reinicio de valores

  reiniciarMatrizDePesos() {
    this.pesosOptimos = new MatrizPesosSinapticos();
    this.mostrarContenidoPesosOptimos();
  }

  reiniciarSimulacion() {
    this.checkFilePesos = false;
    this.checkPesosAnteriores = false;
    this.checkRampa = false;
    this.checkEscalon = false;
    this.checkSistema = false;
    this.deshabilitarCargueArchivoPesos();
    this.deshabilitarPesoAnterior();
    this.reiniciarMatrizDePesos();
    this.reiniciarEntradasYSalidas()
  }

  reiniciarEntradasYSalidas() {
    this.entradas = [];
    this.salidasRed = [];
    this.numeroEntradas = 0;
    this.numeroSalidas = 0;
  }

  //Operaciones de habilitacion y deshabilitacion de los toggles de los pesos sinapticos

  deshabilitarCargueArchivoPesos() {
    var inputFile = <HTMLInputElement>document.getElementById('file-1');
    var fileName = <HTMLSpanElement>document.getElementById('iborrainputfile');
    inputFile.value = '';
    fileName.innerHTML = 'Cargar Archivo';
    this.disabledFilePesos = true;
  }

  deshabilitarPesoAnterior() {
    this.spinnerAnteriorMode = 'determinate';
    this.spinnerAnteriorValue = 0;
    this.labelAnterior = 'Sin cargar';
  }

  entrenamientoAnteriorListo() {
    this.spinnerAnteriorMode = 'determinate';
    this.spinnerAnteriorValue = 100;
    this.labelAnterior = '¡Listo!';
  }

  // Operaciones de eliminación y simulación

  deletePesos() {
    this.parametrosEntrenamientoService.deletePesosOptimos();
  }

  simular() {
    if (!this.validaciones.checkMatrizPesos(this.pesosOptimos) || this.entradas.length == 0) {
      this.toastr.warning('Verifique el cargue de pesos y los valores de las entradas');
      return;
    }
    if (!this.validaciones.checkFuncionActivacion(this.checkEscalon, this.checkRampa, this.checkSistema)) {
      this.toastr.warning('Verifique la configuración de la función de activación');
      return;
    }
    let salidasRed = this.simulacionService.simular(this.entradas, this.salidasRed.length, this.pesosOptimos,
      this.checkRampa, this.checkEscalon);
    this.salidasRed = salidasRed ? salidasRed : this.salidasRed;
  }

  //Obtencion de configuracion

  obtenerConfiguracionRed() {
    switch (this.parametrosEntrenamientoService.getConfiguracionRed()) {
      case 'rampa':
        this.checkRampa = true;
        break;
      case 'escalon':
        this.checkEscalon = true;
        break;
      case 'sistema':
        this.checkSistema = true;
        break;
    }
  }
}
