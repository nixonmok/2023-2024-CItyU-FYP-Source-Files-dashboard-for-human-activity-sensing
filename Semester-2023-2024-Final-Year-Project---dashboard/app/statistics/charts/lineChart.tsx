'use client'
import React, { use, useEffect, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-luxon';
import { Chart } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

//interface
import { payloadFromDatabase } from '../analysisBox';

interface lineChartProps {
    sensorId: Number,
    dataBaseData: payloadFromDatabase[],
    parameters: string,
}

ChartJS.register(...registerables);



export default function LineChart(lineChartProps: lineChartProps) {
    const [dataPoint, setDataPoint] = useState<{ x: Date, y: Number }[]>([])

    useEffect(() => {

        if (lineChartProps.dataBaseData.length !== 0) {
            setDataPoint([])
            for (let i = 0; i < lineChartProps.dataBaseData.length; ++i) {
                let message = lineChartProps.dataBaseData[i].message
                let messageTime = lineChartProps.dataBaseData[i].dateTime
                let { year, month, day } = messageTime.date;
                let { hour, minute, second, nano } = messageTime.time;

                // Create a JavaScript Date object
                let javascriptDate = new Date(year, month - 1, day, hour, minute, second, nano / 1000000);
                console.log("javascriptDate: ", javascriptDate);
                
                if (message[0] === '{') {
                    message = JSON.parse(message)[lineChartProps.parameters]
                }
                const shownData = {
                    x: javascriptDate,
                    y: Number(message)
                }
                setDataPoint(oldData => [...oldData, shownData])
            }
        }
    }, [lineChartProps.parameters])

    useEffect(() => {
        console.log("dataPoint: ", dataPoint);
    }, [dataPoint])


    ChartJS.register(...registerables);


    const data = {
        datasets: [
            {
                label: lineChartProps.parameters,
                data: dataPoint,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]

    };

    const options = { 
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    parser: 'yyyy-MM-dd HH:mm:ss', 
                    tooltipFormat: 'yyyy-MM-dd HH:mm', 
                    unit: 'second', 
                },
                title: {
                    display: true,
                    text: 'Time'
                },
            }
        }
        
    }

    return (
        <div className='h-[90%]'>
            <Line data={data} options={options} />
        </div>
    );
};