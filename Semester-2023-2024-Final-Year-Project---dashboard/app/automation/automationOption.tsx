'use client'
import React, { use, useEffect } from 'react'
import sensorList from '../devices/sensors/assets/addedSensorList.json';
import { MdClose } from 'react-icons/md';
import { FloatingLabel } from "flowbite-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

//interface import
import { jsonDataType } from '@/app/automation/page';



interface automationOptionProps {
    chosenDevice: jsonDataType,
    closeAutomationOptionAndAddAutomation: (controlDeviceValue: controlDeviceValue) => void
}

interface keyValuePair {
    sensorId: number,
    key: string,
    value: string
}

interface automationContent {
    sensorId: number,
    key: string,
    operator: string,
    value: string
}

interface automationContentWithId extends automationContent {
    conditionId: number
}

interface controlDeviceValue {
    chosenDevice: jsonDataType,
    automationContent: string[],
    triggerValue: string
}

export default function automationOption(automationOptionProps: automationOptionProps) {
    const [sensorKeyValuePair, setSensorKeyValuePairs] = React.useState<keyValuePair[]>([]); //key value pair of the selected sensor
    const [automationContent, setAutomationContent] = React.useState<automationContent[]>([]); //array of automation content
    const [automationContentForDraggable, setAutomationContentForDraggable] = React.useState<automationContentWithId[]>([]); //array of automation content for draggable
    const [finalExpression, setFinalExpression] = React.useState<string[]>([]); //postfix expression of the automation content
    const [selectedOperator, setSelectedOperator] = React.useState<string>(''); //selected operator
    const [selectedKey, setSelectedKey] = React.useState<string>(''); //selected key
    const [selectedValue, setSelectedValue] = React.useState<string>(''); //selected value
    const [selectedSensorId, setSelectedSensorId] = React.useState<number>(NaN);

    const [finishedConditionSetting, setFinishedConditionSetting] = React.useState<boolean>(false);
    const [isValidFinalExpression, setrIsValidFinalExpression] = React.useState<boolean>(false);
    const [triggerValue, setTriggerValue] = React.useState<string>(''); //
    //the automation will follow the array order
    //e.g: IF x == 1 AND y ==1 THEN z == 1
    //selectedSensors = [x, y] where z is control device (chosenDevice)
    const operators = ['(', ')', 'AND', 'OR']

    function onDragEnd(event: any) {
        const { source, destination } = event;

        if (!destination) {
            return;
        }

        if (source.droppableId === 'conditions' && destination.droppableId === 'finalExpression') {
            const newAutomationContent = [...automationContentForDraggable];
            const [conditionToMove] = newAutomationContent.splice(source.index, 1);
            console.log("source condition", conditionToMove);
            console.log("automation content", newAutomationContent);
            //stringify the condition
            const jsonString = JSON.stringify(conditionToMove);
            console.log("json string", jsonString);

            // Create a new array instead of directly mutating the state
            const newExpression = [...finalExpression];
            newExpression.splice(destination.index, 0, jsonString);
            setFinalExpression(newExpression);
            setAutomationContentForDraggable(newAutomationContent);
        }
        else if (source.droppableId === 'bracket, AND and OR draggables' && destination.droppableId === 'finalExpression') {
            console.log("from operator to final expression");
            const selectedOperator = operators[source.index];
            console.log("selected operator", selectedOperator);
            const newExpression = [...finalExpression];
            newExpression.splice(destination.index, 0, selectedOperator);
            setFinalExpression(newExpression);

        }
        else if (source.droppableId === 'finalExpression' && destination.droppableId === 'finalExpression') {
            console.log("reorder");
            const toMove = finalExpression[source.index];
            const reorderedExpression = [...finalExpression];
            reorderedExpression.splice(source.index, 1);
            reorderedExpression.splice(destination.index, 0, toMove);
            setFinalExpression(reorderedExpression);
        }
        else if (source.droppableId === 'finalExpression') {
            if (operators.includes(finalExpression[source.index])) {
                //remove the operator
                const newExpression = [...finalExpression];
                newExpression.splice(source.index, 1);
                setFinalExpression(newExpression);
            }
            else {
                //remove condition and add back to conditions
                const newExpression = [...finalExpression];
                const [conditionToMove] = newExpression.splice(source.index, 1);
                setFinalExpression(newExpression);
                const newAutomationContent = [...automationContentForDraggable];
                newAutomationContent.push(JSON.parse(conditionToMove));
                setAutomationContentForDraggable(newAutomationContent);

            }
            console.log(source.index, finalExpression[source.index]);

        }


        console.log("final expression", finalExpression);

    }


    function checkIfValidFinalExpression() {
        const stack = [];
        let prevContent = '';
        console.log(finalExpression);

        for (const content of finalExpression) {
            if (operators.includes(content)) {
                if (content === '(') {
                    if (prevContent === 'AND' || prevContent === 'OR' || prevContent === ')' || content === finalExpression[finalExpression.length - 1]) {
                        setrIsValidFinalExpression(false);
                        return;
                    }
                    stack.push(content);
                } else if (content === ')') {
                    if (stack.length === 0 || prevContent === '(') {
                        setrIsValidFinalExpression(false);
                        return;
                    }
                    stack.pop();
                } 
                else if (content === 'AND' || content === 'OR') {
                    if (prevContent === 'AND' || prevContent === 'OR' || prevContent === '(' || prevContent === '') {
                        setrIsValidFinalExpression(false);
                        return;
                    }
                    //AND OR is last element
                    else if (content === finalExpression[finalExpression.length - 1]) {
                        setrIsValidFinalExpression(false);
                        return;
                    }

                }
                
            }
            else{
                if (prevContent[0] === '{' || prevContent === ')') {
                    setrIsValidFinalExpression(false);
                    return;
                }
            }
            console.log(prevContent);
            prevContent = content;
        }
        if (stack.length === 0) {
            setrIsValidFinalExpression(true);
        }
        else {
            setrIsValidFinalExpression(false);
        }
    }

    function handleFormSubmit(e: React.FormEvent<HTMLFormElement>, conditionId: number) {


        console.log("form submitted");
        e.preventDefault(); // Prevent the default form submit action
        //settingProps.closeChartOptionAndConstructChart([{method: selectedXAxis, value: selectedXAxis}], selectedXAxis);
        if (selectedValue != '') {
            setAutomationContent([...automationContent, { sensorId: selectedSensorId, key: selectedKey, operator: selectedOperator, value: selectedValue }]);
            setAutomationContentForDraggable([...automationContentForDraggable, { sensorId: selectedSensorId, key: selectedKey, operator: selectedOperator, value: selectedValue, conditionId: conditionId }]);
            console.log("automation content", automationContent);
            setSelectedKey('');
            setSelectedOperator('');
            setSelectedValue('');
            setSelectedSensorId(NaN);
        }

    }

    function handleDeleteButton(e: React.MouseEvent<HTMLButtonElement>, index: number) {
        console.log("delete button clicked");
        e.preventDefault(); // Prevent the default form submit action
        //settingProps.closeChartOptionAndConstructChart([{method: selectedXAxis, value: selectedXAxis}], selectedXAxis);
        const newAutomationContent = [...automationContent];
        const newAutomationContentForDraggable = [...automationContentForDraggable];
        newAutomationContent.splice(index, 1);
        setAutomationContent(newAutomationContent);
        setAutomationContentForDraggable(newAutomationContentForDraggable);
        console.log("automation content", automationContent);
    }

    function handleSubmitButtonOnClick() {
        setFinishedConditionSetting(true);
    }

    function handleFinishSettingFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        console.log("form submitted");
        e.preventDefault(); // Prevent the default form submit action
        const controlDeviceValue: controlDeviceValue = {
            chosenDevice: automationOptionProps.chosenDevice,
            automationContent: finalExpression,
            triggerValue: triggerValue
        }

        automationOptionProps.closeAutomationOptionAndAddAutomation(controlDeviceValue);
    }

    useEffect(() => {
        setSensorKeyValuePairs([]); // Clear the array

        sensorList.forEach((sensor) => { // Use forEach instead of map when not returning anything
            if (sensor.retainedMessage[0] === '{') {
                const parsedJSON = JSON.parse(sensor.retainedMessage);
                console.log("parsed JSON", parsedJSON);

                for (const key in parsedJSON) {
                    setSensorKeyValuePairs((prevState) => [
                        ...prevState,
                        { sensorId: sensor.sensorId, key: key, value: parsedJSON[key] }
                    ]);
                }
            } else {
                setSensorKeyValuePairs((prevState) => [
                    ...prevState,
                    { sensorId: sensor.sensorId, key: 'payload', value: sensor.retainedMessage }
                ]);
            }


        });
    }, [sensorList]); // Make sure to include sensorList in the dependency array

    useEffect(() => {
        console.log('check');

        checkIfValidFinalExpression();
    }
        , [finalExpression])

    useEffect(() => {
        console.log(" sensor key value", sensorKeyValuePair);
    }, [sensorKeyValuePair])

    useEffect(() => {
        console.log("automation content", automationContent);
    }
        , [automationContent])

    useEffect(() => {
        console.log("selected sensor id", selectedSensorId);
    }
        , [selectedSensorId])


    return (

        <div className='flex flex-col gap-y-3 animate-fade-left animate-duration-200'>
            <div id='chosen device info' className='bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex flex-col'>
                <div id='name and id' className='flex justify-between'>
                    <div>
                        <span className=' font-normal'>Devvice name:</span> <span className=' font-mono'>{automationOptionProps.chosenDevice.sensorTopic.split('all_device/control_device_publish/')[1]}</span>
                    </div>
                    <div>
                        <span className=' font-normal'>device ID:</span> <span className=' font-mono'>{automationOptionProps.chosenDevice.sensorId}</span>
                    </div>
                </div>
                <div id='retained message and registered date'>
                    <div>
                        <span className=' font-normal'>Retained message:</span> <span className=' font-mono'>{automationOptionProps.chosenDevice.retainedMessage}</span>
                    </div>
                    <div>
                        <span className=' font-normal'>Registered at:</span> <span className=' font-mono'>{automationOptionProps.chosenDevice.dateTimeRegistered.split('T')[0]} {automationOptionProps.chosenDevice.dateTimeRegistered.split('T')[1]}</span>
                    </div>
                </div>
            </div>
            <div className='border border-gray-300 ' />


            {automationContent.map((content, index) => (
                <div id="added condition" className='bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex flex-col  border border-gray-200 '>
                    <div className=' text-blue-600'>Conidition {index + 1}</div>
                    <div id='condition' className='flex justify-between items-center'>
                        <div>
                            <div className=' font-bold font-mono text-2xl '>IF</div>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className=' font-extralight font-mono text-xs'>sensorId</div>
                            <span className='font-mono text-xl text-blue-800'>{content.sensorId}</span>
                        </div>
                        <div>
                            <div className=' font-bold font-mono text-2xl '>'s</div>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className=' font-extralight font-mono text-xs'>key</div>
                            <span className='font-mono text-xl text-blue-800'>{content.key}</span>
                        </div>
                        <div className='flex flex-col items-center'>
                            <span className='font-bold font-mono text-2xl text-blue-800'>{content.operator}</span>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className=' font-extralight font-mono text-xs'>value</div>
                            <span className='font-mono text-xl text-blue-800'>{content.value}</span>
                        </div>
                    </div>
                </div>
            ))}


            <div className='border border-gray-300 ' />

            {automationContent.length === 0 ?
                <div className=' flex flex-col overflow-hidden hover:overflow-y-scroll h-[50%] px-2'>
                    <div className=' self-center text-xl font-mono font-normal mb-3'><span className=' font-extrabold font'>IF</span> - condition setting</div>
                    <div className='animate-fade-down mb-2 text-lg'>STEP 1: Choosing Sensor</div>
                    {sensorList.map((sensor: jsonDataType) => (
                        <button className={`flex flex-col mb-5 w-full h-[30%] shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden transition animate-fade-down
                    ${!isNaN(selectedSensorId) ? (sensor.sensorId === selectedSensorId ? 'ring-2 ring-blue-200' : 'opacity-50') : ''}`}
                            onClick={() => {
                                setSelectedSensorId(sensor.sensorId);
                            }}>
                            <div id='title and id' className='flex justify-between mx-2'>
                                <div className=' ml-1 text-xl'>{sensor.sensorTopic.split('all_device/sensor_data/')[1]}</div>
                                <div className='mt-1 mr-1 font-mono font-light'>sensor id: {sensor.sensorId.toString()}</div>
                            </div>
                            <div id='border line' className=' border mx-2'></div>
                            <div id='Retain message and registration date' className='flex-grow mt-1 ml-1 flex'>
                                <div className='font-normal font-mono text-xs w-3/5 h-full flex flex-col'>
                                    <span className=' text-blue-500'>Retained message: </span>
                                    <span className='mt-1 font-extrabold break-all'> {sensor.retainedMessage} </span>
                                </div>
                                <div className=' border ml-1 mr-1'></div>
                                <div className='flex flex-col font-light'>
                                    <span className='font-mono text-xs text-green-900'>registered at: </span>
                                    <span className='mt-2 font-mono text-xs font-bold'>date: {sensor.dateTimeRegistered.split("T")[0].split(".")[0]}</span>
                                    <span className='font-mono text-xs font-bold'>time: {sensor.dateTimeRegistered.split("T")[1].split(".")[0]}</span>

                                </div>
                            </div>
                        </button>
                    ))}
                    {!isNaN(selectedSensorId) && <div id='setting condition' className='animate-fade-down'>
                        <table className=" table-auto shadow-md w-full border-collapse overflow-hidden rounded-lg text-center my-3">
                            <thead className=" font-mono uppercase bg-gray-100 rounded-xl">
                                <tr className="">
                                    <th className="py-2">Key</th>
                                    <th className="">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sensorKeyValuePair.filter((sensor) => sensor.sensorId === selectedSensorId).map((sensor) => (
                                    <tr className="">
                                        <td className="py-2">{sensor.key}</td>
                                        <td className="font-normal">{sensor.value}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>

                        <form className="flex flex-col mt-5" onSubmit={(e) => handleFormSubmit(e, 1)}>
                            <label className=" text-lg uppercase font-bold">STEP 2: Adding condition</label>
                            <div className='relative flex text-center justify-between items-center '>
                                <div className='flex flex-col '>
                                    <label className=' text-xs font-normal'>KEY</label>
                                    <select id='condition' className='bg-gray-50 border border-gray-300 text-gray-900  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2' required
                                        onChange={(e) => { setSelectedKey(e.target.value) }}>
                                        <option value="" className='' >Select key</option>
                                        {
                                            sensorKeyValuePair.filter((sensor) => sensor.sensorId === selectedSensorId).map((sensor) => (
                                                <option value={sensor.key} className=''>{sensor.key}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className='flex flex-col '>
                                    <label className=' text-xs font-normal'>OPERATOR</label>
                                    <select id='operator' className='bg-gray-50 border border-gray-300 text-gray-900  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2'
                                        required
                                        onChange={(e) => { setSelectedOperator(e.target.value) }}>
                                        <option value="" className='' >--</option>
                                        <option value="=" className=''>=</option>
                                        <option value="≠" className=''>≠</option>
                                        <option value="&gt;" className=''>&gt;</option>
                                        <option value="&ge;" className=''>&ge;</option>
                                        <option value="&lt;" className=''>&lt;</option>
                                        <option value="&le;" className=''>&le;</option>
                                    </select>
                                </div>
                                <FloatingLabel variant="outlined" label="Value"
                                    required
                                    onChange={(e) => { setSelectedValue(e.target.value) }} />
                            </div>
                            <div className="mt-3">
                                <button type="submit" id="first-add-button" className={`${automationContent.length > 0 ? 'hidden' : ''} bg-green-400 text-white rounded-md self-center py-[3px] px-3`}
                                >Add</button>
                            </div>
                        </form>
                    </div>}


                </div> : (automationContent.map((content, index) => (
                    <div className={`flex flex-col overflow-hidden hover:overflow-y-scroll h-[50%] px-2 ${index === automationContent.length - 1 && !finishedConditionSetting ? '' : 'hidden'}`} >
                        <div className=' self-center text-xl font-mono font-normal mb-3'><span className=' font-extrabold font'>IF</span> - condition setting</div>
                        <div className='animate-fade-down mb-2 text-lg'>STEP 1: Choosing Sensor</div>
                        {sensorList.map((sensor: jsonDataType) => (
                            <button className={`flex flex-col mb-5 w-full h-[30%] shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden transition animate-fade-down
                        ${!isNaN(selectedSensorId) ? (sensor.sensorId === selectedSensorId ? 'ring-2 ring-blue-200' : 'opacity-50') : ''}`}
                                onClick={() => {
                                    setSelectedSensorId(sensor.sensorId);
                                }}>
                                <div id='title and id' className='flex justify-between mx-2'>
                                    <div className=' ml-1 text-xl'>{sensor.sensorTopic.split('all_device/sensor_data/')[1]}</div>
                                    <div className='mt-1 mr-1 font-mono font-light'>sensor id: {sensor.sensorId.toString()}</div>
                                </div>
                                <div id='border line' className=' border mx-2'></div>
                                <div id='Retain message and registration date' className='flex-grow mt-1 ml-1 flex'>
                                    <div className='font-normal font-mono text-xs w-3/5 h-full flex flex-col'>
                                        <span className=' text-blue-500'>Retained message: </span>
                                        <span className='mt-1 font-extrabold'> {sensor.retainedMessage} </span>
                                    </div>
                                    <div className=' border ml-1 mr-1'></div>
                                    <div className='flex flex-col font-light'>
                                        <span className='font-mono text-xs text-green-900'>registered at: </span>
                                        <span className='mt-2 font-mono text-xs font-bold'>date: {sensor.dateTimeRegistered.split("T")[0].split(".")[0]}</span>
                                        <span className='font-mono text-xs font-bold'>time: {sensor.dateTimeRegistered.split("T")[1].split(".")[0]}</span>

                                    </div>
                                </div>
                            </button>
                        ))}
                        {!isNaN(selectedSensorId) && <div id='setting condition' className='animate-fade-down'>
                            <table className=" table-auto shadow-md w-full border-collapse overflow-hidden rounded-lg text-center my-3">
                                <thead className=" font-mono uppercase bg-gray-100 rounded-xl">
                                    <tr className="">
                                        <th className="py-2">Key</th>
                                        <th className="">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sensorKeyValuePair.filter((sensor) => sensor.sensorId === selectedSensorId).map((sensor) => (
                                        <tr className="">
                                            <td className="py-2">{sensor.key}</td>
                                            <td className="font-normal">{sensor.value}</td>
                                        </tr>
                                    ))
                                    }
                                </tbody>
                            </table>

                            <form className="flex flex-col mt-5" onSubmit={(e) => handleFormSubmit(e, index + 2)}>
                                <label className=" text-lg uppercase font-bold">STEP 2: Adding condition</label>
                                <div className='relative flex text-center justify-between items-center '>
                                    <div className='flex flex-col '>
                                        <label className=' text-xs font-normal'>KEY</label>
                                        <select id='condition' className='bg-gray-50 border border-gray-300 text-gray-900  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2' required
                                            onChange={(e) => { setSelectedKey(e.target.value) }}>
                                            <option value="" className='' >Select key</option>
                                            {
                                                sensorKeyValuePair.filter((sensor) => sensor.sensorId === selectedSensorId).map((sensor) => (
                                                    <option value={sensor.key} className=''>{sensor.key}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className='flex flex-col '>
                                        <label className=' text-xs font-normal'>OPERATOR</label>
                                        <select id='operator' className='bg-gray-50 border border-gray-300 text-gray-900  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2'
                                            required
                                            onChange={(e) => { setSelectedOperator(e.target.value) }}>
                                            <option value="" className='' >--</option>
                                            <option value="=" className=''>=</option>
                                            <option value="≠" className=''>≠</option>
                                            <option value="&gt;" className=''>&gt;</option>
                                            <option value="&ge;" className=''>&ge;</option>
                                            <option value="&lt;" className=''>&lt;</option>
                                            <option value="&le;" className=''>&le;</option>
                                        </select>
                                    </div>
                                    <FloatingLabel variant="outlined" label="Value"
                                        required
                                        onChange={(e) => { setSelectedValue(e.target.value) }} />
                                </div>
                                <div className="mt-3">
                                    <button type="submit" id="first-add-button" className={`${index === automationContent.length - 1 ? '' : 'hidden'} bg-green-400 text-white rounded-md self-center py-[3px] px-3`}
                                    >Add</button>
                                    <button id="delete-button" className="bg-red-400 text-white rounded-md self-center py-[3px] px-3 mx-3"
                                        onClick={(e) => {
                                            handleDeleteButton(e, index);
                                        }
                                        }>Delete</button>
                                </div>
                            </form>
                        </div>}
                        <button id="finish condition setting button" className={`${automationContent.length > 0 ? '' : 'hidden'}  bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800 animate-fade-down`}
                            onClick={handleSubmitButtonOnClick} disabled={!isValidFinalExpression}>Finish</button>

                    </div>
                ))
                )

            }


            {   //user can draw bracket (), AND and OR to group the conditions
                finishedConditionSetting && <div className='flex flex-col gap-y-3 overflow-auto'>
                    <div className=' text-lg'>STEP 3: arranging conditions
                    </div>
                    <DragDropContext onDragEnd={onDragEnd}>

                        <Droppable droppableId="conditions" direction='horizontal'>
                            {(provided) => (
                                <div>
                                    <div className='  mt-2'>Condition (drag it to Expression box)</div>
                                    <div className='flex gap-x-3 p-2 border border-gray-200 rounded-lg shadow-lg h-24 left-auto top-auto overflow-x-scroll' {...provided.droppableProps} ref={provided.innerRef}>
                                        {automationContentForDraggable.map((content, index) => (
                                            <Draggable key={content.sensorId.toString().concat((content.key, content.operator, content.value))} draggableId={content.sensorId.toString().concat((content.key, content.operator, content.value))} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <div id="added condition" className='bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex flex-col border border-gray-200 '>
                                                            <div className=' text-blue-600'>Conidition {content.conditionId.toString()}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>

                        <Droppable droppableId="finalExpression" direction='horizontal' >
                            {(provided) => (
                                <div>
                                    <div className='  mt-2'>Expression (drop your expression here)</div>
                                    <div className={`${isValidFinalExpression ? '' : 'border border-red-600'} flex gap-x-3 p-2 border border-gray-200 rounded-lg shadow-lg h-28 left-auto top-auto overflow-x-scroll`} {...provided.droppableProps} ref={provided.innerRef}>
                                        {finalExpression.map((content, index) => (
                                            <Draggable key={content.concat(index.toString())} draggableId={content.concat(index.toString())} index={index} >
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <div id="added expression" className='bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex flex-col border border-gray-200 '>
                                                            <div className=''>{operators.includes(content) ? content : <span className=' text-blue-700 '>condition {JSON.parse(content).conditionId}</span>}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                    <div className={`${isValidFinalExpression ? 'hidden' : ''} text-red-700 font-extrabold self-center`}>Invalid expression</div>
                                </div>

                            )}
                        </Droppable>

                        <Droppable droppableId='bracket, AND and OR draggables' direction='horizontal'>
                            {(provided) => (
                                <div>
                                    <div className='  mt-2'>Operator (drag it to Expression box)</div>
                                    <div className='flex gap-x-3 p-2 border border-gray-200 rounded-lg shadow-lg left-auto top-auto overflow-x-scroll'  {...provided.droppableProps} ref={provided.innerRef}>
                                        {operators.map((operator, index) => (
                                            <Draggable key={operator} draggableId={operator} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <div id="added operator" className='bg-slate-50 rounded-lg shadow-lg px-4 py-3 flex flex-col border border-gray-200 '>
                                                            <div className=''>{operator}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <div className='border border-gray-300 ' />

                    <div className='animate-fade-down  text-lg'>STEP 4: Setting Control Device Value</div>
                    <form className="flex flex-col mt-" onSubmit={(e) => handleFinishSettingFormSubmit(e)}>
                        <FloatingLabel variant="outlined" label="Value"
                            required
                            onChange={(e) => { setTriggerValue(e.target.value) }} />
                        <button type='submit' id="finish condition setting button" className={` disabled:cursor-not-allowed disabled:bg-gray-400 bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800 animate-fade-down`}
                        disabled={!isValidFinalExpression}
                        >Finish</button>
                    </form>

                </div>
            }

        </div>
    )

}


