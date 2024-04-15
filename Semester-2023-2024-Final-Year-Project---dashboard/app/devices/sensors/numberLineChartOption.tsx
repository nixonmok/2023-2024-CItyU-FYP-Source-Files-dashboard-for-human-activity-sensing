import { useEffect, useState } from "react";
import { webSocketData } from "./page";


interface settingProps {
    closeChartOptionAndConstructChart: (chartValues: chartValue[], selectedXAxis: string) => void
    payload: webSocketData
}

export interface chartValue {
    method: string,
    value: string
}

export interface keyValuePair {
    key: string,
    value: string
}

//line chart returning values
//chartValues only consists of one element, which both method and value are the 'parameter'

export default function lineNumberChartSetting (settingProps: settingProps){
    const [keyValuePairs, setKeyValuePairs] = useState<keyValuePair[]>([]);
    const [selectedXAxis, setSelectedXAxis] = useState<string>('');
    
    function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        console.log(e.target.value);
        setSelectedXAxis(e.target.value);
    }

    function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        console.log("form submitted");
        e.preventDefault(); // Prevent the default form submit action
        settingProps.closeChartOptionAndConstructChart([{method: selectedXAxis, value: selectedXAxis}], selectedXAxis);

    }

    useEffect(() => {
        if (settingProps.payload.message !== undefined) {
            setKeyValuePairs([]);
            //const jsonPayloadObject = JSON.parse(chartOptionProps.payload.message)
            const jsonPayload = JSON.parse(settingProps.payload.message);
            console.log(settingProps.payload.message);
            for (const key in jsonPayload) {
                if(typeof jsonPayload[key] === 'object'){
                    for(const innerkey in jsonPayload[key]){
                        console.log(innerkey, jsonPayload[key][innerkey]);
                        const newKeyValuePair = { key: innerkey, value: jsonPayload[key][innerkey] };
                        setKeyValuePairs((prevState) => [...prevState, newKeyValuePair]);
                    }
                }
                else{
                    console.log(key, jsonPayload[key]);
                    const newKeyValuePair = { key: key, value: jsonPayload[key] };
                    setKeyValuePairs((prevState) => [...prevState, newKeyValuePair]);
                }
            }
            console.log("final keyValuePair: ", keyValuePairs);

        }
    }
        , [settingProps.payload.message])


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
                    {keyValuePairs.map((pair) => {
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
                        {keyValuePairs.map((pair) => {
                            return (
                                <option value={pair.key} >{pair.key}</option>
                            )
                        })
                        }
                    </select>
                </div>

                {selectedXAxis.localeCompare('') !== 0 &&
                    <>
                        <button id="submit-button" disabled={isNaN(parseInt(keyValuePairs.find((pairs)=>{return pairs.key === selectedXAxis})?.value ??"")) && keyValuePairs.find((pairs)=>{return pairs.key === selectedXAxis})?.value !== "TRUE" && keyValuePairs.find((pairs)=>{return pairs.key === selectedXAxis})?.value !== "FALSE" && keyValuePairs.find((pairs)=>{return pairs.key === selectedXAxis})?.value !== "OPEN" && keyValuePairs.find((pairs)=>{return pairs.key === selectedXAxis})?.value !== "CLOSE"}  
                        className="bg-blue-700 text-white font-bold rounded-md mt-5 py-2 hover:bg-blue-400 transition active:bg-violet-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                            type="submit"
                            >                            
                                Submit
                        </button>
                    </>}


            </form>

        </div>
    )
}