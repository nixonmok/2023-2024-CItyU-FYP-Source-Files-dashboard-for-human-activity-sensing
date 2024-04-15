'use client'
import { TiDelete } from "react-icons/ti";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoGraph } from 'react-icons/go';
import ChartComponent from '../sensors/chart';
import { log } from "console";
import { use, useEffect, useMemo, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { MdNetworkPing } from "react-icons/md";

//interface import
import { webSocketData } from "./page";
import { useServerIp } from "@/app/backendIpContext";

//controlDeviceData: {"QoS":"2","controlDevice":"controlDevice_data/controlDevice1","id":"4","title":"testWebSocket","message":"{\"payload\":\"testmsg\",\"timestamp\":1710740254}"}
interface MonitorBoxProps {
    sensorId: Number,
    sensorTopic: string,
    retainedMessage: string,
    dateTimeRegistered: string,
    sensorName: string,
    isEditing: boolean,
    sensorData: webSocketData,
    deleteThisMonitorBox: () => void
    automations: automationInfo[]
}

interface automationInfo {
    automationContent: string[],
    triggerValue: string,
    deviceId: number
}

interface chartValue {
    method: string,
    value: string
}
//if controlDeviceData is empty, don't update the chart -> it means other controlDevice is selected
//- bar charts
//- line chart
//- just number (real time)
//- pie charts/donut chart
//- scatter plots
//- gauge charts

export default function monitorBox(monitorBoxProps: MonitorBoxProps) {
    const {serverIp} = useServerIp();

    const operators = ['(', ')', 'AND', 'OR']
    //from page.tsx: websocket data (controlDeviceData) keep coming in, and it will be updated to the chart

    async function pingControlDevice() { //use backend publish api to ping control device
        //the control device will send back the message to the backend

        console.log(serverIp+`/testMQTT/publish?topic=all_device/control_device_subscribe${monitorBoxProps.sensorTopic.split('all_device/control_device_publish/')[1]}&msg=ping&qos=2`);

        const res = await fetch(serverIp+`/testMQTT/publish?topic=all_device\/control_device_subscribe\/${monitorBoxProps.sensorTopic.split('all_device/control_device_publish/')[1]}&msg=ping&qos=2`);
        if (!res.ok) {
            console.error('Failed to ping controlDevice');
            return;
        }

    }

    async function deleteThisControlDevice() {

        const res = await fetch('http://localhost:3000/api/controlData', {
            method: "DELETE",
            body: JSON.stringify({ controlDeviceId: monitorBoxProps.sensorId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to delete controlDevice');
            return;
        }

        monitorBoxProps.deleteThisMonitorBox();
        console.log(`controlDeviceID deleted: ${monitorBoxProps.sensorId}`);

    }

    useEffect(() => {
        console.log('monitorBoxProps', monitorBoxProps);
    }, [monitorBoxProps]);

    return (

        <div id='controlDevice box' className='bg-white shadow-lg flex flex-col h-[28rem] relative'>

            {monitorBoxProps.isEditing &&
                (<button id='delete button' className=' absolute text-4xl -top-4 -right-4 text-red-600 cursor-pointer animate-wiggle animate-infinite animate-duration-[400ms] z-40'
                    onClick={deleteThisControlDevice}>
                    <TiDelete className='animate-fade animate-once animate-duration-200' />
                </button>
                )}

            <div id='controlDevice name, visualization button and list' className='flex justify-between mx-4 my-3 items-center'>
                <div id='controlDevice name and visual choice' className='text-2xl '>
                    {monitorBoxProps.sensorTopic.split('all_device/control_device_publish/')[1]}
                </div>

                <div className='flex gap-x-3'>
                    <button className=" shadow-lg flex items-center bg-blue-600 text-white font-semibold gap-x-4 rounded-md px-4 py-2 hover:bg-blue-400 focus:bg-purple-700 focus:ring-4 focus:ring-purple-800  transition"
                        onClick={() => pingControlDevice()}>
                        <MdNetworkPing className="text-xl" />
                        <div >ping</div>
                    </button>
                    <button className='text-xl  hover:bg-gray-200 active:bg-gray-300 duration-500 px-2 py-2 cursor-pointer rounded-xl'>
                        <BsThreeDotsVertical />
                    </button>
                </div>

            </div>

            <div className='border my-3 border-gray-300 mx-4' />
            <div className='mx-5 my-1 flex-grow flex-col flex hover:overflow-x-scroll overflow-x-hidden'>
                <div className=" font-semibold text-xl">Automations</div>
                {monitorBoxProps.automations.length > 0 ? monitorBoxProps.automations.map((automation, index) => (
                    <div className=" border my-2 p-2 shadow-md rounded-lg">
                        <div className=" flex gap-x-5">
                            {automation.automationContent.map((content, index) => (
                                (operators.includes(content) ?
                                    <div id="added expression" className='bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex justify-center flex-col border border-gray-200 text-2xl'>
                                        {content}
                                    </div> :
                                    <div className=" relative bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex flex-col justify-center border border-gray-200">
                                        <div className="absolute inset-0 left-0 m-1 text-xs">sensor ID:{JSON.parse(content).sensorId} </div>
                                        <div id="added expression" className=' mt-3 text-xl text-blue-800'>
                                            {JSON.parse(content).key} {JSON.parse(content).operator} {JSON.parse(content).value}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="mt-3 text-2xl flex justify-center">
                            value = {automation.triggerValue}
                        </div>
                    </div>

                )) : <div className=" self-center">no automation</div>
                }

            </div>

        </div>
    );
}
