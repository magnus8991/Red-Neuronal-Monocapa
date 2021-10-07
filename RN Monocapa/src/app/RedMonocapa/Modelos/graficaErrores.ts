import * as ApexCharts from "apexcharts";

export class GraficaErrores {
    chart: ApexCharts;

    constructor(grafica: HTMLElement, title: string, nombreSeries: any[], datos: any[], categories: any[]) {
        let options = {
            series: this.getSeries(nombreSeries, datos),
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: true
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight'
            },
            title: {
                text: title,
                align: 'center'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                },
            },
            xaxis: {
                categories: categories,
            }
        };
        this.chart = new ApexCharts(grafica, options);
        this.chart.render();
    }

    getSeries(nombreSeries: string[], datos: any[]): any[] {
        let series = [];
        for (let i = 0; i < nombreSeries.length; i++) {
            let serie = {
                name: nombreSeries[i],
                data: datos[i]
            };
            series.push(serie);
        }
        return series;
    }

    actualizarDatos(nombreSeries: any[], datos: any[]) {
        this.chart.updateSeries(this.getSeries(nombreSeries,datos));
    }
}