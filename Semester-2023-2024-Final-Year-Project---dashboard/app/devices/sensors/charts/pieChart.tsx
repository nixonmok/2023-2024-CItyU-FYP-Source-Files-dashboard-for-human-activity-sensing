'use client'
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import { useState, useEffect } from 'react';

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';
import { chartData } from './barChart'


interface pieChartProps {
    sensorId: Number,
    receivedTime: EpochTimeStamp,
    neededData: string,
    parameters: string,
    chartValue: chartValue[],
}


export default function PieChart(pieChartProps: pieChartProps){
    const [chartData, setChartData] = useState<chartData[]>([]) //!!! different chart interpret chartData differently !!!
    const [receivedTime, setReceivedTime] = useState<EpochTimeStamp>(pieChartProps.receivedTime)

    const STORAGE_KEY = pieChartProps.sensorId.toString().concat(pieChartProps.parameters, 'pie', pieChartProps.chartValue.map((arrayElement) => arrayElement.value).join(""))

    ChartJS.register(...registerables);

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
            pieChartProps.chartValue.map((arrayElement) => {
                setChartData((prevChartData) => {
                    return [...prevChartData, { name: arrayElement.value, method: arrayElement.method, count: 0 }]
                })
            })
        }


    }, [pieChartProps.chartValue, pieChartProps.parameters])

    useEffect(() => { //when data come in, if it is not empty, then increase count of corresponding data and update the chart
        //e.g: chartValues=[{method: "smaller", value: "10"}, {method: "bigger", value: "20"}], parameters = "temperature"
        //then when websocket come in, get "temperature" data and update the chart
        //e.g: if the data is 15, then increase the count of "smaller" by 1
        //e.g: if the data is 25, then increase the count of "bigger" by 1
        //else, no need update
        console.log("PIE chart data update useEffect called");
        console.log(receivedTime, " vs ", pieChartProps.receivedTime);

        if (pieChartProps.neededData !== undefined && receivedTime !== pieChartProps.receivedTime) {
            const updatedChartData = chartData;
            console.log("updated chart data: ", updatedChartData);

            const receivedData = JSON.parse(pieChartProps.neededData);
            console.log("needed data: ", receivedData[pieChartProps.parameters]);
            console.log("compare with: ", updatedChartData.map((data) => data.name));

            let webSocketMessage: any;
            if (typeof receivedData['payload'] === 'object') {
                console.log("received data is object");
                webSocketMessage = receivedData['payload'][pieChartProps.parameters]
            }
            else{
                webSocketMessage = receivedData[pieChartProps.parameters];
            }

            if (isNaN(parseInt(webSocketMessage))) {
                console.log("receivedData[pieChartProps.parameters] is not a number");
            }
            else {
                console.log("receivedData[pieChartProps.parameters] is a number");
                webSocketMessage = parseInt(webSocketMessage);
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

                if (!isNaN(parsedData) && webSocketMessage < parsedData && data.method === "<") {
                    count += 1;
                }
                else if (!isNaN(parsedData) && webSocketMessage > parsedData && data.method === ">") {
                    console.log(receivedData[pieChartProps.parameters], "is bigger than", data.name);

                    count += 1;
                }
                else if (webSocketMessage == data.name && data.method === "=") {
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
            setReceivedTime(pieChartProps.receivedTime)

        }
        //use effect mount should be everything
    }, [pieChartProps])

    useEffect(() => {

            const storedData = {
                data: chartData,
                receivedTime: pieChartProps.receivedTime
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
            console.log("run the update useEffect");

            console.log(JSON.stringify(storedData) + " is stored in local storage" + " with key: " +STORAGE_KEY );
        
    }
        , [chartData])

    useEffect(() => { //when chartData is updated, print it
        console.log('in chart.tsx chartdata = ', chartData);
    }, [chartData])


    const data = {
        labels: chartData.map((data) => data.method.concat(" ", data.name)),
        datasets: [{
            data: chartData.map((data) => data.count),
            }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,    
    };

    return (
        <div className=' h-full'>
            <Pie data={data} options={options}/>
        </div>
    );
};

