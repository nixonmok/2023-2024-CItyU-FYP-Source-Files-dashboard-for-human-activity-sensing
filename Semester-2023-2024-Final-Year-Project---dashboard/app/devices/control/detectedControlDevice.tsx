import React from 'react'

interface controlDeviceInfo {
    sensorId: Number,
    sensorTopic: string,
    retainedMessage: string,
    dateTimeRegistered: String,
}
//https://stackoverflow.com/questions/70489813/how-can-i-show-a-modal-using-an-animation-with-tailwind-and-react-js
//add modal animation later ^^^

interface controlDeviceInfoProps extends controlDeviceInfo {
    isExist: boolean
    closeModal: () => void
}

export default function DetectedcontrolDevices(controlDeviceInfoProps: controlDeviceInfoProps) {

    async function addToControlDeviceList(toBeAdded: controlDeviceInfoProps) {
        const controlDeviceInfo: controlDeviceInfo = {
            sensorId: toBeAdded.sensorId,
            sensorTopic: toBeAdded.sensorTopic,
            retainedMessage: toBeAdded.retainedMessage,
            dateTimeRegistered: toBeAdded.dateTimeRegistered,
        }
        //after pressing, fetch("POST")
        console.log("print something");

        const jsonString = JSON.stringify(controlDeviceInfo);
        console.log(jsonString);

        const res = await fetch('http://localhost:3000/api/controlData', {
            method: "POST",
            body: JSON.stringify(controlDeviceInfo),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to add controlDevice');
            //print error modal???
            return;
        }

        //close the modal
        controlDeviceInfoProps.closeModal();
        //const resJson = await res.json();

    }

    return (

        <button className={`flex flex-col mb-5 w-full h-[35%] shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden 
        ${controlDeviceInfoProps.isExist ? 'opacity-50 cursor-not-allowed' : ' cursor-pointer'}`}
            onClick={() => {
                if (!controlDeviceInfoProps.isExist) { addToControlDeviceList(controlDeviceInfoProps) }
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
                <div className=' w-full flex flex-col font-light'>
                    <span className='font-mono text-xs text-green-900'>registered at: </span>
                    <span className='mt-2 font-mono text-xs font-bold'>date: {controlDeviceInfoProps.dateTimeRegistered.split("T")[0].split(".")[0]}</span>
                    <span className='font-mono text-xs font-bold'>time: {controlDeviceInfoProps.dateTimeRegistered.split("T")[1].split(".")[0]}</span>

                </div>
            </div>
        </button>
    )

}


