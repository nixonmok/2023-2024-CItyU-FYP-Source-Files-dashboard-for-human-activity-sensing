'use client'
import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';

interface scatterChartProps {
    sensorId: Number,
    receivedTime: EpochTimeStamp,
    neededData: string,
    parameters: string,
    chartValue: chartValue[],
}

interface chartData {
    x: number,
    y: number
}

export default function ScatterChart(scatterChartProps: scatterChartProps) {
    const [chartData, setChartData] = useState<chartData[]>([]) //!!! different chart interpret chartData differently !!!
    const [receivedTime, setReceivedTime] = useState<EpochTimeStamp>(scatterChartProps.receivedTime)

    ChartJS.register(...registerables);
    const STORAGE_KEY = scatterChartProps.sensorId.toString().concat(scatterChartProps.parameters, 'scatter', scatterChartProps.chartValue.map((arrayElement) => arrayElement.value).join(""))

    useEffect(() => { //when chartProps is updated, which for example when other type of visualization is chosen, it will reset everything
        console.log("!!!!!!!!");
        const storedData = localStorage.getItem(STORAGE_KEY)
        console.log(storedData, "is stored data");
        console.log("storage key is", STORAGE_KEY);

        console.log("run the second useEffect");
        if (storedData !== null) {
            setChartData(JSON.parse(storedData).data)
            setReceivedTime(JSON.parse(storedData).receivedTime)
            console.log("data is restored", storedData)
            localStorage.removeItem(STORAGE_KEY)
        }
        else {
            setChartData([])
        }


    }, [scatterChartProps.chartValue, scatterChartProps.parameters])

    useEffect(() => {

        if (scatterChartProps.neededData !== undefined && receivedTime !== scatterChartProps.receivedTime) {
            console.log('仆街', scatterChartProps.neededData);

            const firstParam = scatterChartProps.parameters.split(",")[0]
            const secondParam = scatterChartProps.parameters.split(",")[1]
            var firstParamData = NaN;
            var secondParamData = NaN;
            console.log("first param: ", firstParam);
            console.log("second param: ", secondParam);

            const receivedData = JSON.parse(scatterChartProps.neededData);
            console.log('屌屌', receivedData['payload'], typeof receivedData['payload'] === 'object');

            //if payload is an field in the object, it means the data has inner object

            if (typeof receivedData['payload'] === 'object') {
                console.log("received data is object");

                firstParamData = Number(receivedData['payload'][firstParam])
                secondParamData = Number(receivedData['payload'][secondParam])
                
            }
            else {
                console.log("received data: ", receivedData);
                firstParamData = Number(receivedData[firstParam])
                secondParamData = Number(receivedData[secondParam])
            }

            setChartData((prevChartData) => {
                return [...prevChartData, { x: firstParamData, y: secondParamData }]
            }
            )
        }
        setReceivedTime(scatterChartProps.receivedTime)
    }, [scatterChartProps])

    useEffect(() => {

        const storedData = {
            data: chartData,
            receivedTime: scatterChartProps.receivedTime
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
        console.log("run the update useEffect");

        console.log(JSON.stringify(storedData) + " is stored in local storage" + " with key: " + STORAGE_KEY);

    }
        , [chartData])

    //each object represent a point in the chart
    const data = {
        datasets: [
            {
                label: 'Scatter Chart',
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

    return <Scatter data={data} options={options} />;
};

