'use client'
import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';

//interface import
import { payloadFromDatabase } from '../analysisBox';

interface scatterChartProps {
    sensorId: Number,
    dataBaseData: payloadFromDatabase[],
    parameters: string,
    chartValue: chartValue[],
}

interface chartData {
    x: number,
    y: number
}

export default function ScatterChart(scatterChartProps: scatterChartProps) {
    const [chartData, setChartData] = useState<chartData[]>([]) //!!! different chart interpret chartData differently !!!

    ChartJS.register(...registerables);

    useEffect(() => { //when chartProps is updated, which for example when other type of visualization is chosen, it will reset everything

        if (scatterChartProps.dataBaseData.length !== 0) {

            const firstParam = scatterChartProps.parameters.split(",")[0]
            const secondParam = scatterChartProps.parameters.split(",")[1]

            for (let i = 0; i < scatterChartProps.dataBaseData.length; ++i) {
                const receivedData = JSON.parse(scatterChartProps.dataBaseData[i].message)

                var firstParamData = NaN;
                var secondParamData = NaN;

                firstParamData = Number(receivedData[firstParam])
                secondParamData = Number(receivedData[secondParam])

                setChartData((prevChartData) => {
                    return [...prevChartData, { x: firstParamData, y: secondParamData }]
                }
                )
            }

        }

    }, [scatterChartProps.chartValue, scatterChartProps.parameters])


    //each object represent a point in the chart
    const data = {
        datasets: [
            {
                label: 'data point',
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const options = {
        reponsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: scatterChartProps.parameters.split(",")[0],
                },
            },
            y: {
                title: {
                    display: true,
                    text: scatterChartProps.parameters.split(",")[1],
                },
            },
        },
    };

    return (
        <div className='h-[90%]'>
            <Scatter data={data} options={options} />
        </div>

    )
};

