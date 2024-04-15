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

//bar chart and pie chart returning values
//chartValues: chartValues[i] is the i-th condition, where chartValues[i].method is the method, chartValues[i].value is the value
//Xaxis is the category, selectedXAxis is the chosen category

export default function barChartAndPieChartSetting (settingProps: settingProps){
    const [keyValuePair, setKeyValuePair] = useState<keyValuePair[]>([]);
    const [selectedXAxis, setSelectedXAxis] = useState<string>('');
    const [chartValues, setchartValues] = useState<chartValue[]>([]);
    const [method, setMethod] = useState<string>('');
    const [value, setValue] = useState<string>('');

    function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        console.log(e.target.value);
        setSelectedXAxis(e.target.value);
    }

    function handleDeleteButton(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) {
        chartValues.splice(index, 1);
        setchartValues([...chartValues]);
        e.preventDefault();
    }

    function handleSubmitButtonOnClick() {
        console.log("submit button clicked");
        settingProps.closeChartOptionAndConstructChart(chartValues, selectedXAxis);
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
            //if the json object has inner json object, should parse it again
            
            for (const key in jsonPayload) {
                if(typeof jsonPayload[key] === 'object'){
                    for (const innerKey in jsonPayload[key]){
                        console.log(innerKey, jsonPayload[key][innerKey]);
                        const newKeyValuePair = { key: innerKey, value: jsonPayload[key][innerKey] };
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

            <form className="flex flex-col" onSubmit={(e) => handleFormSubmit(e)}>
                <label className=" text-lg uppercase font-bold">x-axis (category)</label>

                <div className="relatve flex text-center">
                    <select id="valueChosen" name="valueChosen"
                        className=" disabled: self-center focus:bg-white pl-3 focus:border-gray-500 block my-2 text-gray-500 bg-gray-200 border border-gray-200 leading-8 appearance-none rounded-md w-full h-10"
                        onChange={(e) => { handleSelectChange(e) }}>

                        <option value="" >Select x-axis</option>
                        {keyValuePair.map((pair) => {
                            return (
                                <option value={pair.key} >{pair.key}</option>
                            )
                        })
                        }
                    </select>
                </div>

                {selectedXAxis.localeCompare('') !== 0 &&
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
                                        <div className="flex mt-1 gap-2">
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

                        <button id="submit-button" className={`${chartValues.length > 0 ? '' : 'hidden'}  bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800`}
                            onClick={handleSubmitButtonOnClick}>Submit</button>
                    </>}


            </form>

        </div>
    )
}