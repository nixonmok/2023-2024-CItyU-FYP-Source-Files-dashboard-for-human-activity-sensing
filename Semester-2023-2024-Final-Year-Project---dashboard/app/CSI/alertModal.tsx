'use client'
import { MdClose } from "react-icons/md";
import sensorList from '../devices/sensors/assets/addedSensorList.json';
import { jsonDataType } from '@/app/automation/page';
import { useEffect, useState } from "react";

interface alertModalProps {
    open: boolean,
    closeModal: () => void,
    motionsDetection: detectionProb,
    closeAndSubmit: (alert: alert) => void,
    allLocations: string[]
}

interface detectionProb {
    classes: string[],
    prediction_proba: number[][],
    predictions: string[],
}

interface keyValuePair {
    key: string,
    value: string
}

interface chartValue {
    method: string,
    value: string
}

interface alert {
    sensorTopic: string,
    parameter: string,
    motion: string,
    chartValues: chartValue[],
    triggering: boolean
}

export default function alertModal(alertModalProps: alertModalProps) {
    const [chosenSensor, setChosenSensor] = useState<jsonDataType>()
    const [keyValuePair, setKeyValuePair] = useState<keyValuePair[]>([])
    const [parameter, setParameter] = useState<string>('')
    const [chartValues, setchartValues] = useState<chartValue[]>([]);
    const [method, setMethod] = useState<string>('');
    const [value, setValue] = useState<string>('');

    const [finalChartValues, setFinalChartValues] = useState<chartValue[]>([]);

    const [motionChosen, setMotionChosen] = useState<string>('')
    const [locationChosen, setLocationChosen] = useState<string>('')

    function finishSetting() {
        const alert: alert = {
            sensorTopic: chosenSensor?.sensorTopic as string,
            parameter: parameter,
            motion: motionChosen,
            location: locationChosen,
            chartValues: finalChartValues,
            triggering: false
        }
        setChosenSensor(undefined);
        setchartValues([]);
        setFinalChartValues([]);
        setParameter('');
        setChosenSensor(undefined);
        setKeyValuePair([]);
        setMotionChosen('');
        setLocationChosen('');
        alertModalProps.closeAndSubmit(alert);
    }

    const onOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { //close the modal and editing mode
        if ((e.target as HTMLDivElement).id === 'modal-shadow') {
            setChosenSensor(undefined);
            setchartValues([]);
            setFinalChartValues([]);
            setParameter('');
            setChosenSensor(undefined);
            setKeyValuePair([]);
            alertModalProps.closeModal()
        }
    };

    function handleSubmitButtonOnClick() {
        console.log("submit button clicked");
        setFinalChartValues(chartValues);
    }


    function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log("form submitted")
        // Add the new  value only if both method and value are set
        if (method && value) {
            setchartValues((prevState) => [...prevState, { method, value }]);
            // Optionally, reset method and value here if you want to clear the inputs after adding
            setMethod('');
            setValue('');
        } else {
            console.log("Method or value is missing");
        }
    }

    function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        // Add the new  value only if both method and value are set
        setParameter(e.target.value);

    }

    function handleDeleteButton(e: React.MouseEvent<HTMLButtonElement>, index: number) {
        e.preventDefault();
        const newChartValues = chartValues.filter((value, i) => i !== index);
        setchartValues(newChartValues);
    }

    useEffect(() => {
        if (chosenSensor?.retainedMessage !== undefined) {
            setKeyValuePair([]);
            //const jsonPayloadObject = JSON.parse(chartOptionProps.payload.message)
            const jsonPayload = JSON.parse(chosenSensor?.retainedMessage);
            //if the json object has inner json object, should parse it again
            console.log("jsonPayload: ", jsonPayload);
            if (typeof jsonPayload === 'object') {
                for (const key in jsonPayload) {
                    if (typeof jsonPayload[key] === 'object') {
                        for (const innerKey in jsonPayload[key]) {
                            console.log(innerKey, jsonPayload[key][innerKey]);
                            const newKeyValuePair = { key: innerKey, value: jsonPayload[key][innerKey] };
                            setKeyValuePair((prevState) => [...prevState, newKeyValuePair]);
                        }
                    }
                    else {
                        console.log(key, jsonPayload[key]);
                        const newKeyValuePair = { key: key, value: jsonPayload[key] };
                        setKeyValuePair((prevState) => [...prevState, newKeyValuePair]);
                    }
                }
            }
            else {
                const newKeyValuePair = { key: 'payload', value: jsonPayload };
                setKeyValuePair((prevState) => [...prevState, newKeyValuePair]);
            }
            console.log("final keyValuePair: ", keyValuePair);

        }
    }
        , [chosenSensor, chosenSensor !== undefined])


    return (
        alertModalProps.open &&
        <div id="modal-shadow" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-screen z-50 " onClick={onOverlayClick}>
            <div className=" bg-white shadow-xl rounded-xl text-black w-1/3 h-1/2 animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col h-full">
                    <div id="title-and-close" className="flex justify-between text-2xl m-4">
                        <span>Add Alert</span>
                        <button onClick={alertModalProps.closeModal} >
                            <MdClose />
                        </button>
                    </div>

                    <div className='border mx-4 border-gray-300 ' />

                    {!chosenSensor ?
                        <div id="list-here" className="flex-grow mx-5 my-2 overflow-hidden hover:overflow-y-scroll">
                            <div className=" text-xl">Chossing Sensor</div>
                            {sensorList.length === 0 ? (
                                <div>No sensor detected</div>
                            ) : (
                                sensorList.map((sensorInfo) => (
                                    <button className="flex flex-col mb-5 p-2 w-full shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden"
                                        onClick={() => { setChosenSensor(sensorInfo) }}>
                                        <div id='title and id' className='w-full justify-between flex mx-2 '>
                                            <div className=' ml-1 text-xl'>{sensorInfo.sensorTopic.split('all_device/sensor_data/')[1]}</div>
                                            <div className=' px-2 mt-1 mr-1 font-mono font-light'>control device id: {sensorInfo.sensorId.toString()}</div>
                                        </div>
                                        <div id='border line' className=' border mx-2'></div>
                                        <div id='Retain message and registration date' className='w-full flex-grow mt-1 ml-1 flex'>
                                            <div className=' font-normal font-mono text-xs w-3/5 h-full flex flex-col'>
                                                <span className=' text-blue-500'>Retained message: </span>
                                                <span className='mt-1 font-extrabold break-all'> {sensorInfo.retainedMessage} </span>
                                            </div>
                                            <div className=' border ml-1 mr-1'></div>
                                            <div className='w-full flex flex-col font-light'>
                                                <span className='font-mono text-xs text-green-900'>registered at: </span>
                                                <span className='mt-2 font-mono text-xs font-bold'>date: {sensorInfo.dateTimeRegistered.split("T")[0].split(".")[0]}</span>
                                                <span className='font-mono text-xs font-bold'>time: {sensorInfo.dateTimeRegistered.split("T")[1].split(".")[0]}</span>

                                            </div>
                                        </div>
                                    </button>

                                ))
                            )}
                        </div>
                        :
                        finalChartValues.length === 0 ?
                            <div className=" flex flex-col w-full p-5 overflow-hidden hover:overflow-y-scroll">
                                <div className=" text-xl font-mono font-bold">payload</div>
                                <table className=" table-auto shadow-md w-full border-collapse overflow-hidden rounded-lg text-center my-3">
                                    <thead className=" font-mono uppercase bg-gray-100 rounded-xl">
                                        <tr className="">
                                            <th className="py-2">Key</th>
                                            <th className="">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {keyValuePair.map((pair) => {
                                            return (
                                                <tr className=" even:bg-gray-100 ">
                                                    <td className=" py-2 ">{pair.key}</td>
                                                    <td className=" py-2 ">{pair.value}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                <div id='border line' className=' border mx-2 my-2'></div>

                                <form className="flex flex-col gap-y-2" onSubmit={(e) => handleFormSubmit(e)}>
                                    <label className=" text-lg uppercase font-bold">Choose parameter</label>

                                    <div className="relatve flex text-center">
                                        <select id="valueChosen" name="valueChosen"
                                            className=" disabled: self-center focus:bg-white pl-3 focus:border-gray-500 block my-2 text-gray-500 bg-gray-200 border border-gray-200 leading-8 appearance-none rounded-md w-full h-10"
                                            onChange={(e) => { handleSelectChange(e) }}>

                                            <option value="" >Select parameter</option>
                                            {keyValuePair.map((pair) => {
                                                return (
                                                    <option value={pair.key} >{pair.key}</option>
                                                )
                                            })
                                            }
                                        </select>
                                    </div>

                                    {parameter.localeCompare('') !== 0 &&
                                        <>
                                            <label className=" text-lg uppercase font-bold my-4">add Value</label>
                                            <div className='flex h-10 gap-3 '>
                                                <select id="recordMethod" name="recordMethod" className=" h-10  focus:bg-white pl-3 focus:border-gray-500 block  text-gray-500 bg-gray-200 border border-gray-200 leading-8 appearance-none rounded-md w-[20%]"
                                                    required
                                                    onChange={(e) => setMethod(e.target.value)}
                                                    disabled={chartValues.length > 0}>
                                                    <option value="" ></option>
                                                    <option value="&gt;" >&gt;</option>
                                                    <option value="&ge;" >&ge;</option>
                                                    <option value="&lt;" >&lt;</option>
                                                    <option value="&le;" >&le;</option>
                                                    <option value="=" >=</option>
                                                    <option value="≠" >≠</option>
                                                </select>
                                                <input id='recordValue' type="text" className=" border-0 border-b-2  border-gray-200  w-[75%] focus:ring-0 focus:border-blue-500 focus:outline-0" placeholder="Value" required
                                                    onChange={(e) => setValue(e.target.value)}
                                                    disabled={chartValues.length > 0} />
                                            </div>
                                            <div className="mt-1">
                                                <button type="submit" id="first-add-button" className={`${chartValues.length > 0 ? 'hidden' : ''} bg-green-400 text-white rounded-md self-center py-[3px] px-3`}
                                                >Add</button>
                                            </div>
                                            {chartValues.map((value, index) => {
                                                return (
                                                    <div key={index}>
                                                        <div className="flex h-10 gap-3 mt-1">
                                                            <select id="recordMethod" name="recordMethod" className=" disabled: self-center focus:bg-white pl-3 focus:border-gray-500 block  text-gray-500 bg-gray-200 border border-gray-200 leading-8 appearance-none rounded-md w-[20%]"
                                                                onChange={(e) => setMethod(e.target.value)}
                                                                disabled={chartValues.length - 1 !== index}
                                                                required>
                                                                <option value="" ></option>
                                                                <option value="&gt;" >&gt;</option>
                                                                <option value="&ge;" >&ge;</option>
                                                                <option value="&lt;" >&lt;</option>
                                                                <option value="&le;" >&le;</option>
                                                                <option value="=" >=</option>
                                                                <option value="≠" >≠</option>
                                                            </select>
                                                            <input type="text" className=" border-0 border-b-2   border-gray-200  w-[75%] focus:ring-0 focus:border-blue-500 focus:outline-0" placeholder="Value" required
                                                                onChange={(e) => setValue(e.target.value)}
                                                                disabled={chartValues.length - 1 !== index} />
                                                        </div>
                                                        {index === chartValues.length - 1 &&
                                                            <div className="flex mt-4 gap-2">
                                                                <button type="submit" id="add-button" className="bg-green-400 text-white rounded-md self-center py-[3px] px-3"
                                                                >Add</button>
                                                                <button id="delete-button" className="bg-red-400 text-white rounded-md self-center py-[3px] px-3"
                                                                    onClick={(e) => {
                                                                        handleDeleteButton(e, index);
                                                                    }
                                                                    }>Delete</button>
                                                            </div>
                                                        }
                                                        <div />

                                                    </div>)

                                            }

                                            )}

                                            <button type="button" id="submit-button" className={`${chartValues.length > 0 ? '' : 'hidden'}  bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800`}
                                                onClick={() => handleSubmitButtonOnClick()}>Submit</button>
                                        </>}


                                </form>

                            </div>
                            :
                            <div id="choose-motion" className="flex-grow mx-5 my-2 overflow-hidden hover:overflow-y-scroll">
                                <div className=" text-xl my-2">Choose Motion</div>
                                <div className="flex flex-wrap gap-3">
                                    {alertModalProps.motionsDetection?.classes.map((motion, index) => (
                                        <button className={`m-5 p-2 shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden ${motionChosen === motion ? 'ring-2 ring-blue-200' : ''}`}
                                            onClick={() => { setMotionChosen(motion) }}>
                                            <div id='title and id' className='mx-2'>
                                                <div className=' ml-1 text-xl'>{motion}</div>
                                            </div>
                                        </button>
                                    )
                                    )
                                    }
                                </div>
                                <div id='border line' className=' border mx-2'></div>
                                <div className=" text-xl my-2">Choose Location</div>
                                <div className="flex flex-wrap gap-3">
                                    {
                                        alertModalProps.allLocations.map((location, index) => (
                                            <button className={`m-5 p-2 shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden ${locationChosen === location ? 'ring-2 ring-blue-200' : ''}`}
                                                onClick={() => { setLocationChosen(location) }}>
                                                <div id='title and id' className='mx-2'>
                                                    <div className=' ml-1 text-xl'>{location}</div>
                                                </div>
                                            </button>
                                        )
                                        )
                                    }
                                </div>
                                <button className={`${motionChosen && locationChosen ? '' : 'hidden'}  bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800 w-full`}
                                                onClick={() => {finishSetting()}}>Submit</button>
                            </div>
                    }




                </div>
            </div>
        </div>

    )
}