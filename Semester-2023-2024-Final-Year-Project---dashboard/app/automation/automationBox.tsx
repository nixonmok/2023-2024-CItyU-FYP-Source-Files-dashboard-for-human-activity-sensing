'use client';
import { TiDelete } from "react-icons/ti";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoGraph } from 'react-icons/go';
import { log } from "console";
import { useEffect, useMemo, useState } from "react";
import { IoArrowBack } from "react-icons/io5";

//interface import
import { jsonDataType } from './page';

interface automationBoxProps {
    controlDeviceAutomation: controlDeviceAutomation,
    isEditing: boolean,
    deleteThisAutomationBox: () => void
}

interface controlDeviceAutomation {
    chosenDevice: jsonDataType,
    automationContent: string[],
    triggerValue: string
}

//if sensorData is empty, don't update the chart -> it means other sensor is selected
//- bar charts
//- line chart
//- just number (real time)
//- pie charts/donut chart
//- scatter plots
//- gauge charts

export default function automationBox(automationBoxProps: automationBoxProps) {
    //from page.tsx: websocket data (sensorData) keep coming in, and it will be updated to the chart
    const [open, setOpen] = useState(false); //for visualization setting button
    const operators = ['(', ')', 'AND', 'OR']


    function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        setOpen(false);
    }

    useEffect(() => {
        console.log('automationBoxProps', automationBoxProps);
    }, [automationBoxProps]);


    return (

        <div id='sensor box' className='bg-white shadow-lg flex flex-col relative p-3'>
            {open &&
                <div id="modal-shadow-monitorBox" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-full z-20 " onClick={onOverlayClick}>
                    <div className="  bg-white shadow-xl rounded-xl text-black w-1/2 h-4/5 animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                        fuck you mother
                    </div>
                </div>
            }
            {automationBoxProps.isEditing &&
                (<button id='delete button' className=' absolute text-4xl -top-4 -right-4 text-red-600 cursor-pointer animate-wiggle animate-infinite animate-duration-[400ms] z-40'
                    onClick={automationBoxProps.deleteThisAutomationBox}>
                    <TiDelete className='animate-fade animate-once animate-duration-200' />
                </button>
                )}

            <div id='sensor name, visualization button and list' className='flex justify-between mx-4 mt-3 items-center'>
                <div id='sensor name and visual choice' className='text-2xl '>
                    {automationBoxProps.controlDeviceAutomation.chosenDevice.sensorTopic.split('all_device/control_device_publish/')[1]}
                </div>

                <div className='flex gap-x-3'>
                    <button className='flex items-center gap-x-2 bg-blue-400 rounded-md px-3 py-2 active:bg-blue-600 hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500 text-white'
                        onClick={() => { setOpen(true) }}>
                        <GoGraph className='text-xl' />
                        <span className='flex-1 text-white font-semibold text-xs'>
                            edit
                        </span>
                    </button>

                    <button className='text-xl  hover:bg-gray-200 active:bg-gray-300 duration-500 px-2 py-2 cursor-pointer rounded-xl'>
                        <BsThreeDotsVertical />
                    </button>
                </div>

            </div>

            <div className='border my-3  border-gray-300 mx-4' />

            <div className='mx-5 my-1 flex gap-x-4 overflow-x-hidden hover:overflow-x-scroll'>
                {
                    automationBoxProps.controlDeviceAutomation.automationContent.map((content, index) => (
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
                    ))
                }

            </div>
            <div className='border my-3 border-gray-300 mx-4' />
            <div id='controlDevice value' className='mx-5 my-1 flex-grow flex gap-x-5'>
                <div className=' text-xl'>SET</div>
                <div className='font-mono text-xl text-blue-800'>{automationBoxProps.controlDeviceAutomation.chosenDevice.sensorTopic.split('all_device/control_device_publish/')[1]}</div>
                <div className=' text-xl'>TO</div>
                <div className='font-bold font-mono text-2xl text-blue-800'>{automationBoxProps.controlDeviceAutomation.triggerValue}</div>
            </div>
        </div>
    );
}
