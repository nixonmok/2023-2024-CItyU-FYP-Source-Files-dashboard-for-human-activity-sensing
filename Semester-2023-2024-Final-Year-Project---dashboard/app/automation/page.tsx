'use client'
import Image from 'next/image'
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BiSearch } from 'react-icons/bi';
import { BsPlusCircle } from 'react-icons/bs';
import SearchBar from '../components/searchBar';
import { use, useEffect, useState } from 'react';
import AddedControlDevices from './addedControlDevices';
import AutomationBox from './automationBox';
import AutomationOption from './automationOption';

//JSON control device list import
import controlDeviceList from '../devices/control/assets/addedControlList.json';
import { MdClose } from 'react-icons/md';
import { useServerIp } from '../backendIpContext';

//This page allow user to view and manage the automation
//automation is a set of rules that trigger the control device to perform certain actions
//e.g: turn on the light when the sensor detects motion
//operation include:  IF/ELSE/THEN/AND/OR
//e.g: IF motionSensor1 = 1 THEN light1 = 1

export interface jsonDataType {
  sensorId: number,
  sensorTopic: string,
  retainedMessage: string,
  dateTimeRegistered: string,
}

interface automationContent {
  sensorId: number,
  key: string,
  operator: string,
  value: string
}

interface controlDeviceAutomation {
  chosenDevice: jsonDataType,
  automationContent: string[],
  triggerValue: string
}

