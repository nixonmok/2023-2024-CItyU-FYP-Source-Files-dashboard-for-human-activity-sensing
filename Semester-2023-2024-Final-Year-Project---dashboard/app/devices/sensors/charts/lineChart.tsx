'use client'
import React, { use, useEffect, useState } from 'react';
import {Chart as ChartJS, registerables} from 'chart.js';
import { DateTime } from 'luxon';
import 'chartjs-adapter-luxon';
import {Chart} from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { StreamingPlugin, RealTimeScale } from "chartjs-plugin-streaming";

interface lineChartProps {
    sensorId: Number,
    receivedTime: EpochTimeStamp,
    neededData: string,
    parameters: string,
}



export default function LineChart(lineChartProps: lineChartProps) {
    const [receivedTime, setReceivedTime] = useState<EpochTimeStamp>(lineChartProps.receivedTime)
    const [dataPoint, setDataPoint] = useState<{x: DateTime, y: Number}[]>([])

    useEffect(() => {

        if (lineChartProps.neededData !== undefined && receivedTime !== lineChartProps.receivedTime) {
            const receivedData = JSON.parse(lineChartProps.neededData);
            console.log("received data: ", receivedData);

            var numberData;
            if (typeof receivedData['payload'] === 'object') {
                console.log("payload: ", receivedData['payload'][lineChartProps.parameters]);
                
                if(receivedData['payload'][lineChartProps.parameters] === "TRUE" || receivedData['payload'][lineChartProps.parameters] === "OPEN"){
                    numberData = 1
                }
                else if(receivedData['payload'][lineChartProps.parameters] === "FALSE" || receivedData['payload'][lineChartProps.parameters] === "CLOSE"){
                    numberData = 0
                }
                else{
                    numberData = Number(receivedData['payload'][lineChartProps.parameters])
                }
            }
            else{
                if(receivedData[lineChartProps.parameters] === "TRUE" || receivedData[lineChartProps.parameters] === "OPEN"){
                    numberData = 1
                }
                else if(receivedData[lineChartProps.parameters] === "FALSE" || receivedData[lineChartProps.parameters] === "CLOSE"){
                    numberData = 0
                }
                else{
                    numberData = Number(receivedData[lineChartProps.parameters])

                }
            }
            console.log("numberData: ", numberData);
            

            //setChartData(numberData)
            const shownData ={
                x: DateTime.now().toISO(),
                y: numberData
            }
            setDataPoint(oldData => [...oldData, shownData])
        }
        setReceivedTime(lineChartProps.receivedTime)
    }, [lineChartProps])


    ChartJS.register(StreamingPlugin, RealTimeScale, ...registerables);


    const data = {
        datasets: [
            {
                label: 'Real Time Data',
                data: dataPoint,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]

    };

    const options = { //real time update
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "realtime" as const,
                realtime: {
                    duration: 20000,
                    refresh: 1000,
                    delay: 2000,
                    pause: false,
                    frameRate: 30,
                    
            },
        }
    }
 
    } 

    return (
        <div className='h-full'>
            <Line data={data} options={options}/>
        </div>
    );
};