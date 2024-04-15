"use client"
import Image from 'next/image'
import { BiSearch } from 'react-icons/bi';
import Stomp from 'stompjs';
import { Message } from 'stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { useServerIp } from './backendIpContext';


export default function Home() {
  const {serverIp ,setServerIp} = useServerIp();
  const [serverIpInput, setServerIpInput] = useState('');

  function handleFormSubmit (e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setServerIp(serverIpInput);
  }

  function handleServerIpChange (e: React.ChangeEvent<HTMLInputElement>){
    setServerIpInput(e.target.value);
  }
    

  return (
    <div className="flex flex-col w-full">

      <div className='overflow-auto animate-fade-up bg-slate-200 h-full'>
        <div className='text-5xl mx-3 my-5 font-sans'>Home</div>
        <div className='border my-2 border-gray-400 mx-4 w-[36rem]' />

        <form onSubmit={(e)=>{handleFormSubmit(e)}}>
          <div className='flex flex-col justify-center m-5 gap-y-6 bg-white p-4 shadow-xl rounded-lg'>
            <div className='text-3xl'>Setting Backend Server IP</div>
            <div className='text-xl font-mono'>current IP: <span className=' font-extrabold'>{serverIp}</span></div>
            <TextInput type='url' required placeholder='http://localhost:8081' onChange={(e)=>{handleServerIpChange(e)}} />
            <Button type='submit' className='bg-blue-500 text-white'>Set</Button>
          </div>
        </form>


        <div className='border my-2 border-black mx-5' />



      </div>


    </div>
  )
}
