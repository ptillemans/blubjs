import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Chart as ChartJS} from 'chart.js/src/chart';

class Chart extends Component {

    componentDidMount() {
        this.initChart();
    }

    componentWillUnmount() {
        this.destroyChart();
    }

    componentDidUpdate() {
        if (this.chart) {
            this.chart.data = this.props.data;
            this.chart.update();
            console.log(this.chart)
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
            <canvas ref={(canvas) => this.canvas = canvas}></canvas>
        );
    }
}

Chart.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.any),
        datasets: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            data: PropTypes.arrayOf(PropTypes.any)
        })),
        width: PropTypes.number
    }),
    options: PropTypes.any
};

export default Chart;