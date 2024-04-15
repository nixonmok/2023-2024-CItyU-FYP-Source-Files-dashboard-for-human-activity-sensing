'use client';
import { TiDelete } from "react-icons/ti";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoGraph } from 'react-icons/go';
import ChartComponent from './chart';
import { log } from "console";
import { useEffect, useMemo, useState } from "react";
import VisualizationOption from "./visualizationOptions";
import ChartOption from "./chartOption";
import { IoArrowBack } from "react-icons/io5";

//interface import
import { chartValue } from './barPieChartOption'
import { webSocketData } from "./page";

//sensorData: {"QoS":"2","sensor":"sensor_data/sensor1","id":"4","title":"testWebSocket","message":"{\"payload\":\"testmsg\",\"timestamp\":1710740254}"}
interface MonitorBoxProps {
    sensorId: Number,
    sensorTopic: string,
    retainedMessage: string,
    dateTimeRegistered: string,
    sensorName: string,
    isEditing: boolean,
    sensorData: webSocketData,
    deleteThisMonitorBox: () => void
}

//if sensorData is empty, don't update the chart -> it means other sensor is selected
//- bar charts
//- line chart
//- just number (real time)
//- pie charts/donut chart
//- scatter plots
//- gauge charts

export default function monitorBox(monitorBoxProps: MonitorBoxProps) {
    //from page.tsx: websocket data (sensorData) keep coming in, and it will be updated to the chart
    const [open, setOpen] = useState(false); //for visualization setting button
    const [chartType, setChartType] = useState('');
    const [chartParameter, setChartParameter] = useState('');
    const [chartValue, setChartValue] = useState<chartValue[]>([]);
    const [chartOptionOpen, setChartOptionOpen] = useState(false); //for visualization setting -> chart options
    const [chartOptionType, setChartOptionType] = useState('initialized'); //for visualization setting -> chart options

    const STORAGE_KEY = monitorBoxProps.sensorId.toString().concat('monitorBox')


    const gaugeChartParameter = <div id="parameters" className="flex flex-col">
        <div className=" font-semibold self-start ml-1">Parameters: </div>
        <div className=" self-center font-mono font-bold">1. Value</div>
    </div>
    const scatterChartParameter = <div id="scatterChartParameter" className="flex flex-col">
        <div className=" font-semibold self-start ml-1">Parameters: </div>
        <div className=" self-center font-mono font-bold">1. Variable 1</div>
        <div className=" self-center font-mono font-bold">2. Variable 2</div>
    </div>
    const pieChartParameter = <div id="pieChartParameter" className="flex flex-col">
        <div className=" font-semibold self-start ml-1">Parameters: </div>
        <div className=" self-center font-mono font-bold">1. Categories</div>
        <div className=" self-center font-mono font-bold">2. Value</div>
    </div>
    const lineChartParameter = <div id="lineChartParameter" className="flex flex-col">
        <div className=" font-semibold self-start ml-1">Parameters: </div>
        <div className=" self-center font-mono font-bold">1. x-axis</div>
        <div className=" self-center font-mono text-xs">(interval)</div>
        <div className=" self-center font-mono font-bold">2. y-axis</div>
    </div>
    const barChartParameter = <div id="barChartParameter" className="flex flex-col">
        <div className=" font-semibold self-start ml-1">Parameters: </div>
        <div className=" self-center font-mono font-bold">1. x-axis</div>
        <div className=" self-center font-mono text-xs">(categories)</div>
        <div className=" self-center font-mono font-bold">2. y-axis</div>
    </div>
    const numberParameter = <div id="numberParameter" className="flex flex-col">
        <div className=" font-semibold self-start ml-1">Parameters: </div>
        <div className=" self-center font-mono font-bold">1. Value</div>
    </div>

    function openChartOptionsWithType(type: string) {
        setChartOptionType(type);
        setChartOptionOpen(true);
    }

    function closeChartOptionsAndReturnData(chartValues: chartValue[], selectedParameters: string) {
        setChartOptionOpen(false);
        setOpen(false);
        console.log('in monitorBox.tsx, chartValue = ', chartValues);
        console.log('in monitorBox.tsx, selectedParam (x-axis) = ', selectedParameters);
        setChartParameter(selectedParameters);
        setChartType(chartOptionType); //barChart, lineChart, number, pieChart, scatterChart, gaugeChart
        setChartValue(chartValues); //chartValues
    }

    async function deleteThisSensor() {

        const res = await fetch('http://localhost:3000/api/sensorData', {
            method: "DELETE",
            body: JSON.stringify({ sensorId: monitorBoxProps.sensorId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to delete sensor');
            return;
        }

        monitorBoxProps.deleteThisMonitorBox();
        console.log(`sensorID deleted: ${monitorBoxProps.sensorId}`);

    }

    function onOverlayClick() {
        console.log(monitorBoxProps.sensorId, monitorBoxProps.sensorData, typeof (monitorBoxProps.sensorData));
        setChartOptionOpen(false);
        setOpen(false);
    }

    function onBackArrowClick() {
        setChartOptionOpen(false);
    }

    useEffect(() => {
        console.log("first useEffect is called");
        const localStorageSetting = localStorage.getItem(STORAGE_KEY)
        console.log("data is: ", localStorageSetting);

        if (localStorageSetting) {
            const localStorageSettingObj = JSON.parse(localStorageSetting)
            console.log("localStorageSettingObj is: ", localStorageSettingObj);
            setChartType(localStorageSettingObj.type)
            setChartParameter(localStorageSettingObj.parameters)
            setChartValue(localStorageSettingObj.chartValues)

            //empty the localstorage
            localStorage.removeItem(STORAGE_KEY)
        }
    }, [])

    useEffect(() => {
        console.log("second useEffect is called");
        const settingAndData = {
            type: chartType,
            parameters: chartParameter,
            chartValues: chartValue,
            sensorId: monitorBoxProps.sensorId,
            receivedTime: monitorBoxProps.sensorData.receivedTime
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settingAndData))
        console.log("settingAndData is updated and is: ", settingAndData);
        
    },[chartType, chartParameter, chartValue])

    return (

        <div id='sensor box' className='bg-white shadow-lg flex flex-col h-[28rem] relative'>
            {open &&
                <div id="modal-shadow-monitorBox" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-full z-20 " onClick={onOverlayClick}>
                    <div className="  bg-white shadow-xl rounded-xl text-black w-1/2 h-4/5 animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                        {!chartOptionOpen ? <div className="flex flex-col h-full">

                            <div id="title-and-close" className="flex justify-between text-xl m-3">

                                <span>Visualization setting</span>
                                <button onClick={onOverlayClick} className="text-2xl">
                                    <TiDelete />
                                </button>
                            </div>
                            <div className='border mx-3 border-gray-300 ' />
                            <div id="list-here" className="flex-grow m-3 overflow-hidden hover:overflow-y-scroll">

                                <VisualizationOption imageSrc={"/barchart.jpg"} parametersJSX={barChartParameter} name={"Bar Chart"} onClick={openChartOptionsWithType} />

                                <VisualizationOption imageSrc={"/linechart.jpg"} parametersJSX={lineChartParameter} name={"Line Chart"} onClick={openChartOptionsWithType} />

                                <VisualizationOption imageSrc={"/number.jpg"} parametersJSX={numberParameter} name={"Number"} onClick={openChartOptionsWithType} />

                                <VisualizationOption imageSrc={"/piechart.jpg"} parametersJSX={pieChartParameter} name={"Pie Chart"} onClick={openChartOptionsWithType} />

                                <VisualizationOption imageSrc={"/scatterchart.jpg"} parametersJSX={scatterChartParameter} name={"Scatter Chart"} onClick={openChartOptionsWithType} />

                                <VisualizationOption imageSrc={"/gaugechart.jpg"} parametersJSX={gaugeChartParameter} name={"Gauge Chart"} onClick={openChartOptionsWithType} />

                            </div>

                        </div> : <div className="flex flex-col h-full animate-fade-left animate-duration-200">

                            <div id="title-and-close-chart-option" className="flex justify-between text-xl m-3">
                                <button onClick={onBackArrowClick} className="text-2xl">
                                    <IoArrowBack />
                                </button>
                                <div>
                                    Setting Parameters -
                                    <span className=" font-semibold text-sky-500"> {chartOptionType}</span>
                                </div>

                                <button onClick={onOverlayClick} className="text-2xl">
                                    <TiDelete />
                                </button>
                            </div>
                            <div className='border mx-3 border-gray-300 ' />
                            <ChartOption chartType={chartOptionType} payload={monitorBoxProps.sensorData} closeChartOptionAndConstructChart={closeChartOptionsAndReturnData} />
                        </div>}


                    </div>
                </div>
            }
            {monitorBoxProps.isEditing &&
                (<button id='delete button' className=' absolute text-4xl -top-4 -right-4 text-red-600 cursor-pointer animate-wiggle animate-infinite animate-duration-[400ms] z-40'
                    onClick={deleteThisSensor}>
                    <TiDelete className='animate-fade animate-once animate-duration-200' />
                </button>
                )}

            <div id='sensor name, visualization button and list' className='flex justify-between mx-4 my-3 items-center'>
                <div id='sensor name and visual choice' className='text-2xl '>
                    {monitorBoxProps.sensorTopic.split('all_device/sensor_data/')[1]}
                </div>

                <div className='flex gap-x-3'>
                    <button className='flex items-center gap-x-2 bg-blue-400 rounded-md px-3 py-2 active:bg-blue-600 hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500 text-white'
                        onClick={() => { setOpen(true) }}>
                        <GoGraph className='text-xl' />
                        <span className='flex-1 text-white font-semibold text-xs'>
                            visualization
                        </span>
                    </button>

                    <button className='text-xl  hover:bg-gray-200 active:bg-gray-300 duration-500 px-2 py-2 cursor-pointer rounded-xl'>
                        <BsThreeDotsVertical />
                    </button>
                </div>

            </div>

            <div className='border my-3 border-gray-300 mx-4' />

            <div className='mx-5 my-1 flex-grow'>
                {chartType !== '' ?
                    <ChartComponent type={chartType} parameters={chartParameter} data={monitorBoxProps.sensorData.message} chartValues={chartValue} sensorId={monitorBoxProps.sensorId} receivedTime={monitorBoxProps.sensorData.receivedTime} />
                    :
                    <div className='flex justify-center items-center h-full'>
                        <div className='text-2xl font-semibold text-gray-400'>No visualization selected</div>
                    </div>
                }
            </div>
        </div>
    );
}
