'use client'
import Stomp from 'stompjs';
import { Message } from 'stompjs';
import SockJS from 'sockjs-client';
import Image from 'next/image'
import { BiSearch } from 'react-icons/bi';
import { BsPlusCircle } from 'react-icons/bs';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { useEffect, useState } from 'react';
import SearchBar from '@/app/components/searchBar';
import { MdClose } from 'react-icons/md';
import DetectedControlDevices from './detectedControlDevice';
import MonitorBoxComponent from './monitorBox';
import { useServerIp } from '@/app/backendIpContext';

interface controlDeviceInfo {
  sensorId: Number,
  sensorTopic: string,
  retainedMessage: string,
  dateTimeRegistered: string
}

export interface webSocketData {
  Qos: string,
  sensor: string,
  id: string,
  title: string,
  message: string
  receivedTime: EpochTimeStamp
}

interface automationInfo {
  automationContent: string[],
  triggerValue: string,
  deviceId: number
}

export default function Home() {
  const {serverIp } = useServerIp();

  const [open, setOpen] = useState(false); //for add control device button
  const [editing, setEditing] = useState(false); //for delete button
  const [controlDevice, setControlDevice] = useState<controlDeviceInfo[]>([]); //from backend server, which MAY not be added
  const [controlDeviceList, setControlDeviceList] = useState<controlDeviceInfo[]>([]); //from json file, which is added
  const [searchList, setSearchList] = useState<controlDeviceInfo[]>([]); //use in search function, tracking the search result
  const [searching, setSearching] = useState(false); //use in search function, tracking the search result
  const [controlDeviceData, setControlDeviceData] = useState<webSocketData>({
    Qos: '',
    sensor: '',
    id: '',
    title: '',
    message: '',
    receivedTime: 0
  });
  const [automationList, setAutomationList] = useState<automationInfo[]>([]);

  useEffect(() => { //fetch control devices from json file, used next.js api
    const controlPageBody = document.getElementById("control-page-body"); //solved document.body.style.overflow = 'hidden' is not working --> in sensors page, overflow is not the out'est' tag
    if (controlPageBody !== null) {
      if (open) {
        controlPageBody.style.overflow = 'hidden';
        fetchControlDevices();
      } else {
        controlPageBody.style.overflow = '';
        //update the sensorList?
        fetchFromControlDeviceListJson()
      }
    }
    //console.log(document);

  }, [open]);

  async function fetchAutomation() {
    try {
      //http://localhost:8081/testMQTT/getAutomation
      const res = await fetch(serverIp+'/testMQTT/fetchAutomation');
      const automations = await res.json();

      console.log(automations);
      automations.forEach((automation: any) => {
        const automationToAdd = {
          automationContent: JSON.parse(automation.expression),
          triggerValue: automation.publishValue,
          deviceId: automation.sensorId
        }
        setAutomationList((automationList) => [...automationList, automationToAdd]);
      })
    }
    catch (e) {
      console.log(e);
      console.log('Failed to fetch automation');
    }
  }

  async function fetchControlDevices() { //fetch controlDevices from backend server
    try {
      const res = await fetch(serverIp+'/testMQTT/listAllControlDevice');
      const controlDevices: string = await res.json();
      var controlDeviceListArray = JSON.parse(controlDevices);
      console.log(controlDeviceListArray);

      setControlDevice(controlDeviceListArray);

    } catch (e) {
      console.log(e);
    }
  };

  async function fetchFromControlDeviceListJson() { //fetch controlDevices from json file, used next.js api
    try {
      const res = await fetch('http://localhost:3000/api/controlData', {
        method: "GET",
      });
      const controlDevices = await res.json();
      console.log(controlDevices);
      setControlDeviceList(controlDevices);


    } catch (e) {
      console.log(e);
    }
  }

  function webSocket() {

    const socket = new SockJS(serverIp+'/websocketEndpoint')
    console.log(socket)
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("connected")
      stompClient.subscribe("/topic/sensorData", (messageJSON: Message) => {
        const parsedMessage = JSON.parse(messageJSON.body);
        parsedMessage.receivedTime = new Date().getTime();
        setControlDeviceData(parsedMessage)
        console.log(parsedMessage);
      })
      return () => {
        if (stompClient) {
          stompClient.disconnect(() => {
            console.log('Disconnected');
          });
        }
      };
    },);
  }

  useEffect(() => { //connect to websocket
    webSocket()
    fetchAutomation();
  }, [])

  useEffect(() => { //print automations
    console.log(automationList);
  }, [automationList]);

  useEffect(() => { //print controlDeviceData
    console.log(controlDeviceData.sensor, controlDeviceData.message);
  }, [controlDeviceData]);

  function deleteThisMonitorBox(controlDeviceId: Number) { //delete a monitor box
    const newControlDeviceList = controlDeviceList.filter((controlDeviceInfo) => controlDeviceInfo.sensorId !== controlDeviceId);
    setControlDeviceList(newControlDeviceList);
    console.log(newControlDeviceList);
  }

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { //close the modal and editing mode
    if ((e.target as HTMLDivElement).id === 'modal-shadow') {
      setOpen(false);
    }
    if ((e.target as HTMLDivElement).id === 'control-page-body') {
      stopEditing();
    }
  };

  function searchControlDevice(searchValue: string) { //search controlDevice
    if (searchValue !== '') { //if searchValue is not empty, filter the controlDeviceList
      setSearching(true);
      const searchResult = controlDeviceList.filter((controlDeviceInfo) => controlDeviceInfo.sensorTopic.toString().toLowerCase().includes(searchValue.toLowerCase()));
      setSearchList(searchResult);

    } else {
      console.log('searchValue is empty, should show all controlDevice');
      setSearching(false);
      setSearchList(controlDeviceList); //if searchValue is empty, clear the searchList
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
    <div className="flex flex-col w-full">
      <SearchBar searchFunction={searchControlDevice} />

      <div id='control-page-body' className='h-full  overflow-y-scroll animate-fade-up bg-slate-200' onClick={onOverlayClick}>
        <div id='Heading and buttons' className='flex justify-between mx-4 my-5'>

          <div id='Heading - Control' className='text-4xl font-sans text-slate-500'>Control Devices</div>

          <div id='Two buttons' className='flex gap-x-7  text-white font-semibold'>

            <button onClick={openModal} className='flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 focus:bg-violet-800 focus:ring-purple-800 focus:ring hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500'>
              <BsPlusCircle className="text-xl" />

              <span className='flex-1'>
                add control device
              </span>

            </button>
            {open &&
              <div id="modal-shadow" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-screen z-50 " onClick={onOverlayClick}>
                <div className=" bg-white shadow-xl rounded-xl text-black w-1/3 h-1/2 animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col h-full">
                    <div id="title-and-close" className="flex justify-between text-2xl m-4">
                      <span>Add control device</span>
                      <button onClick={closeModal} >
                        <MdClose />
                      </button>
                    </div>

                    <div className='border mx-4 border-gray-300 ' />

                    <div id="list-here" className="flex-grow m-5 overflow-hidden hover:overflow-y-scroll">
                      {controlDevice.length === 0 ? (
                        <div>No control device detected</div>
                      ) : (
                        controlDevice.map((controlDeviceInfo: controlDeviceInfo) => (
                          <DetectedControlDevices
                            key={controlDeviceInfo.sensorId.toString()}
                            dateTimeRegistered={controlDeviceInfo.dateTimeRegistered}
                            retainedMessage={controlDeviceInfo.retainedMessage}
                            sensorId={controlDeviceInfo.sensorId}
                            sensorTopic={controlDeviceInfo.sensorTopic}
                            isExist={controlDeviceList.some(sensorExist => sensorExist['sensorId'] === controlDeviceInfo.sensorId) ? true : false}
                            closeModal={closeModal} />
                        ))
                      )}
                    </div>

                  </div>
                </div>
              </div>
            }

            <button className={`${controlDeviceList.length > 0 || editing ? 'cursor-pointer' : 'cursor-not-allowed'} ${editing ? 'bg-violet-800' : ''} flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 focus:bg-violet-800 focus:ring-purple-800 focus:ring hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500`}
              onClick={() => { if (controlDeviceList.length > 0 || editing) { reverseEditing(editing) } }}>
              <AiOutlineDelete className="text-xl" />

              <span className='flex-1'>
                delete control device
              </span>

            </button>

          </div>
        </div>

        <div className='border my-2 border-gray-400 mx-4 w-[20rem]' />

        <div className='flex flex-col  m-5 gap-y-6 '>
          <div className='grid gap-10 grid-cols-2 w-full'>
            {controlDeviceList.length === 0 ? (
              <div>No controlDevice is monitored</div>
            ) : (
              searching ? (
                searchList.length === 0 ? (
                  <div>No controlDevice found</div>
                ) : (
                  searchList.map((controlDeviceInfo: controlDeviceInfo) => (
                    <MonitorBoxComponent
                      key={controlDeviceInfo.sensorId.toString()}
                      sensorTopic={controlDeviceInfo.sensorTopic}
                      sensorName={controlDeviceInfo.sensorTopic}
                      sensorId={controlDeviceInfo.sensorId}
                      retainedMessage={controlDeviceInfo.retainedMessage}
                      dateTimeRegistered={controlDeviceInfo.dateTimeRegistered}
                      isEditing={editing}
                      deleteThisMonitorBox={() => deleteThisMonitorBox(controlDeviceInfo.sensorId)}
                      sensorData={controlDeviceInfo.sensorTopic.localeCompare(controlDeviceData.sensor) == 0 ? controlDeviceData : {}}
                      automations={automationList.filter(automation => automation.deviceId === controlDeviceInfo.sensorId)}
                    />
                  ))
                )
              ) : (
                controlDeviceList.map((controlDeviceInfo: controlDeviceInfo) => (
                  <MonitorBoxComponent
                    key={controlDeviceInfo.sensorId.toString()}
                    sensorTopic={controlDeviceInfo.sensorTopic}
                    sensorName={controlDeviceInfo.sensorTopic}
                    sensorId={controlDeviceInfo.sensorId}
                    retainedMessage={controlDeviceInfo.retainedMessage}
                    dateTimeRegistered={controlDeviceInfo.dateTimeRegistered}
                    isEditing={editing}
                    deleteThisMonitorBox={() => deleteThisMonitorBox(controlDeviceInfo.sensorId)
                    }
                    sensorData={controlDeviceInfo.sensorTopic.localeCompare(controlDeviceData.sensor) == 0 ? controlDeviceData : {}}
                    automations={automationList.filter(automation => automation.deviceId === controlDeviceInfo.sensorId)}
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
