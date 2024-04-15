'use client'
import { IoAnalytics, IoArrowBack } from "react-icons/io5"
import { CiExport } from "react-icons/ci"
import { useEffect, useState } from "react"
import { TiDelete } from "react-icons/ti"
import ChartOption from "./chartOption"
import { Datepicker, Tooltip } from 'flowbite-react';
import ChartComponent from './chart'
//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption'
import VisualizationOption from "../devices/sensors/visualizationOptions"
import { useServerIp } from "../backendIpContext"

interface sensorInfo {
    sensorId: Number,
    sensorTopic: string,
    retainedMesage: string,
    dateTimeRegistered: string,
}

interface analysisBoxProps {
    sensorInfo: sensorInfo
}

export interface payloadFromDatabase {
    message: string,
    topic: string,
    dateTime: any, //is object 
    //date
    //{year: 2024, month: 3, day: 27}
    //time 
    //{hour: 17, minute: 19, second: 22, nano: 270136000}
}

const hourArray = Array.from({ length: 24 }, (_, i) => i);
const minuteArray = Array.from({ length: 60 }, (_, i) => i);

export default function analysisBox(analysisBoxProps: analysisBoxProps) {
    const today = new Date();

    const { serverIp } = useServerIp();

    const [sensorDataFromDatabaseFetching, setSensorDataFromDatabaseFetching] = useState<payloadFromDatabase[]>([]);

    const [analyseModalOpen, setAnalyseModalOpen] = useState(false); //similar to sensors/monitorBox.tsx
    const [chartOptionOpen, setChartOptionOpen] = useState(false); //visualization Options (see sensor/monitorBox.tsx)
    const [chartOptionType, setChartOptionType] = useState('initialized'); //visualization Options
    const [chartParameter, setChartParameter] = useState(''); //sensor/monitorBox.tsx
    const [chartType, setChartType] = useState(''); //sensor/monitorBox.tsx
    const [chartValue, setChartValue] = useState<chartValue[]>([]); //sensor/monitorBox.tsx

    const [analyzeFrom, setAnalyzeFrom] = useState<Date>(); //user can analyze/export data from range
    const [analyzeTo, setAnalyzeTo] = useState<Date>();
    const [dateSelected, setDateSelected] = useState(false);

    const [fromHour, setFromHour] = useState<Number>();
    const [fromMinute, setFromMinute] = useState<Number>();
    const [toHour, setToHour] = useState<Number>();
    const [toMinute, setToMinute] = useState<Number>();

    const STORAGE_KEY = analysisBoxProps.sensorInfo.sensorId.toString().concat('analysisBox')

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
        setChartOptionOpen(false);
    }

    function onOverlayClick() {
        console.log("triggered this");

        setChartOptionOpen(false);
        setAnalyseModalOpen(false);
        setDateSelected(false);
    }

    function onBackArrowClick() {
        setChartOptionOpen(true);
    }

    function closeChartOptionsAndReturnData(chartValues: chartValue[], selectedParameters: string) {
        setChartOptionOpen(false);
        setAnalyseModalOpen(false);
        console.log('in monitorBox.tsx, chartValue = ', chartValues);
        console.log('in monitorBox.tsx, selectedParam (x-axis) = ', selectedParameters);
        setChartParameter(selectedParameters);
        setChartType(chartOptionType); //barChart, lineChart, number, pieChart, scatterChart, gaugeChart
        setChartValue(chartValues); //chartValues
    }

    function handleNextButtonClicked() {
        setDateSelected(true);
        setChartOptionOpen(true);
    }

    function convertToUnixTimestamp(date: Date, hour: Number, minute: Number) {
        const fullDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour.valueOf(), minute.valueOf()).getTime();
        return Math.floor(fullDate / 1000);
    }

    function exportToJSON() {
        const data = sensorDataFromDatabaseFetching;
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sensorData.json';
        a.click();
        URL.revokeObjectURL(url);
    }


    async function fetchSensorDataFromDatabase() { //fetch sensors from backend server
        try {

            const fromUnixTimestamp = convertToUnixTimestamp(analyzeFrom!, fromHour!, fromMinute!);
            const toUnixTimestamp = convertToUnixTimestamp(analyzeTo!, toHour!, toMinute!);
            console.log('api: ', serverIp+'/testMQTT/queryPayload?topic=' + analysisBoxProps.sensorInfo.sensorTopic + '&from=' + fromUnixTimestamp + '&to=' + toUnixTimestamp);

            const res = await fetch(serverIp+'/testMQTT/queryPayload?topic=' + analysisBoxProps.sensorInfo.sensorTopic + '&from=' + fromUnixTimestamp + '&to=' + toUnixTimestamp);
            const payload = await res.json();
            console.log('respond: ', payload);
            setSensorDataFromDatabaseFetching(payload);

        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        console.log('sensorDataFromDatabaseFetching: ', sensorDataFromDatabaseFetching);
    }
        , [sensorDataFromDatabaseFetching]);


    useEffect(() => {
        console.log(chartOptionOpen, 'is chartOptionOpen');
    }, [chartOptionOpen])

    useEffect(() => {
        console.log('analyzeOpen: ', analyseModalOpen);;

    }, [analyseModalOpen])

    useEffect(() => {
        if (fromHour !== undefined && fromMinute !== undefined && toHour !== undefined && toMinute !== undefined) {
            fetchSensorDataFromDatabase();
        }
    }, [fromHour, fromMinute, toHour, toMinute])



    return (
        <div className='flex flex-col shadow-lg h-[35rem] bg-white relative'>
            {analyseModalOpen &&
                <div id="modal-shadow-monitorBox" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-full z-20 " onClick={onOverlayClick}>
                    <div className="  bg-white shadow-xl rounded-xl text-black w-1/2 h-4/5 animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                        {!dateSelected ? <div className="flex flex-col h-full transition-transform">

                            <div id="title-and-close" className="flex justify-between text-xl m-3">

                                <div>Analyse Setting - <span className=" font-semibold text-blue-500">period selection</span></div>
                                <button onClick={onOverlayClick} className="text-2xl">
                                    <TiDelete />
                                </button>
                            </div>
                            <div className='border mx-3 border-gray-300 ' />
                            <div className="mt-2 mx-3 font-bold">Select analyzing period</div>
                            <div className="flex justify-between items-center">
                                <Datepicker className="my-3 mx-4"
                                    placeholder="From"
                                    defaultDate={today}
                                    minDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)}
                                    maxDate={today} title="analyse data from..."
                                    onSelectedDateChanged={(date) => {
                                        console.log('date: ', date);

                                        setAnalyzeFrom(date);
                                    }}
                                />
                                <div>to</div>
                                <Datepicker className="my-3 mx-4"
                                    placeholder="To"
                                    defaultDate={today}
                                    minDate={analyzeFrom ? analyzeFrom : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)}
                                    maxDate={today} title="analyse data to..."
                                    onSelectedDateChanged={(date) => {
                                        setAnalyzeTo(date);
                                    }}
                                />
                            </div>
                            {analyzeFrom && analyzeTo && (analyzeTo >= analyzeFrom ?
                                <div className="mt-2 mx-3 font-bold flex flex-col">
                                    <div className="mb-3">Select time range</div>
                                    <div id="select time" className="flex justify-between items-center">
                                        <div id="from time" className="flex items-center p-1 shadow-sm">
                                            <select name="hour" onChange={(e) => {
                                                setFromHour(Number(e.target.value))
                                            }}
                                                className="border-0">
                                                <option value="" >--</option>
                                                {hourArray.map((hour) => (
                                                    <option key={hour} value={hour}>{hour < 10 ? '0' : ''}{hour}</option>
                                                ))}
                                            </select>

                                            <div>:</div>
                                            <select name="minute" onChange={(e) => { setFromMinute(Number(e.target.value)) }}
                                                className="border-0">
                                                <option value="" >--</option>
                                                {minuteArray.map((minute) => (
                                                    <option key={minute} value={minute}>{minute < 10 ? '0' : ''}{minute}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="">to</div>

                                        <div id="to time" className="flex items-center p-1 shadow-sm">
                                            <select name="hour" onChange={(e) => { setToHour(Number(e.target.value)) }}
                                                className="border-0">
                                                <option value="" >--</option>
                                                {hourArray.map((hour) => (
                                                    <option key={hour} value={hour}>{hour < 10 ? '0' : ''}{hour}</option>
                                                ))}
                                            </select>

                                            <div>:</div>

                                            <select name="minute" onChange={(e) => { setToMinute(Number(e.target.value)) }}
                                                className="border-0">
                                                <option value="" >--</option>
                                                {minuteArray.map((minute) => (
                                                    <option key={minute} value={minute}>{minute < 10 ? '0' : ''}{minute}</option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>
                                    {fromHour != undefined && fromMinute != undefined && toHour != undefined && toMinute != undefined &&
                                        <div className="my-3">
                                            <div>Selected period:</div>
                                            <div>
                                                <span className=" font-normal">From:</span> {analyzeFrom.toLocaleDateString()} {String(fromHour).padStart(2, '0')}:{fromMinute.valueOf() < 10 ? '0' : ''}{String(fromMinute)}
                                            </div>
                                            <div>
                                                <span className=" font-normal">To:</span> {analyzeTo.toLocaleDateString()} {String(toHour).padStart(2, '0')}:{toMinute!.valueOf() < 10 ? '0' : ''}{String(toMinute)}
                                            </div>
                                        </div>

                                    }
                                    {
                                        fromHour != undefined && fromMinute != undefined && toHour != undefined && toMinute != undefined &&

                                        (new Date(analyzeFrom.getFullYear(),
                                            analyzeFrom.getMonth(),
                                            analyzeFrom.getDate(),
                                            fromHour.valueOf(),
                                            fromMinute.valueOf()).getTime() - new Date(analyzeTo.getFullYear(),
                                                analyzeTo.getMonth(),
                                                analyzeTo.getDate(),
                                                toHour.valueOf(),
                                                toMinute.valueOf()).getTime() < 0 ?
                                            sensorDataFromDatabaseFetching.length === 0 ?
                                                <div className=" self-center text-red-800">
                                                    No Match Data!
                                                </div>
                                                :
                                                <button className={`bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-400`}
                                                    onClick={() => { handleNextButtonClicked() }}
                                                >
                                                    Next
                                                </button>

                                            : <div className="self-center font-extrabold text-red-700">illegal date range!</div>)
                                    }
                                </div> :
                                <div className="font-extrabold text-red-700 self-center">illegal date range!</div>
                            )
                            }

                        </div> : chartOptionOpen ? <div className="flex flex-col h-full animate-fade-left animate-duration-200">

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

                                <VisualizationOption imageSrc={"/piechart.jpg"} parametersJSX={pieChartParameter} name={"Pie Chart"} onClick={openChartOptionsWithType} />

                                <VisualizationOption imageSrc={"/scatterchart.jpg"} parametersJSX={scatterChartParameter} name={"Scatter Chart"} onClick={openChartOptionsWithType} />

                            </div>

                        </div> :

                            <div className="flex flex-col h-full animate-fade-left animate-duration-200">

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
                                <ChartOption chartType={chartOptionType} payloads={sensorDataFromDatabaseFetching} closeChartOptionAndConstructChart={closeChartOptionsAndReturnData} />
                            </div>}


                    </div>
                </div>

            }
            <div className='flex justify-between mx-4 my-3'>
                <div className=' text-5xl'>{analysisBoxProps.sensorInfo.sensorTopic.split('sensor_data/')[1]}</div>
                <div className='flex gap-4'>
                    <button disabled={sensorDataFromDatabaseFetching.length === 0} className={` disabled:bg-slate-300 disabled:cursor-not-allowed  flex items-center gap-x-2 bg-purple-700 rounded-md px-3 py-2 active:bg-blue-600 hover:bg-purple-900 hover:rounded-xl cursor-pointer duration-500 text-white`}
                        onClick={() => exportToJSON()}>
                        <CiExport className='text-2xl' />
                        <span className=' font-semibold'>export data</span>
                    </button>
                    <button className='flex items-center gap-x-2 bg-blue-400 rounded-md px-3 py-2 active:bg-blue-600 hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500 text-white'
                        onClick={() => { setAnalyseModalOpen(true) }}>
                        <IoAnalytics className='text-2xl' />
                        <span className=' font-semibold'>analyse data</span>
                    </button>
                </div>

            </div>
            <div className='flex flex-col justify-between mx-4 font-mono'>
                <div className=''>topic: <span className='font-bold'>{analysisBoxProps.sensorInfo.sensorTopic}</span></div>
                <div className=''>time registered: <span className='font-bold'>{analysisBoxProps.sensorInfo.dateTimeRegistered.split('T')[0]} {analysisBoxProps.sensorInfo.dateTimeRegistered.split('T')[1].split('.')[0]}</span></div>
            </div>

            <div className='border my-2 border-gray-300 mx-4' />

            {chartType !== '' ?
                <div className='mx-5 my-1 flex-grow'>
                    <div className=" font-mono">payload period: {analyzeFrom?.toLocaleDateString()} {String(fromHour).padStart(2, '0')}:{fromMinute!.valueOf() < 10 ? '0' : ''}{String(fromMinute)} - {analyzeTo?.toLocaleDateString()} {String(toHour).padStart(2, '0')}:{toMinute!.valueOf() < 10 ? '0' : ''}{String(toMinute)} </div>
                    <ChartComponent type={chartType} parameters={chartParameter} data={sensorDataFromDatabaseFetching} chartValues={chartValue} sensorId={analysisBoxProps.sensorInfo.sensorId} />
                </div>
                :
                <div className='mx-5 my-1 flex-grow flex justify-center items-center'>
                    <div className='text-2xl font-semibold text-gray-400'>No visualization selected</div>
                </div>
            }

        </div>
    )
}