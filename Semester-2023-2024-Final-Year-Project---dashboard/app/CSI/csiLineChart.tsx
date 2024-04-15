'use client'
import React, { use, useEffect, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

//interface

interface lineChartProps {
    csiData: number[],
}

ChartJS.register(...registerables);



export default function csiLineChart(lineChartProps: lineChartProps) {
    const [dataPoint, setDataPoint] = useState<{ x: number, y: number }[]>([]) //x = subcarrier index, y = amplitude
    const [timeoutForChart, setTimeoutForChart] = useState<NodeJS.Timeout>();
    //https://www.math-only-math.com/amplitude-or-argument-of-a-complex-number.html
    function calculateAmplitudePhase(real: number, imaginary: number) {
        return Math.sqrt(real ** 2 + imaginary ** 2);
    }

    useEffect(() => {
        //console.log("csiData length ", lineChartProps.csiData.length);

        if (lineChartProps.csiData.length !== 0) {
            if (timeoutForChart === undefined) {

                setTimeoutForChart(setTimeout(() => {
                    setDataPoint([])
                    for (let i = 0; i < lineChartProps.csiData.length/2; i++) {
                        const shownData = {
                            x: i,
                            y: calculateAmplitudePhase(lineChartProps.csiData[i * 2], lineChartProps.csiData[i * 2 + 1])
                        }
                        setDataPoint(oldData => [...oldData, shownData])
                    }
                    setTimeoutForChart(undefined)
                }, 1000)
                )
            }
        }

    }, [lineChartProps.csiData, timeoutForChart, lineChartProps.csiData.length > 0])



ChartJS.register(...registerables);


const data = {
    datasets: [
        {
            label: 'CSI Data',
            data: dataPoint,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }
    ]

};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 0
    },

    scales: {
        x: {
            type: 'linear',
            min: 0,
            max: 51,
            title: {
                display: true,
                text: 'Subcarrier Index'
            },
        },
        y: {
            title: {
                display: true,
                text: 'Amplitude'
            }

        }
    }

}

return (
    <div className='h-[90%]'>
        <Line data={data} options={options} />
    </div>
);
};