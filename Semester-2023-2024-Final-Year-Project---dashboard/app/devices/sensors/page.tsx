'use client'

import Stomp from 'stompjs';
import { Message } from 'stompjs';
import SockJS from 'sockjs-client';
import { BiSearch } from 'react-icons/bi';
import React, { useEffect, useState } from 'react'
import { BsPlusCircle } from 'react-icons/bs'
import { MdClose } from 'react-icons/md'
import DetectedSensors from './detectedSensors'
import MonitorBoxComponent from '@/app/devices/sensors/monitorBox';
import { AiOutlineDelete } from "react-icons/ai";
import SearchBar from '../../components/searchBar';
import { useServerIp } from '@/app/backendIpContext';


interface sensorInfo {
  sensorId: Number,
  sensorTopic: string,
  retainedMessage: string,
  dateTimeRegistered: string
}

export interface webSocketData{
  Qos: string,
  sensor: string,
  id: string,
  title: string,
  message: string
  receivedTime: EpochTimeStamp
}

export default function Home() {
  const { serverIp } = useServerIp();

  const [open, setOpen] = useState(false); //for add sensor button
  const [editing, setEditing] = useState(false); //for delete button
  const [sensor, setSensor] = useState<sensorInfo[]>([]); //from backend server, which MAY not be added
  const [sensorList, setSensorList] = useState<sensorInfo[]>([]); //from json file, which is added
  const [searchList, setSearchList] = useState<sensorInfo[]>([]); //use in search function, tracking the search result
  const [searching, setSearching] = useState(false); //use in search function, tracking the search result
  const [sensorData, setSensorData] = useState<webSocketData>({
    Qos: '',
    sensor: '',
    id: '',
    title: '',
    message: '',
    receivedTime: 0
  });

  async function fetchSensors() { //fetch sensors from backend server
    try {
      console.log("triggered once fetch sensors");
      const res = await fetch(serverIp+'/testMQTT/listAllSensor');
      const sensors: string = await res.json();
      var sensorListArray = JSON.parse(sensors);
      console.log(sensorListArray);

      setSensor(sensorListArray);

    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => { //fetch sensors from json file, used next.js api
    const sensorPageBody = document.getElementById("sensor-page-body"); //solved document.body.style.overflow = 'hidden' is not working --> in sensors page, overflow is not the out'est' tag
    if (sensorPageBody !== null) {
      if (open) {
        
        sensorPageBody.style.overflow = 'hidden';
        fetchSensors();
      } else {
        sensorPageBody.style.overflow = '';
        //update the sensorList?
        fetchFromSensorListJson()
      }
    }
    //console.log(document);

  }, [open]);

  async function fetchFromSensorListJson() { //fetch sensors from json file, used next.js api
    try {
      console.log("run fetchFromSensorListJson");
      
      const res = await fetch('http://localhost:3000/api/sensorData', {
        method: "GET",
      });
      if(!res.ok){
        console.error('Failed to fetch sensor list');
        return;
      }
      else{
        const sensors = await res.json();
        console.log(sensors);
        setSensorList(sensors);
        
        //tell backend to subscribe to the sensorList
        for(const sensor of sensors){
          console.log("subscribing to sensor", sensor.sensorTopic);
          
          const subsubcribeRes = await fetch(serverIp+`/testMQTT/subscribe?topic=${sensor.sensorTopic}&qos=2`);
          if (!subsubcribeRes.ok) {
            console.error('Failed to subscribe to sensor');
            return;
          }
        }
      }
    
    } catch (e) {
      console.log(e);
    }
  }

  async function unsubscribeAll() {
    for(const sensor of sensorList){
      const unsubsubcribeRes = await fetch(serverIp+`/testMQTT/unsubscribe?topic=${sensor.sensorTopic}`);
      if (!unsubsubcribeRes.ok) {
        console.error('Failed to unsubscribe to sensor');
        return;
      }
    }
  }


  function webSocket(){
    
    const socket = new SockJS(serverIp+'/websocketEndpoint')
    console.log(socket)
    const stompClient = Stomp.over(socket); 

    stompClient.connect({}, ()=>{
      console.log("connected")
      stompClient.subscribe("/topic/sensorData", (messageJSON: Message) =>{
        const parsedMessage = JSON.parse(messageJSON.body);
        parsedMessage.receivedTime = new Date().getTime();
        setSensorData(parsedMessage)       
        console.log(parsedMessage);
      })
      return () => {
        if (stompClient) {
          stompClient.disconnect(() => {
            console.log('Disconnected');
          });
        }
      }; 
    }, ); 
  }

  useEffect(()=> { //connect to websocket
    console.log("triggered once connect to websocket and subscribe");
    
    webSocket();
    //fetchFromSensorListJson();
    return () => {
      unsubscribeAll();
    }
  }, [])

  useEffect(() => { //print sensorData
    console.log(sensorData.sensor, sensorData.message);
  }, [sensorData]);

  function deleteThisMonitorBox(sensorId: Number) { //delete a monitor box
    const newSensorList = sensorList.filter((sensorInfo) => sensorInfo.sensorId !== sensorId);
    setSensorList(newSensorList);
    console.log(newSensorList);
  }

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { //close the modal and editing mode
    if ((e.target as HTMLDivElement).id === 'modal-shadow') {
      setOpen(false);
    }
    if ((e.target as HTMLDivElement).id === 'sensor-page-body') {
      stopEditing();
    }
  };

  function searchSensor(searchValue: string) { //search sensor
    if(searchValue !== ''){ //if searchValue is not empty, filter the sensorList
      setSearching(true);
      const searchResult = sensorList.filter((sensorInfo) => sensorInfo.sensorTopic.toString().toLowerCase().includes(searchValue.toLowerCase())); 
      setSearchList(searchResult);

    } else {
      console.log('searchValue is empty, should show all sensor');
      setSearching(false);
      setSearchList(sensorList); //if searchValue is empty, clear the searchList
    }
  }

  function reverseEditing(editing: boolean) { //reverse the editing mode
    setEditing(!editing);
  }

  function stopEditing() {
    setEditing(false);
  }

  function closeModal() {
    setOpen(false)
  }
  function openModal() {
    setOpen(true)
  }

  return (
    <div  className="flex flex-col w-full">
      <SearchBar searchFunction={searchSensor} />
    
      <div  id='sensor-page-body' className='h-full overflow-y-scroll animate-fade-up bg-slate-200' onClick={onOverlayClick}>
        <div id='Heading and buttons' className='flex justify-between mx-4 my-5'>

          <div id='Heading - Sensors' className='text-4xl font-sans text-slate-500'>Sensors</div>

          <div id='Two buttons' className='flex gap-x-7  text-white font-semibold'>
            <button onClick={openModal} className='flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 focus:bg-violet-800 focus:ring-purple-800 focus:ring hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500'>
              <BsPlusCircle className="text-xl" />

              <span className='flex-1'>
                add sensor
              </span>

            </button>
            {open &&
              <div id="modal-shadow" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-screen z-50 " onClick={onOverlayClick}>
                <div className=" bg-white shadow-xl rounded-xl text-black w-1/3 h-1/2 animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col h-full">
                    <div id="title-and-close" className="flex justify-between text-2xl m-4">
                      <span>Add sensor</span>
                      <button onClick={closeModal} >
                        <MdClose />
                      </button>
                    </div>

                    <div className='border mx-4 border-gray-300 ' />

                    <div id="list-here" className="flex-grow m-5 overflow-hidden hover:overflow-y-scroll">
                      {sensor.length === 0 ? (
                        <div>No sensor detected</div>
                      ) : (
                        sensor.map((sensorInfo: sensorInfo) => (
                          <DetectedSensors
                            key={sensorInfo.sensorId.toString()}
                            dateTimeRegistered={sensorInfo.dateTimeRegistered}
                            retainedMessage={sensorInfo.retainedMessage}
                            sensorId={sensorInfo.sensorId}
                            sensorTopic={sensorInfo.sensorTopic}
                            isExist={sensorList.some(sensorExist => sensorExist['sensorId'] === sensorInfo.sensorId) ? true : false}
                            closeModal={closeModal}                          />
                        ))
                      )}
                    </div>

                  </div>
                </div>
              </div>
            }

            <button className={`flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 ${sensorList.length > 0 || editing ? 'cursor-pointer' : 'cursor-not-allowed'} ${editing ? 'bg-violet-800' : ''} hover:bg-blue-400 hover:rounded-xl duration-500`}
              onClick={() => { if (sensorList.length > 0 || editing) { reverseEditing(editing) } }}>
              <AiOutlineDelete className="text-xl" />

              <span className='flex-1'>
                delete sensor
              </span>

            </button>

          </div>
        </div>

        <div className='border my-2 border-gray-400 mx-4 w-[20rem]' />

        <div className='flex flex-col m-5 gap-y-6  h-full'>
          <div className='grid gap-10 grid-cols-2 w-full'>

            {sensorList.length === 0 ? (
              <div>No sensor is monitored</div>
            ) : (
              searching ? (
                searchList.length === 0 ? (
                  <div>No sensor found</div>
                ) : (
                  searchList.map((sensorInfo: sensorInfo) => (
                    <MonitorBoxComponent
                      key={sensorInfo.sensorId.toString()}
                      sensorTopic={sensorInfo.sensorTopic}
                      sensorName={sensorInfo.sensorTopic}
                      sensorId={sensorInfo.sensorId}
                      retainedMessage={sensorInfo.retainedMessage}
                      dateTimeRegistered={sensorInfo.dateTimeRegistered}
                      isEditing={editing}
                      deleteThisMonitorBox={() => deleteThisMonitorBox(sensorInfo.sensorId)}
                      sensorData={sensorInfo.sensorTopic.localeCompare(sensorData.sensor) == 0  ? sensorData : {}}
                    />
                  ))
                )
              ) : (
                sensorList.map((sensorInfo: sensorInfo) => (
                  <MonitorBoxComponent
                    key={sensorInfo.sensorId.toString()}
                    sensorTopic={sensorInfo.sensorTopic}
                    sensorName={sensorInfo.sensorTopic}
                    sensorId={sensorInfo.sensorId}
                    retainedMessage={sensorInfo.retainedMessage}
                    dateTimeRegistered={sensorInfo.dateTimeRegistered}
                    isEditing={editing}
                    deleteThisMonitorBox={() => deleteThisMonitorBox(sensorInfo.sensorId)
                    }
                    sensorData={sensorInfo.sensorTopic.localeCompare(sensorData.sensor) == 0  ? sensorData : {}}
                  />
                ))
              )
            )}



          </div>
        </div>
      </div>

    </div>
  )
}
