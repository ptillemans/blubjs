import React, { Component } from 'react';
import ChartJS from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

class Chart extends Component {

    componentDidMount() {
        this.initChart();
    }

    componentWillUnmount() {
        this.destroyChart();
    }

    componentDidUpdate() {
        console.log("Chart component was updated")
        if (this.chart) {
            this.chart.data = this.props.data;
            this.chart.update();
        }
    }

    initChart() {
        this.chart = new ChartJS(this.canvas, {
            type: this.props.type,
            data: this.props.data,
            options: this.props.options
        });
    }

    destroyChart() {
        this.chart.destroy();
    }

    render() {
        return (
            <canvas ref={(canvas) => { this.canvas = canvas; }}></canvas>
        );
    }
}



export default Chart;