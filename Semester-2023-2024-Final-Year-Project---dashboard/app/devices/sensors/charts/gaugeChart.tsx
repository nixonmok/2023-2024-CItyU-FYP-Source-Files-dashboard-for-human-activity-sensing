'use client'
import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';

interface gaugeChartProps {
    sensorId: Number,
    receivedTime: EpochTimeStamp,
    neededData: string,
    parameters: string,
    chartValue: chartValue[],
}

interface scales {
    name: string,
    limit: number,
    color: string
}

export default function GaugeChart(gaugeChartProps: gaugeChartProps) {
    const colorGeneration = '#'
    const [chartData, setChartData] = useState<Number>(NaN) //!!! different chart interpret chartData differently !!!
    const [receivedTime, setReceivedTime] = useState<EpochTimeStamp>(gaugeChartProps.receivedTime)
    const [scales, setScales] = useState<scales[]>([])
    const [min, setMin] = useState<Number>(0)
    const [max, setMax] = useState<Number>(100)

    const STORAGE_KEY = gaugeChartProps.sensorId.toString().concat(gaugeChartProps.parameters, 'gauge', gaugeChartProps.chartValue.map((arrayElement) => arrayElement.value).join(""))

    useEffect(() => { //when chartProps is updated, which for example when other type of visualization is chosen, it will reset everything
        console.log("!!!!!!!!");
        const storedData = localStorage.getItem(STORAGE_KEY)
        console.log(storedData, "is stored data");
        console.log("storage key is", STORAGE_KEY);

        console.log("run the second useEffect");
        if (storedData !== null) {
            setChartData(JSON.parse(storedData).data)
            setReceivedTime(JSON.parse(storedData).receivedTime)
            setScales(JSON.parse(storedData).scales)
            setMin(JSON.parse(storedData).min)
            setMax(JSON.parse(storedData).max)
            console.log("data is restored", storedData)
            localStorage.removeItem(STORAGE_KEY)
        }
        else {
            setChartData(NaN)
            setScales([])
            console.log("gaugechart chartValue: ", gaugeChartProps.chartValue);
            
            gaugeChartProps.chartValue.map((arrayElement, index) => {
                if(index ===  0){
                    setMin(Number(arrayElement.value))
                }
                else if(index === gaugeChartProps.chartValue.length - 1){
                    setScales((prevScales) => {
                        return [...prevScales, { name: arrayElement.method, limit: Number(arrayElement.value), color: colorGeneration.concat(Math.floor(Math.random() * 16777215).toString(16)) }]
                    })
                    setMax(Number(arrayElement.value))
                }
                else{
                    setScales((prevScales) => {
                        return [...prevScales, { name: arrayElement.method, limit: Number(arrayElement.value), color: colorGeneration.concat(Math.floor(Math.random() * 16777215).toString(16)) }]
                    })
                }
                
            })
            
        }
        

    }, [gaugeChartProps.chartValue, gaugeChartProps.parameters])

    useEffect(() => {

        if (gaugeChartProps.neededData !== undefined && receivedTime !== gaugeChartProps.receivedTime) {
            const receivedData = JSON.parse(gaugeChartProps.neededData);
            console.log("received data: ", receivedData);

            let numberData;
            if (typeof receivedData['payload'] === 'object') {
                numberData = Number(receivedData['payload'][gaugeChartProps.parameters])
            }
            else{
                numberData = Number(receivedData[gaugeChartProps.parameters])
            }

            setChartData(numberData)
        }
        setReceivedTime(gaugeChartProps.receivedTime)
    }, [gaugeChartProps])

    useEffect(() => {

        const storedData = {
            data: chartData,
            receivedTime: gaugeChartProps.receivedTime,
            scales: scales,
            min: min,
            max: max
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
        console.log("run the update useEffect");

        console.log(JSON.stringify(storedData) + " is stored in local storage" + " with key: " + STORAGE_KEY);

    }
        , [chartData])

    useEffect(() => {
        console.log("scales: ", scales);
    }, [scales])

    const arc = {
        width: 0.2,
        padding: 0.005,
        cornerRadius: 1,
        subArcs: scales.map((scale) => {
            return {
                limit: scale.limit,
                color: scale.color,
                showTick: true,
                tooltip: {
                    text: scale.name
                }
            }
        })
    }

    const labels = {
        tickLabel: {
            valueConfig: {
                formatTextValue: (value: number) => {
                    return value.toString()
                }
              }
        },
        valueLabel: {
            matchColorWithArc: true,
            formatTextValue: (value: number) => {
                return value.toString()
            }
        },
        
    }

    return (
        <div className=' h-full flex items-center justify-center '>
            <GaugeComponent className='w-full h-full' type='semicircle' minValue={min as number} maxValue={max as number} arc={arc} value={chartData as number} pointer={{ type: "arrow", elastic: false, color: '#000000', }} labels={labels} />
        </div>
    )
        ;
};
