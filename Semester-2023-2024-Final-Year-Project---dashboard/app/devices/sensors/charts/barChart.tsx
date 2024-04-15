'use client'

import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';

interface barChartProps {
    sensorId: Number,
    receivedTime: EpochTimeStamp,
    neededData: string,
    parameters: string,
    chartValue: chartValue[],
}

export interface chartData {
    name: string,
    method: string,
    count: number
}

//bar chart and pie chart returning values (from barPieChartOption.tsx)
//chartValues: chartValues[i] is the i-th condition, where chartValues[i].method is the method, chartValues[i].value is the value
//Xaxis is the category, selectedXAxis is the chosen category

export default function BarChart(barChartProps: barChartProps) {
    const [chartData, setChartData] = useState<chartData[]>([]) //!!! different chart interpret chartData differently !!!
    const [receivedTime, setReceivedTime] = useState<EpochTimeStamp>(barChartProps.receivedTime)

    const STORAGE_KEY = barChartProps.sensorId.toString().concat(barChartProps.parameters, 'bar', barChartProps.chartValue.map((arrayElement) => arrayElement.value).join(""))

    registerables.forEach((registerable) => {
        ChartJS.register(registerable);
    });

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
            barChartProps.chartValue.map((arrayElement) => {
                setChartData((prevChartData) => {
                    return [...prevChartData, { name: arrayElement.value, method: arrayElement.method, count: 0 }]
                })
            })
        }


    }, [barChartProps.chartValue, barChartProps.parameters])

    useEffect(() => { //when data come in, if it is not empty, then increase count of corresponding data and update the chart
        //e.g: chartValues=[{method: "smaller", value: "10"}, {method: "bigger", value: "20"}], parameters = "temperature"
        //then when websocket come in, get "temperature" data and update the chart
        //e.g: if the data is 15, then increase the count of "smaller" by 1
        //e.g: if the data is 25, then increase the count of "bigger" by 1
        //else, no need update
        console.log("bar chart data update useEffect called");
        console.log(receivedTime, " vs ", barChartProps.receivedTime);

        if (barChartProps.neededData !== undefined && receivedTime !== barChartProps.receivedTime) {
            const updatedChartData = chartData;
            console.log("updated chart data: ", updatedChartData);

            const receivedData = JSON.parse(barChartProps.neededData);
            console.log("received data: ", receivedData);

            console.log("needed data: ", receivedData[barChartProps.parameters]);
            console.log("compare with: ", updatedChartData.map((data) => data.name));

            let webSocketMessage: any;
            if (typeof receivedData['payload'] === 'object') {
                console.log("received data is object");
                webSocketMessage = receivedData['payload'][barChartProps.parameters]
                console.log("webSocketMessage is: ", webSocketMessage);

            }
            else {
                webSocketMessage = receivedData[barChartProps.parameters];
            }


            if (isNaN(parseInt(webSocketMessage))) {
                console.log("receivedData[barChartProps.parameters] is not a number");
            }
            else {
                console.log("receivedData[barChartProps.parameters] is a number");
                webSocketMessage = parseInt(webSocketMessage);
                console.log(webSocketMessage);
            }

            let chartDataCopy = updatedChartData.map((data) => {
                let count = data.count;
                let parsedData = parseInt(data.name);
                if (isNaN(parsedData)) {
                    console.log("data.name is not a number");
                }
                else {
                    console.log("data.name is a number");
                }
                console.log("type of data.name is: ", typeof (data.name));
                console.log("type of webSocketMessage is: ", typeof (webSocketMessage));


                if (!isNaN(parsedData) && webSocketMessage < parsedData && data.method === "<") {
                    count += 1;
                }
                else if (!isNaN(parsedData) && webSocketMessage > parsedData && data.method === ">") {

                    count += 1;
                }
                else if (webSocketMessage == data.name && data.method === "=") {
                    console.log("===");
                    count += 1;
                }
                else if (!isNaN(parsedData) && webSocketMessage !== parsedData && data.method === "≠") {
                    count += 1;
                }
                else if (!isNaN(parsedData) && webSocketMessage >= parsedData && data.method === "≥") {
                    count += 1;
                }
                else if (!isNaN(parsedData) && webSocketMessage <= parsedData && data.method === "≤") {
                    count += 1;
                }
                return { name: data.name, method: data.method, count: count }
            });

            setChartData(chartDataCopy)
            setReceivedTime(barChartProps.receivedTime)

        }
        //use effect mount should be everything
    }, [barChartProps])

    useEffect(() => {

        const storedData = {
            data: chartData,
            receivedTime: barChartProps.receivedTime
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
        console.log("run the update useEffect");

        console.log(JSON.stringify(storedData) + " is stored in local storage" + " with key: " + STORAGE_KEY);

    }
        , [chartData])

    useEffect(() => { //when chartData is updated, print it
        console.log('in chart.tsx chartdata = ', chartData);
    }, [chartData])


    const data = {
        labels: chartData.map((data) => data.method.concat(" ", data.name)),
        datasets: [{
            label: barChartProps.parameters,
            data: chartData.map((data) => data.count),
            backgroundColor: [
                '#FF0000',
                '#0000FF',
                '#FFFF00',
                '#008000',
                '#800080',
            ],
            borderColor: [
                'black'
            ],
            borderWidth: 2,
        }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        
    };

    return <div className='h-full'>
        <Bar data={data} options={options} />
    </div>
};
