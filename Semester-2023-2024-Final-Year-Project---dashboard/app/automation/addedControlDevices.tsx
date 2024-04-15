import React from 'react'

//interface import
import { jsonDataType } from '@/app/automation/page';

//https://stackoverflow.com/questions/70489813/how-can-i-show-a-modal-using-an-animation-with-tailwind-and-react-js
//add modal animation later ^^^

interface controlDeviceInfoProps extends jsonDataType {
    closeModal: (chosenControlDevice: jsonDataType) => void
}

export default function addedControlDevices(controlDeviceInfoProps: controlDeviceInfoProps) {

    function chooseControlDevice(toBeAdded: controlDeviceInfoProps) {
        const controlDeviceInfo: jsonDataType = {
            sensorId: toBeAdded.sensorId,
            sensorTopic: toBeAdded.sensorTopic,
            retainedMessage: toBeAdded.retainedMessage,
            dateTimeRegistered: toBeAdded.dateTimeRegistered,
        }

        //close the modal
        controlDeviceInfoProps.closeModal(controlDeviceInfo);
        //const resJson = await res.json();

    }

    return (

        <button className="flex flex-col mb-5 p-2 w-full shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden"
            onClick={() => {
                chooseControlDevice(controlDeviceInfoProps)
            }}>
            <div id='title and id' className='w-full justify-between flex mx-2 '>
                <div className=' ml-1 text-xl'>{controlDeviceInfoProps.sensorTopic.split('all_device/control_device_publish/')[1]}</div>
                <div className=' px-2 mt-1 mr-1 font-mono font-light'>control device id: {controlDeviceInfoProps.sensorId.toString()}</div>
            </div>
            <div id='border line' className=' border mx-2'></div>
            <div id='Retain message and registration date' className='w-full flex-grow mt-1 ml-1 flex'>
                <div className=' font-normal font-mono text-xs w-3/5 h-full flex flex-col'>
                    <span className=' text-blue-500'>Retained message: </span>
                    <span className='mt-1 font-extrabold'> {controlDeviceInfoProps.retainedMessage} </span>
                </div>
                <div className=' border ml-1 mr-1'></div>
                <div className='w-full flex flex-col font-light'>
                    <span className='font-mono text-xs text-green-900'>registered at: </span>
                    <span className='mt-2 font-mono text-xs font-bold'>date: {controlDeviceInfoProps.dateTimeRegistered.split("T")[0].split(".")[0]}</span>
                    <span className='font-mono text-xs font-bold'>time: {controlDeviceInfoProps.dateTimeRegistered.split("T")[1].split(".")[0]}</span>

                </div>
            </div>
        </button>
    )

}


