'use client'
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import { useState, useEffect } from 'react';

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';
import { payloadFromDatabase } from '../analysisBox';


interface pieChartProps {
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

export default function PieChart(pieChartProps: pieChartProps) {
    const colorGeneration = '#'
    const [chartData, setChartData] = useState<chartData[]>([]) //!!! different chart interpret chartData differently !!!
    const [color, setColor] = useState<string[]>([])
    const [canUpdate, setCanUpdate] = useState<boolean>(false)

    ChartJS.register(...registerables);

    useEffect(() => { //when chartProps is updated, which for example when other type of visualization is chosen, it will reset everything
        setChartData([])
        pieChartProps.chartValue.map((arrayElement) => {
            setChartData((prevChartData) => {
                return [...prevChartData, { name: arrayElement.value, method: arrayElement.method, count: 0 }]
            })
        })
        setCanUpdate(true)


    }, [pieChartProps.chartValue, pieChartProps.parameters])

    useEffect(() => { //when chartData is updated, print it
        console.log('in chart.tsx chartdata = ', chartData);
    }, [chartData])

    useEffect(() => { //when chartData is updated, print it
        // Now update the state once with the new array
        if (chartData.length !== 0 && canUpdate) { //if no this line, the whole compoenent will be not working
            console.log("chart data: ", chartData);



            const updatedChartData = chartData.map((data) => {
                let count = data.count
                for (let i = 0; i < pieChartProps.dataBaseData.length; ++i) {
                    let message: any = pieChartProps.dataBaseData[i].message
                    if (message[0] === '{') {
                        message = JSON.parse(message)[pieChartProps.parameters]
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
            data: chartData.map((data) => data.count),
            backgroundColor: color
        }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div className=' h-[90%]'>
            <Pie data={data} options={options} />
        </div>
    );
};

