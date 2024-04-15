'use client'
import Image from 'next/image'

import Stomp from 'stompjs';
import { Message } from 'stompjs';
import SockJS from 'sockjs-client';

import { BiSearch } from 'react-icons/bi';
import { BsPlusCircle } from 'react-icons/bs';
import { AiOutlineEdit } from 'react-icons/ai';
import { useEffect, useState } from 'react';

import sensorList from '../devices/sensors/assets/addedSensorList.json';
import controlDeviceList from '../devices/control/assets/addedControlList.json';
import SearchBar from '../components/searchBar';
import SensorMonitorBoxComponent from '@/app/devices/sensors/monitorBox';
import ControlMonitorBoxComponent from '@/app/devices/control/monitorBox';
import { useServerIp } from '../backendIpContext';

interface jsonDataType {
  sensorId: number,
  sensorTopic: string,
  retainedMessage: string,
  dateTimeRegistered: string,
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
  const { serverIp } = useServerIp();

  const [searching, setSearching] = useState(false); //use in search function, tracking the search result
  const [sensorSearchList, setSensorSearchList] = useState<jsonDataType[]>([]); //use in search function, tracking the search result
  const [controlSearchList, setControlSearchList] = useState<jsonDataType[]>([]); //use in search function, tracking the search result
  const [sensors, setSensors] = useState([]); //from addedSensorList.json
  const [controlDevices, setControlDevices] = useState([]); //from addedControlDeviceList.json
  const [automationList, setAutomationList] = useState<automationInfo[]>([]);

  const [data, setData] = useState<webSocketData>({
    Qos: '',
    sensor: '',
    id: '',
    title: '',
    message: '',
    receivedTime: 0
  }); //from websocket

  function webSocket() {

    const socket = new SockJS(serverIp+'/websocketEndpoint')
    console.log(socket)
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("connected")
      stompClient.subscribe("/topic/sensorData", (messageJSON: Message) => {
        const parsedMessage = JSON.parse(messageJSON.body);
        parsedMessage.receivedTime = new Date().getTime();
        setData(parsedMessage)
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

  function searchDevice(searchValue: string) { //search controlDevice
    if (searchValue !== '') { //if searchValue is not empty, filter the controlDeviceList
      setSearching(true);
      const sensorResult = sensorList.filter((sensorInfo) => sensorInfo.sensorTopic.toString().toLowerCase().includes(searchValue.toLowerCase()));
      const controlResult = controlDeviceList.filter((controlDeviceInfo) => controlDeviceInfo.sensorTopic.toString().toLowerCase().includes(searchValue.toLowerCase()));
      setSensorSearchList(sensorResult);
      setControlSearchList(controlResult);
      console.log([...sensorResult, ...controlResult]);
      
    } else {
      console.log('searchValue is empty, should show all controlDevice');
      setSearching(false);
      setSensorSearchList([]); //if searchValue is empty, clear the searchList
      setControlSearchList([]); //if searchValue is empty, clear the searchList
    }
  }

  useEffect(() => {
    webSocket();
    fetchAutomation();
    console.log(sensorList, controlDeviceList);

  }, [])

  return (
    <div className="flex flex-col w-full">
      <SearchBar searchFunction={searchDevice} />



      <div className='overflow-auto animate-fade-up bg-slate-200'>
        <div className='text-5xl mx-3 my-5 font-sans'>Devices</div>

        <div className='border my-2 border-black mx-5' />

        <div id='Heading - Sensors' className='mt-10 mx-4 text-4xl font-sans text-slate-500'>Sensors</div>


        <div className='border my-2 border-gray-400 mx-4 w-[10rem]' />

        <div className='flex flex-col justify-center m-5 gap-y-6 '>
          <div className='grid gap-10 grid-cols-2 h-4/5 w-full'>
            {sensorList.length === 0 ? (
              <div>No sensor is monitored</div>
            ) : (
              searching ? (
                sensorSearchList.length === 0 ? (
                  <div>No sensor found</div>
                ) : (
                  sensorSearchList.map((sensorInfo: jsonDataType) => (
                    <SensorMonitorBoxComponent
                      key={sensorInfo.sensorId.toString()}
                      sensorTopic={sensorInfo.sensorTopic}
                      sensorName={sensorInfo.sensorTopic}
                      sensorId={sensorInfo.sensorId}
                      retainedMessage={sensorInfo.retainedMessage}
                      dateTimeRegistered={sensorInfo.dateTimeRegistered}
                      isEditing={false}
                      deleteThisMonitorBox={() => { }}
                      sensorData={sensorInfo.sensorTopic.localeCompare(data.sensor) == 0 ? data : {}}
                    />
                  ))
                )
              ) : (
                sensorList.map((sensorInfo: jsonDataType) => (
                  <SensorMonitorBoxComponent
                    key={sensorInfo.sensorId.toString()}
                    sensorTopic={sensorInfo.sensorTopic}
                    sensorName={sensorInfo.sensorTopic}
                    sensorId={sensorInfo.sensorId}
                    retainedMessage={sensorInfo.retainedMessage}
                    dateTimeRegistered={sensorInfo.dateTimeRegistered}
                    isEditing={false}
                    deleteThisMonitorBox={() => { }}
                    sensorData={sensorInfo.sensorTopic.localeCompare(data.sensor) == 0 ? data : {}}
                  />
                ))
              )
            )}


          </div>
        </div>

        <div className='border my-10 border-black mx-5' />

        <div id='Heading - Sensors' className='mt-10 mx-4 text-4xl font-sans text-slate-500'>Control Devices</div>


        <div className='border my-2 border-gray-400 mx-4 w-[16rem]' />

        <div className='flex flex-col justify-center m-5 gap-y-6 '>
          <div className='grid gap-10 grid-cols-2 w-full'>
            {controlDeviceList.length === 0 ? (
              <div>No controlDevice is monitored</div>
            ) : (
              searching ? (
                controlSearchList.length === 0 ? (
                  <div>No controlDevice found</div>
                ) : (
                  controlSearchList.map((controlDeviceInfo: jsonDataType) => (
                    <ControlMonitorBoxComponent
                      key={controlDeviceInfo.sensorId.toString()}
                      sensorTopic={controlDeviceInfo.sensorTopic}
                      sensorName={controlDeviceInfo.sensorTopic}
                      sensorId={controlDeviceInfo.sensorId}
                      retainedMessage={controlDeviceInfo.retainedMessage}
                      dateTimeRegistered={controlDeviceInfo.dateTimeRegistered}
                      isEditing={false}
                      deleteThisMonitorBox={() => { }}
                      sensorData={controlDeviceInfo.sensorTopic.localeCompare(data.sensor) == 0 ? data : {}}
                      automations={automationList.filter(automation => automation.deviceId === controlDeviceInfo.sensorId)}
                    />
                  ))
                )
              ) : (
                controlDeviceList.map((controlDeviceInfo: jsonDataType) => (
                  <ControlMonitorBoxComponent
                    key={controlDeviceInfo.sensorId.toString()}
                    sensorTopic={controlDeviceInfo.sensorTopic}
                    sensorName={controlDeviceInfo.sensorTopic}
                    sensorId={controlDeviceInfo.sensorId}
                    retainedMessage={controlDeviceInfo.retainedMessage}
                    dateTimeRegistered={controlDeviceInfo.dateTimeRegistered}
                    isEditing={false}
                    deleteThisMonitorBox={() => { }}
                    sensorData={controlDeviceInfo.sensorTopic.localeCompare(data.sensor) == 0 ? data : {}}
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
