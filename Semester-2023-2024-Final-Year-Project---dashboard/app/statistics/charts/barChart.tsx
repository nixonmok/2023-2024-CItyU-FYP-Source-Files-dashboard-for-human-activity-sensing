'use client'

import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';
import { payloadFromDatabase } from '../analysisBox';

interface barChartProps {
    sensorId: Number,
    dataBaseData: payloadFromDatabase[],
    parameters: string,
    chartValue: chartValue[],
}

interface chartData {
    name: string,
    method: string,
    count: number
}

//bar chart and pie chart returning values (from barPieChartOption.tsx)
//chartValues: chartValues[i] is the i-th condition, where chartValues[i].method is the method, chartValues[i].value is the value
//Xaxis is the category, selectedXAxis is the chosen category

export default function BarChart(barChartProps: barChartProps) {
    const colorGeneration = '#'
    const [color, setColor] = useState<string[]>([])
    const [chartData, setChartData] = useState<chartData[]>([]) //!!! different chart interpret chartData differently !!!
    const [canUpdate, setCanUpdate] = useState<boolean>(false)

    ChartJS.register(...registerables);

    useEffect(() => { //when chartProps is updated, which for example when other type of visualization is chosen, it will reset everything

        console.log("database data: ", barChartProps.dataBaseData);
        console.log("chart value: ", barChartProps.chartValue);

        setChartData([])
        barChartProps.chartValue.map((arrayElement) => {
            setChartData((prevChartData) => {
                return [...prevChartData, { name: arrayElement.value, method: arrayElement.method, count: 0 }]
            })
        })

        setCanUpdate(true)
    }, [barChartProps.chartValue, barChartProps.parameters])


    useEffect(() => { //when chartData is updated, print it
        console.log('in chart.tsx chartdata = ', chartData);
    }, [chartData])

    useEffect(() => { //when chartData is updated, print it
        // Now update the state once with the new array
        if (chartData.length !== 0 && canUpdate) { //if no this line, the whole compoenent will be not working
            console.log("chart data: ", chartData);

            const updatedChartData = chartData.map((data) => {
                let count = data.count
                for (let i = 0; i < barChartProps.dataBaseData.length; ++i) {
                    let message: any = barChartProps.dataBaseData[i].message
                    if (message[0] === '{') {
                        message = JSON.parse(message)[barChartProps.parameters]
                    }

                    if (isNaN(parseInt(message))) {
                    }
                    else {
                        message = parseInt(message);
                    }


                    let parsedData = parseInt(data.name);
                    if (isNaN(parsedData)) {
                        console.log("data.name is not a number");
                    }
                    else {
                        console.log("data.name is a number");
                    }

                    if (!isNaN(parsedData) && message < parsedData && data.method === "<") {
                        count += 1;
                    }
                    else if (!isNaN(parsedData) && message > parsedData && data.method === ">") {

                        count += 1;
                    }
                    else if (message == data.name && data.method === "=") {
                        console.log("===");
                        count += 1;
                    }
                    else if (!isNaN(parsedData) && message !== parsedData && data.method === "≠") {
                        count += 1;
                    }
                    else if (!isNaN(parsedData) && message >= parsedData && data.method === "≥") {
                        count += 1;
                    }
                    else if (!isNaN(parsedData) && message <= parsedData && data.method === "≤") {
                        count += 1;
                    }
                }

                return { name: data.name, method: data.method, count: count }
            })
            console.log('updatedCHartData:', updatedChartData);

            setChartData(updatedChartData)
            setColor(updatedChartData.map((data) => colorGeneration.concat(Math.floor(Math.random() * 16777215).toString(16)))) //random color generation
            setCanUpdate(false)
            //use effect mount should be everything
        }


    }, [canUpdate === true])



    const data = {
        labels: chartData.map((data) => data.method.concat(" ", data.name)),
        datasets: [{
            label: barChartProps.parameters,
            data: chartData.map((data) => data.count),
            backgroundColor: color,
            borderColor: [
                'black'
            ],
            borderWidth: 2,
        }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#FF0000', // This changes the legend font color
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#FF0000', // This changes the x-axis font color
                },
            },
            y: {
                ticks: {
                    color: '#FF0000', // This changes the y-axis font color
                },
            },
        },
    };

    return <div className=''>
            <Bar data={data} options={options} />
    </div>
};
