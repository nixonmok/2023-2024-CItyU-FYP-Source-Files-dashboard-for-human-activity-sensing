'use client'
import React, { useEffect, useState } from 'react';

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';

interface numberChartProps {
    sensorId: Number,
    receivedTime: EpochTimeStamp,
    neededData: string,
    parameters: string,
    chartValue: chartValue[],
}

export default function numberChart(numberChartProps: numberChartProps) {
    const [chartData, setChartData] = useState<Number>(NaN) //!!! different chart interpret chartData differently !!!
    const [receivedTime, setReceivedTime] = useState<EpochTimeStamp>(numberChartProps.receivedTime)

    const STORAGE_KEY = numberChartProps.sensorId.toString().concat(numberChartProps.parameters, 'number', numberChartProps.chartValue.map((arrayElement) => arrayElement.value).join(""))

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
            setChartData(NaN)
        }


    }, [numberChartProps.chartValue, numberChartProps.parameters])

    useEffect(() => {

        if (numberChartProps.neededData !== undefined && receivedTime !== numberChartProps.receivedTime) {
            const receivedData = JSON.parse(numberChartProps.neededData);
            console.log("received data: ", receivedData);
            
            let numberData;
            if (typeof receivedData['payload'] === 'object') {
                console.log("payload: ", receivedData['payload'][numberChartProps.parameters]);
                
                if(receivedData['payload'][numberChartProps.parameters] === "TRUE" || receivedData['payload'][numberChartProps.parameters] === "OPEN"){
                    numberData = 1
                }
                else if(receivedData['payload'][numberChartProps.parameters] === "FALSE" || receivedData['payload'][numberChartProps.parameters] === "CLOSE"){
                    numberData = 0
                }
                else{
                    numberData = Number(receivedData['payload'][numberChartProps.parameters])
                }
            }
            else{
                if(receivedData[numberChartProps.parameters] === "TRUE" || receivedData[numberChartProps.parameters] === "OPEN"){
                    numberData = 1
                }
                else if(receivedData[numberChartProps.parameters] === "FALSE" || receivedData[numberChartProps.parameters] === "CLOSE"){
                    numberData = 0
                }
                else{
                    numberData = Number(receivedData[numberChartProps.parameters])

                }
            }


            //setChartData(numberData)

            setChartData(numberData)
        }
        setReceivedTime(numberChartProps.receivedTime)
    }, [numberChartProps])

    useEffect(() => {

        const storedData = {
            data: chartData,
            receivedTime: numberChartProps.receivedTime
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
        console.log("run the update useEffect");

        console.log(JSON.stringify(storedData) + " is stored in local storage" + " with key: " + STORAGE_KEY);

    }
        , [chartData])

    return (
        <div className=' h-full flex flex-col justify-center relative'>
            <div className=' absolute inset-0 text-2xl  '>Parameter: <span className='text-blue-500 font-semibold'>{numberChartProps.parameters}</span></div>
            <div className=' font-bold text-9xl self-center'>{String(chartData)}</div>
        </div>
    );
};
