'use client'
import React from 'react'

interface sensorInfo {
    sensorId: Number,
    sensorTopic: string,
    retainedMessage: string,
    dateTimeRegistered: String,
}
//https://stackoverflow.com/questions/70489813/how-can-i-show-a-modal-using-an-animation-with-tailwind-and-react-js
//add modal animation later ^^^

interface sensorInfoProps extends sensorInfo {
    isExist: boolean
    closeModal: () => void
}

export default function detectedSensors(sensorInfoProps: sensorInfoProps) {

    async function addToSensorList(toBeAdded: sensorInfoProps) {
        const sensorInfo: sensorInfo = {
            sensorId: toBeAdded.sensorId,
            sensorTopic: toBeAdded.sensorTopic,
            retainedMessage: toBeAdded.retainedMessage,
            dateTimeRegistered: toBeAdded.dateTimeRegistered,
        }
        //after pressing, fetch("POST")
        console.log("print something");

        const jsonString = JSON.stringify(sensorInfo);
        console.log(jsonString);

        const res = await fetch('http://localhost:3000/api/sensorData', {
            method: "POST",
            body: JSON.stringify(sensorInfo),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to add sensor');
            //print error modal???
            return;
        }

        //close the modal
        sensorInfoProps.closeModal();
        //const resJson = await res.json();

    }

    return (

        <button className={`flex flex-col mb-5 w-full h-[35%] shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden 
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            disabled={sensorInfoProps.isExist}
            onClick={() => {
                addToSensorList(sensorInfoProps)
            }}>
            <div id='title and id' className='w-full flex justify-between mx-2'>
                <div className=' ml-1 text-xl'>{sensorInfoProps.sensorTopic.split('all_device/sensor_data/')[1]}</div>
                <div className='mt-1 mr-1 px-2 font-mono font-light'>sensor id: {sensorInfoProps.sensorId.toString()}</div>
            </div>
            <div id='border line' className=' border mx-2'></div>
            <div id='Retain message and registration date' className='w-full flex-grow mt-1 ml-1 flex'>
                <div className='font-normal font-mono text-xs w-3/5 h-full flex flex-col'>
                    <div className=' text-blue-500'>Retained message: </div>
                    <div className='mt-1 font-extrabold  break-all'> {sensorInfoProps.retainedMessage} </div>
                </div>
                <div className=' border ml-1 mr-1'></div>
                <div className='w-full flex flex-col font-light'>
                    <span className='font-mono text-xs text-green-900'>registered at: </span>
                    <span className='mt-2 font-mono text-xs font-bold'>date: {sensorInfoProps.dateTimeRegistered.split("T")[0].split(".")[0]}</span>
                    <span className='font-mono text-xs font-bold'>time: {sensorInfoProps.dateTimeRegistered.split("T")[1].split(".")[0]}</span>

                </div>
            </div>
        </button>
    )

}