export default function Home() {
  const {serverIp} = useServerIp();

  const [automationSearchList, setAutomationSearchList] = useState<controlDeviceAutomation[]>([]); //use in search function, tracking the search result
  const [searching, setSearching] = useState(false); //use in search function, tracking the search result
  const [open, setOpen] = useState(false); //use in modal, tracking the modal status
  const [editing, setEditing] = useState(false); //use in editing mode, tracking the editing status
  const [automationList, setAutomationList] = useState<controlDeviceAutomation[]>([]);

  const [settingAutomation, setSettingAutomation] = useState(false);
  const [settingControlDevice, setSettingControlDevice] = useState<jsonDataType>({
    sensorId: 0,
    sensorTopic: '',
    retainedMessage: '',
    dateTimeRegistered: '',
  });

  async function fetchAutomationFromBackend() {
    try{
       //http://localhost:8081/testMQTT/getAutomation
      const res = await fetch(`${serverIp}/testMQTT/fetchAutomation`);
      const automations = await res.json();
      
      console.log(automations);
      automations.forEach((automation: any) => {
        
        const automationToAdd : controlDeviceAutomation = {
          chosenDevice: {
            sensorId: automation.sensorId,
            sensorTopic: automation.topic,
            retainedMessage: "",
            dateTimeRegistered: ""
          },
          automationContent: JSON.parse(automation.expression),
          triggerValue: automation.publishValue
        }
        setAutomationList((prevAutomationList) => [...prevAutomationList, automationToAdd]);        
      }
      )
    }
    catch(e){
      console.log(e);
      console.log('Failed to fetch automation');
      
    }
  }

  async function deleteAutomation(deviceId: number, automationContent: string[]){
    try{
      const expression = encodeURIComponent(JSON.stringify(automationContent));
      const Id = encodeURIComponent(deviceId);
      const res = await fetch( serverIp + '/testMQTT/deleteAutomation' + '?id=' + Id + '&expression=' + expression);
      console.log(res.body);
    }
    catch(e){
      console.log(e);
    }
  }

  async function saveAutomationToBackend(automation: controlDeviceAutomation) {
    try {
      const topic = encodeURIComponent(automation.chosenDevice.sensorTopic);
      const expression = encodeURIComponent(JSON.stringify(automation.automationContent));
      const publishValue = encodeURIComponent(automation.triggerValue);
      const deviceId = encodeURIComponent(automation.chosenDevice.sensorId);
      const res = await fetch(serverIp +'/testMQTT/addAutomation?topic=' + topic + '&expression=' + expression + '&publishValue=' + publishValue + '&deviceId=' + deviceId);
      console.log(res.body);
    } catch (e) {
      console.log(e);
    }
  }

  function searchDevice(searchValue: string) { //search controlDevice
    if (searchValue !== '') { //if searchValue is not empty, filter the controlDeviceList
      setSearching(true);
      const automationResult = automationList.filter((automationInfo) => automationInfo.chosenDevice.sensorTopic.toString().toLowerCase().includes(searchValue.toLowerCase()));
      setAutomationSearchList(automationResult);
      console.log("searched automation", automationResult);

    } else {
      console.log('searchValue is empty, should show all controlDevice');
      setSearching(false);
      setAutomationSearchList([]); //if searchValue is empty, clear the searchList
    }
  }

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { //close the modal and editing mode
    if ((e.target as HTMLDivElement).id === 'modal-shadow') {
      setOpen(false);
      setSettingAutomation(false);
    }
    if ((e.target as HTMLDivElement).id === 'control-page-body') {
      stopEditing();
    }
  };

  function deleteThisBox(deviceId: number, automationContent: string[]) { //delete a monitor box
    const newAutomationDeviceList = automationList.filter((automationInfo) => automationInfo.automationContent !== automationContent);
    setAutomationList(newAutomationDeviceList);
    deleteAutomation(deviceId,automationContent);
    console.log(newAutomationDeviceList);
  }

  function returnControlDevice(chosenControlDevice: jsonDataType) { //close the modal and return the chosen control device
    setSettingControlDevice(chosenControlDevice);
    setSettingAutomation(true);
  }


  function closeAutomationOptionAndAddAutomation(controlDeviceAutomation: controlDeviceAutomation) { //close the automation option and add the automation
    setSettingAutomation(false);
    setOpen(false);
    setAutomationList([...automationList, controlDeviceAutomation]);
    saveAutomationToBackend(controlDeviceAutomation);
    //send the automation to backend

  }

  function reverseEditing(editing: boolean) { //reverse the editing mode
    setEditing(!editing);
  }

  function stopEditing() {
    setEditing(false);
  }

  function closeModal() {
    setOpen(false)
    setSettingAutomation(false);
  }
  function openModal() {
    setOpen(true)
  }

  useEffect(() => {
    fetchAutomationFromBackend();
  }, [])

  return (
    <div className="flex flex-col w-full">

      <SearchBar searchFunction={searchDevice} />

      <div id="automatio-page-body" className='h-full overflow-auto animate-fade-up bg-slate-200' onClick={onOverlayClick}>
        <div id='Heading and buttons' className='flex justify-between mx-4 my-5'>

          <div id='Heading - Control' className='text-4xl font-sans'>Automation</div>

          <div id='Two buttons' className='flex gap-x-7  text-white font-semibold'>

            <button className='flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 focus:bg-violet-800 focus:ring-purple-800 focus:ring hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500'
              onClick={openModal}>
              <BsPlusCircle className="text-xl" />

              <span className='flex-1'>
                add automation
              </span>

            </button>

            {open &&
              <div id="modal-shadow" className="flex justify-center items-center absolute inset-0 bg-gray-800 bg-opacity-60 w-full h-screen z-50 " onClick={onOverlayClick}>
                <div className=" bg-white shadow-xl rounded-xl text-black w-1/3 h-[70%] animate-fade-up animate-duration-[250ms] " onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col h-full">
                    <div id="title-and-close" className="flex justify-between text-2xl m-4">
                      <div>Add Automation - <span className=' text-blue-600'>{!settingAutomation ? "Choosing Device" : 'Setting'}</span></div>
                      <button onClick={closeModal} >
                        <MdClose />
                      </button>
                    </div>

                    <div className='border mx-4 border-gray-300 ' />

                    <div id="list-here" className="flex-grow m-5 overflow-hidden hover:overflow-y-scroll">
                      {!settingAutomation
                        ?
                        (controlDeviceList.length === 0 ? (
                          <div>No control device found, please add in 'devices-control' page</div>
                        ) : (
                          controlDeviceList.map((controlDeviceInfo: jsonDataType) => (
                            <AddedControlDevices
                              key={controlDeviceInfo.sensorId.toString()}
                              dateTimeRegistered={controlDeviceInfo.dateTimeRegistered}
                              retainedMessage={controlDeviceInfo.retainedMessage}
                              sensorId={controlDeviceInfo.sensorId}
                              sensorTopic={controlDeviceInfo.sensorTopic}
                              closeModal={returnControlDevice} />
                          ))
                        )
                        ) : (
                          <AutomationOption chosenDevice={settingControlDevice} closeAutomationOptionAndAddAutomation={closeAutomationOptionAndAddAutomation} />
                        )
                      }

                    </div>

                  </div>
                </div>
              </div>
            }

            <button className={`${automationList.length > 0 || editing ? 'cursor-pointer' : 'cursor-not-allowed'} ${editing ? 'bg-violet-800' : ''} flex items-center bg-blue-700 gap-x-4 rounded-md px-4 py-2 focus:bg-violet-800 focus:ring-purple-800 focus:ring hover:bg-blue-400 hover:rounded-xl cursor-pointer duration-500`}
              onClick={() => { if (automationList.length > 0 || editing) { reverseEditing(editing) } }}>
              <AiOutlineDelete className="text-xl" />

              <span className='flex-1'>
                delete automation
              </span>
            </button>

          </div>
        </div>
        <div className='border my-2 border-gray-400 mx-4 w-[36rem]' />

        <div className='flex flex-col m-5 gap-y-6'>


          <div className='grid gap-8 grid-cols-2 w-full'>

            {automationList.length === 0 ? (
              <div>No automation is set</div>
            ) : (
              searching ? (
                automationSearchList.length === 0 ? (
                  <div>No automation found</div>
                ) : (
                  automationSearchList.map((automationInfo: controlDeviceAutomation) => (
                    <AutomationBox
                      controlDeviceAutomation={automationInfo}
                      isEditing={editing}
                      deleteThisAutomationBox={() => deleteThisBox(automationInfo.chosenDevice.sensorId, automationInfo.automationContent)
                      }
                    />
                  ))
                )
              ) : (
                automationList.map((automationInfo: controlDeviceAutomation) => (
                  <AutomationBox
                    controlDeviceAutomation={automationInfo}
                    isEditing={editing}
                    deleteThisAutomationBox={() => deleteThisBox(automationInfo.chosenDevice.sensorId, automationInfo.automationContent)
                    }
                  />
                ))
              )
            )
            }


          </div>
        </div>

      </div>


    </div>
  )
}
