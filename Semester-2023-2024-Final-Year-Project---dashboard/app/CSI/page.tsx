'use client'
import { BiSearch } from 'react-icons/bi';
import Stomp from 'stompjs';
import { Message } from 'stompjs';
import SockJS from 'sockjs-client';
import { use, useEffect, useState } from 'react';
import CsiLineChart from './csiLineChart';
import { parse } from 'path';
import sensorList from '../devices/sensors/assets/addedSensorList.json';
import { BsPlusCircle } from 'react-icons/bs';
import { AiOutlineDelete } from 'react-icons/ai';
import AlertModal from './alertModal';
import { useServerIp } from '../backendIpContext';


interface detectionProb {
  classes: string[],
  prediction_proba: number[][],
  predictions: string[],
}

interface chartValue {
  method: string,
  value: string
}

interface alert {
  sensorTopic: string,
  parameter: string,
  motion: string,
  location: string,
  chartValues: chartValue[],
  triggering : boolean
}

interface webSocketSensorData{
  id: number,
  sensor: string,
  message: string
}

export default function CSI() {
  const {serverIp} = useServerIp();
  
  const [csiData, setCsiData] = useState<number[]>([])
  const [detectionProb, setDetectionProb] = useState<detectionProb>()
  const [detectionResult, setDetectionResult] = useState<string>('')
  const [indoorLocation, setIndoorLocation] = useState<string>('')
  const [allLocations, setAllLocations] = useState<string[]>()
  const [alertList, setAlertList] = useState<alert[]>([])
  const [receivedSensorData, setReceivedSensorData] = useState<webSocketSensorData>()

  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editing, setEditing] = useState(false); //for delete button


  function webSocket() {

    const socket = new SockJS( serverIp+'/websocketEndpoint')
    console.log(socket)
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
      console.log("connected")
      stompClient.subscribe("/topic/sensorData", (jsonMessage: Message) => {
        const parsedMessage = JSON.parse(jsonMessage.body);
        if (parsedMessage.sensor === "MotionDetection/predictions") {
          //the probability of each motion detection
          setDetectionProb(JSON.parse(parsedMessage.message))
        }
        else if (parsedMessage.sensor === "MotionDetection/CSI") {
          //CSI data
          setCsiData(JSON.parse(parsedMessage.message))
        }
        else if (parsedMessage.sensor === "MotionDetection/Result") {
          //motion detection result (highest probability motion detected with p > 0.8)
          setDetectionResult(parsedMessage.message)
        }
        else if (parsedMessage.sensor === "IndoorPrediction/prediction") {
          //indoor location
          setIndoorLocation(parsedMessage.message)
        }
        else if (parsedMessage.sensor === "IndoorPrediction/locations") {
          //all locations
          setAllLocations(JSON.parse(parsedMessage.message))
        }
        else if (parsedMessage.sensor.includes( "all_device/sensor_data/")) {
          //CSI data
          console.log("receivedawdawdaw", parsedMessage);
          
          setReceivedSensorData(parsedMessage)
        }
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

  function checkIfAlertIsTriggered(alert: alert, sensorData: webSocketSensorData, beforeChecked: boolean, motion: string, location: string = "") {
    console.log("checking if alert is triggered");
    console.log("alert", alert);
    console.log("sensorData", sensorData);
    
    if(sensorData === undefined || sensorData.sensor !== alert.sensorTopic){
      
      if(beforeChecked){
        return true
      }
      return false
    }
    console.log("sensorData", sensorData);

    if(alert.motion !== motion || alert.location !== location){
      return false
    }

    
    //check if the alert is triggered
    alert.chartValues.map((chartValue) => {
      const obj = JSON.parse(sensorData.message)
      if (chartValue.method === "≥") {
        if (Number(obj[alert.parameter]) < Number(chartValue.value)) {
          //alert is triggered
          return false
        }
      }
      else if (chartValue.method === "≤") {
        if (Number(obj[alert.parameter]) > Number(chartValue.value)) {
          //alert is triggered
          return false
        }
      }
      else if (chartValue.method === "=") {
        if (Number(obj[alert.parameter]) !== Number(chartValue.value)) {
          //alert is triggered
          return false
        }
      }
      else if (chartValue.method === "≠") {
        if (Number(obj[alert.parameter]) === Number(chartValue.value)) {
          //alert is triggered
          return false
        }
      }
      else if (chartValue.method === ">") {
        if (Number(obj[alert.parameter]) <= Number(chartValue.value)) {
          //alert is triggered
          return false
        }
      }
      else if (chartValue.method === "<") {
        if (Number(obj[alert.parameter]) >= Number(chartValue.value)) {
          //alert is triggered
          return false
        }
      }
    })
    return true

  }

  async function subscribeToCSIAndSensors() {
    const res = await fetch(serverIp+'/testMQTT/subscribeToCSI');
    if (!res.ok) {
      console.error('Failed to subscribe to CSI');
      return;
    }
    else {
      for (const sensor of sensorList) { //forEach is not working because it is actually not async, making backend try to have multiple subscribe method at the same time
        const encodedTopic = encodeURIComponent(sensor.sensorTopic)
        const res = await fetch(serverIp+`/testMQTT/subscribe?topic=${encodedTopic}&qos=1`);
        if (!res.ok) {
          console.error(`Failed to subscribe to ${sensor}`);
          return;
        }
      }
    }
  }

  async function unsubscribeToCSIAndSensors() {
    const res = await fetch(serverIp+'/testMQTT/unsubscribe?topic=MotionDetection/CSI');
    if (!res.ok) {
      console.error('Failed to unsubscribe to CSI');
      return;
    }
    else {
      for (const sensor of sensorList) { //forEach is not working because it is actually not async, making backend try to have multiple subscribe method at the same time
        const res = await fetch(serverIp+`/testMQTT/unsubscribe?topic=${sensor.sensorTopic}`);
        if (!res.ok) {
          console.error(`Failed to unsubscribe to ${sensor}`);
          return;
        }
      }
    }
  }

  function addAlert(alert: alert) {
    setModalOpen(false)
    setAlertList([...alertList, alert])
  }

  function reverseEditing(editing: boolean) { //reverse the editing mode
    setEditing(!editing);
  }

  useEffect(() => {
    subscribeToCSIAndSensors();
    webSocket();

    return () => {
      unsubscribeToCSIAndSensors(); //when user leave the page = unmount the component = unsubscribe to CSI and sensors and disconnect the websocket
    }
  }, [])

  useEffect(() => {
    console.log("alertList", alertList);
  }, [alertList])

  useEffect(() => {
    alertList.map((alert: alert) => {
      console.log("triggered");
      
      if (checkIfAlertIsTriggered(alert, receivedSensorData as webSocketSensorData, alert.triggering, detectionResult)) {
        alert.triggering = true
      }
      else {
        alert.triggering = false
      }
    }
    )
  }, [receivedSensorData, detectionResult])

  return (
    <div className="flex flex-col w-full">
      <div className='animate-fade-up h-full bg-slate-200 overflow-y-scroll w-full'>
        <div className='text-5xl mx-3 my-5 font-sans'>CSI</div>

        <div className='border my-2 border-gray-400 mx-4 w-[36rem]' />

        <div className='flex flex-col m-5'>
          <div className=' font-semibold text-2xl'>Subscribed Sensors</div>
          <div className=' flex flex-nowrap overflow-hidden hover:overflow-x-scroll whitespace-nowrap w-[92%]'>
            {sensorList.map((sensor) => {
              return (
                <div className='bg-white shadow-lg flex flex-col relative rounded-lg p-4 m-2 w-[30rem] hover:overflow-auto overflow-hidden'>
                  <div className='flex justify-between items-center gap-x-5'>
                    <div className=' font-semibold text-2xl'>{sensor.sensorTopic.split('all_device/sensor_data/')}</div>
                    <div className='  font-bold'>id: {sensor.sensorId}</div>
                  </div>
                  <div className='border my-1 border-gray-400' />

                  <div className='flex justify-between items-center gap-x-5 my-2'>
                    <div>Retained Message:</div>
                    <div className=' font-bold'>{sensor.retainedMessage}</div>
                  </div>
                  <div className='flex justify-between items-center gap-x-5 my-2'>
                    <div>Topic:</div>
                    <div className=' font-bold'>{sensor.sensorTopic}</div>
                  </div>
                </div>
              )
            }
            )}

          </div>
        </div>

        <div className='border my-2 border-gray-400 mx-5' />

        <div className='m-5 flex-col flex'>
          <div className='flex justify-between'>
            <div className=' font-semibold text-2xl'>Alerts</div>
            <div id='Two buttons' className='flex gap-x-7  text-white font-semibold'>
              <button onClick={() => { setModalOpen(true) }} className='flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 focus:bg-violet-800 focus:ring-purple-800 focus:ring hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500'>
                <BsPlusCircle className="text-xl" />

                <span className='flex-1'>
                  add Alert
                </span>

              </button>
              <AlertModal closeModal={() => { setModalOpen(false) }} open={modalOpen} motionsDetection={detectionProb as detectionProb} closeAndSubmit={addAlert} allLocations={allLocations ?? []} />

              <button className={`flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 ${sensorList.length > 0 || editing ? 'cursor-pointer' : 'cursor-not-allowed'} ${editing ? 'bg-violet-800' : ''} hover:bg-blue-400 hover:rounded-xl duration-500`}
                onClick={() => { if (sensorList.length > 0 || editing) { reverseEditing(editing) } }}>
                <AiOutlineDelete className="text-xl" />

                <span className='flex-1'>
                  delete Alert
                </span>

              </button>
            </div>
          </div>
          <div className='flex gap-x-3'>
            {alertList.length > 0 && alertList.map((alert, index) => (
              <div className={`${alert.triggering? ' bg-red-300 animate-shake animate-infinite animate-ease-in duration-100 ': ''}bg-white shadow-lg flex flex-col rounded-lg p-4 m-2 `}>
                <div className='flex justify-between items-center gap-x-5'>
                  <div className=' font-semibold text-2xl'>sensor id: {alert.sensorTopic.split('all_device/sensor_data/')}</div>
                </div>
                <div className='border my-1 border-gray-400' />

                <div className='flex flex-col justify-between items-center gap-x-5 my-2'>
                  <div>Conditions: (AND)</div>
                  <div>if <span className=' font-mono font-bold'>{alert.parameter}</span></div>
                  {alert.chartValues.map((chartValue, index) => (
                    <div className=' p-2 my-2 border shadow-lg font-bold'>{chartValue.method} {chartValue.value}</div>
                  ))}
                </div>
                <div className='border my-1 border-gray-400' />
                <div className='flex justify-between items-center gap-x-5 my-2'>
                  <div>Motion:</div>
                  <div className=' font-bold'> {alert.motion}</div>
                </div>
                <div className='flex justify-between items-center gap-x-5 my-2'>
                  <div>Location:</div>
                  <div className=' font-bold'> {alert.location}</div>
                </div>
              </div>
            )
            )
            }
          </div>

        </div>

        <div className='border my-2 border-gray-400 mx-5' />

        <div className='m-5 flex flex-col bg-white shadow-lg h-[20rem]'>
          <div className='my-3 mx-5 font-bold text-2xl'>Real-time CSI Data</div>
          <CsiLineChart csiData={csiData} />
        </div>

        <div className='border my-2 border-gray-400 mx-5' />

        <div className='flex flex-col m-5'>
          <div className=' text-3xl font-semibold'>Motion Detection</div>
          <div className='m-5 grid-cols-2 grid gap-8'>
            <table className=" table-auto shadow-md w-full border-collapse overflow-hidden rounded-lg text-center my-3">
              <thead className=" font-mono uppercase bg-gray-100 rounded-xl">
                <tr className="">
                  <th className="py-2">Motion</th>
                  <th className="">Probability</th>
                </tr>
              </thead>
              <tbody>
                {detectionProb?.classes.map((motion, index) => {
                  return (
                    <tr className={` bg-gray-200 ${detectionResult === motion ? 'bg-green-400' : ''} `}>
                      <td className=" py-2 ">{motion}</td>
                      <td className=" py-2 ">{(detectionProb.prediction_proba[0][index] * 100).toFixed(4)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className='bg-white shadow-lg flex flex-col relative rounded-lg p-4'>
              <div className=' font-semibold text-2xl'>Detected Motion:</div>
              <div className='flex-grow flex flex-col justify-center self-center text-5xl font-bold'>{detectionResult === "/" ? "No motion detected" : detectionResult}</div>
            </div>
          </div>
        </div>

        <div className='border my-2 border-gray-400 mx-5' />
        <div className='flex flex-col m-5'>
          <div className=' text-3xl font-semibold'>Indoor Detection</div>
          <div className=' grid-cols-2 grid gap-8'>
            <table className=" table-auto shadow-md w-full border-collapse overflow-hidden rounded-lg text-center my-3">
              <thead className=" font-mono uppercase bg-gray-100 rounded-xl">
                <tr className="">
                  <th className="py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {allLocations?.map((location, index) => {
                  return (
                    <tr className={` bg-gray-200 ${indoorLocation === location ? 'bg-yellow-400' : ''} `}>
                      <td className=" py-2 ">{location}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className='bg-white shadow-lg flex flex-col relative rounded-lg p-4'>
              <div className=' font-semibold text-2xl'>Device Location:</div>
              <div className='flex-grow flex flex-col justify-center self-center text-5xl font-bold'>{indoorLocation}</div>
            </div>
          </div>
        </div>



      </div>


    </div>
  )
}
