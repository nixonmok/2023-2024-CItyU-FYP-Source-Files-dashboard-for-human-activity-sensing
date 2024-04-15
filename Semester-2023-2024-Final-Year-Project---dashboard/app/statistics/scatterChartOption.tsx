//scatter chart = two values, method is '='

import { useEffect, useState } from "react";

//interface import
import { payloadFromDatabase } from "./analysisBox";


interface settingProps {
    closeChartOptionAndConstructChart: (chartValues: chartValue[], selectedXAxis: string) => void
    payloads: payloadFromDatabase[]
}

export interface chartValue {
    method: string,
    value: string
}

export interface keyValuePair {
    key: string,
    value: string
}

//scatter chart returning values
//chartValues (array): only conists of one element, where chartValues[0].method is the x-axis, chartValues[0].value is the y-axis

export default function scatterChartOption(settingProps: settingProps) {
    const [keyValuePair, setKeyValuePair] = useState<keyValuePair[]>([]);
    const [selectedXAxis, setSelectedXAxis] = useState<string>('');
    const [selectedYAxis, setSelectedYAxis] = useState<string>('');
    const [chartValues, setchartValues] = useState<chartValue[]>([]);
    const [method, setMethod] = useState<string>('');
    const [value, setValue] = useState<string>('');

    function handleSelectXaxisChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedXAxis(e.target.value);
    }

    function handleSelectYaxisChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedYAxis(e.target.value);
    }

    function handleResetButton() {
        console.log("reset button clicked");
        
        setSelectedXAxis('');
        setSelectedYAxis('');
    }

    function handleSubmitButtonOnClick() {
        console.log("submit button clicked");
        const twoParameter = selectedXAxis + ',' + selectedYAxis;
        settingProps.closeChartOptionAndConstructChart([{method: selectedXAxis, value: selectedYAxis}], twoParameter);
    }

    function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        console.log("form submitted");
        e.preventDefault(); // Prevent the default form submit action

        // Add the new chart value only if both method and value are set
        if (method && value) {
            setchartValues((prevState) => [...prevState, { method, value }]);
            // Optionally, reset method and value here if you want to clear the inputs after adding
            setMethod('');
            setValue('');
        } else {
            console.log("Method or value is missing");
        }
    }

    useEffect(() => {
        if (settingProps.payloads[0].message !== undefined) {
            setKeyValuePair([]);
            //const jsonPayloadObject = JSON.parse(chartOptionProps.payload.message)
            const jsonPayload = JSON.parse(settingProps.payloads[0].message);
            console.log(settingProps.payloads[0].message);
            for (const key in jsonPayload) {
                if(typeof jsonPayload[key] === 'object'){
                    for(const innerkey in jsonPayload[key]){
                        console.log(innerkey, jsonPayload[key][innerkey]);
                        const newKeyValuePair = { key: innerkey, value: jsonPayload[key][innerkey] };
                        setKeyValuePair((prevState) => [...prevState, newKeyValuePair]);
                    }
                }
                else{
                    console.log(key, jsonPayload[key]);
                    const newKeyValuePair = { key: key, value: jsonPayload[key] };
                    setKeyValuePair((prevState) => [...prevState, newKeyValuePair]);
                }
            }
            console.log("final keyValuePair: ", keyValuePair);

        }
    }
        , [settingProps.payloads[0].message])


    return (
        <div className=" flex flex-col w-full">
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

            <form id="scatterForm" className="flex flex-col" onSubmit={(e) => handleFormSubmit(e)}>
                <label className=" text-lg uppercase font-bold"> X-axis</label>

                <div className="relatve flex text-center">
                    <select id="valueChosen" name="valueChosen"
                        className=" disabled: self-center focus:bg-white pl-3 focus:border-gray-500 block my-2 text-gray-500 bg-gray-200 border border-gray-200 leading-8 appearance-none rounded-md w-full h-10"
                        onChange={(e) => { handleSelectXaxisChange(e) }}>

                        <option value="" >Select x-axis</option>
                        {keyValuePair.map((pair) => {
                            return (
                                !isNaN(parseInt(pair.value)) ? (
                                    <option value={pair.key} key={pair.key}>{pair.key}</option>
                                ) : (
                                    null
                                )
                            )
                        })
                        }
                    </select>
                </div>

                {
                    selectedXAxis.localeCompare('') !== 0 &&
                    <div className="mt-4">
                        <label className=" text-lg uppercase font-bold"> Y-axis</label>
                        <div className="relatve flex text-center">
                            <select id="valueChosen" name="valueChosen"
                                className=" disabled: self-center focus:bg-white pl-3 focus:border-gray-500 block my-2 text-gray-500 bg-gray-200 border border-gray-200 leading-8 appearance-none rounded-md w-full h-10"
                                onChange={(e) => { handleSelectYaxisChange(e) }}>

                                <option value="" >Select x-axis</option>
                                {keyValuePair.map((pair) => {
                                    return (
                                        !isNaN(parseInt(pair.value)) && pair.key !== selectedXAxis ? (
                                            <option value={pair.key} key={pair.key}>{pair.key}</option>
                                        ) : (
                                            null
                                        )
                                    )
                                })
                                }
                            </select>
                        </div>
                        <div className="flex mt-1 gap-2">
                            <button type="reset" onClick={() => {handleResetButton()}} id="reset-button" className={`bg-green-400 text-white rounded-md self-center py-[3px] px-3`}
                            >reset
                            </button>
                        </div>
                    </div>
                }

                <button id="submit-button" className={`${selectedXAxis && selectedYAxis ? '' : 'hidden'}  bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800`}
                    onClick={handleSubmitButtonOnClick}>Submit</button>

            </form>

        </div>
    )
}