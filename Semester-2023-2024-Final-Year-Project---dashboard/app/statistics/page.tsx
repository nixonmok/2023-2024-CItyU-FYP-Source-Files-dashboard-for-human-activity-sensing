'use client'
import { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import SearchBar from '../components/searchBar';
import { IoAnalytics } from "react-icons/io5";
import { CiExport } from "react-icons/ci";
import AnalysisBox from './analysisBox';
import { useServerIp } from '../backendIpContext';

interface sensorInfo {
  sensorId: Number,
  sensorTopic: string,
  retainedMesage: string,
  dateTimeRegistered: string,
}

export default function Home() {
  const { serverIp } = useServerIp();

  const [sensor, setSensor] = useState<sensorInfo[]>([]); //from backend server
  const [searchList, setSearchList] = useState<sensorInfo[]>([]);
  const [searching, setSearching] = useState(false);


  async function fetchAllSensors() { //fetch sensors from backend server
    try {
      const res = await fetch(serverIp + '/testMQTT/databaseSensor');
      const sensors: sensorInfo[] = await res.json();

      setSensor(sensors);

    } catch (e) {
      console.log(e);
    }
  };

  function searchSensor(searchValue: string) {
    if(searchValue !== ''){ //if searchValue is not empty, filter the sensorList
      setSearching(true);
      const searchResult = sensor.filter((sensorInfo) => sensorInfo.sensorTopic.toString().toLowerCase().includes(searchValue.toLowerCase())); 
      setSearchList(searchResult);

    } else {
      console.log('searchValue is empty, should show all sensor');
      setSearching(false);
      setSearchList(sensor); //if searchValue is empty, clear the searchList
    }
  }

  useEffect(() => {
    fetchAllSensors();
  }, []);

  useEffect(() => {
    console.log("sensor changed", sensor);
  }
    , [sensor]);

  return (
    <div className="flex flex-col w-full">

      <SearchBar searchFunction={searchSensor} />

      <div className='overflow-auto animate-fade-up bg-slate-200 h-full'>
        <div className='text-5xl mx-3 my-5 font-sans'>Statistic</div>
        <div className='border my-2 border-gray-400 mx-4 w-[36rem]' />

        <div className='flex flex-col justify-center m-5 gap-y-6 '>

          <div className='grid gap-8 grid-cols-2 w-full'>

            {sensor.length === 0 ? (
              <div>No sensor registered in database</div>
            ) : (
              searching ? (
                searchList.length === 0 ? (
                  <div>No sensor found</div>
                ) : (
              searchList.map((sensorInfo: sensorInfo) => (
                <AnalysisBox sensorInfo={sensorInfo} />
              ))
                )) : (
                  sensor.map((sensorInfo: sensorInfo) => (
                    <AnalysisBox sensorInfo={sensorInfo} />
                  )
                  )
                )
              )
            }


          </div>
        </div>

      </div>


    </div>
  )
}
