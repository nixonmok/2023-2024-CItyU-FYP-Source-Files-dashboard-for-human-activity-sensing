"use client"
import Link from 'next/link';
import './Navbar.css';

import { FaHome } from "react-icons/fa";
import { FaMapMarkedAlt } from 'react-icons/fa';
import { BiSidebar, BiTerminal,BiLogOut } from 'react-icons/bi';
import { AiFillDashboard, AiFillCaretDown, AiOutlineSetting} from 'react-icons/ai';
import { TbSettingsAutomation } from 'react-icons/tb';
import { VscGraphLine } from 'react-icons/vsc';
import { IoChevronBackSharp } from 'react-icons/io5';
import { FcElectricalSensor } from 'react-icons/fc';
import { MdSensors } from 'react-icons/md';
import { RiAlarmWarningLine } from 'react-icons/ri';
import { RiBaseStationFill } from "react-icons/ri";

import { FC } from 'react';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavIconProps {
  icon: React.ReactNode;
}


const NavIcon: FC<NavIconProps> = ({ icon }) => {
  return <div>{icon}</div>;
};

const navItems = [
  {
    url: "/",
    text: "Home",
    NavIcon: <FaHome />
  },
  {
    url: "/devices",
    text: "Devices",
    NavIcon: <BiSidebar />,
    haveSubItem: true,
    subItems: [
      {
        url: "/sensors",
        text: "Sensors",
        NavIcon: <MdSensors />
      },
      {
        url: "/control",
        text: "Control",
        NavIcon: <RiAlarmWarningLine />
      },
    ]
  },
  {
    url: "/statistics",
    text: "Statistics",
    NavIcon: <VscGraphLine />
  },
  {
    url: "/CSI",
    text: "CSI",
    NavIcon: <RiBaseStationFill />
  },
  {
    url: "/automation",
    text: "Automation",
    NavIcon: <TbSettingsAutomation />
  },
  

]

const copyLink = (link: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  navigator.clipboard.writeText(link);
};

//mr = margin right
function Navbar() {
  const [expand, setExpand] = useState(true);
  const [deviceExpand, setDeviceExpand] = useState(true)
  const router = useRouter()

  const handleSidebar = () => {
    console.log('Clicked'); //not working on macbook --> try on mac mini
    setExpand(!expand);
    setDeviceExpand(false)
  };

  const openSubmenu = () => {
    setDeviceExpand(!deviceExpand)
  }

  return (
    <div
      className={`flex flex-col bg-gray-900 text-gray-400 ${expand ? 'w-72' : 'w-20'
        } duration-700 relative scroll-auto`}
    >


      <div className={`flex m-3 ${expand && "justify-between"} justify-center items-center`}>

        <div className={`flex items-center gap-x-2 ${!expand && "hidden"} animate-fade-right`}>

          <span className='block float-left text-orange-50 '>
            <FcElectricalSensor className='text-4xl' />
          </span>

          <span className={`text-xl `}>
            Sidebar
          </span>

        </div>

        <IoChevronBackSharp
          onClick={handleSidebar}
          className={`text-4xl cursor-pointer mr-2  ${!expand && "transform rotate-180"} duration-500 `}
        />

      </div>

      <div className='mt-2 ml-2 mr-4 border-b border-gray-500' />

      <div className="flex flex-col flex-1 mx-2 mt-5 text-sm">
        {navItems.map((item, index) => (
          <>
            <li key={index} className='flex items-center gap-6 cursor-pointer p-5 hover:bg-gray-800  mt-2 rounded-md' onClick={() => router.push(item.url)} >
              <span className='block text-2xl'>
                {item.NavIcon}
              </span>
              <span className={`${!expand && "hidden"} text-base flex-1 animate-fade-right animate-duration-700 animate-ease-out`}>
                {item.text}
              </span>
              {item.subItems && (
                <AiFillCaretDown onClick={openSubmenu} className={`text-xl ${!expand && "hidden"}  ${deviceExpand && "transform rotate-180"} duration-500`} />
              )}
            </li>


            <div className={`${deviceExpand ? "max-h-40" : "max-h-0 invisible"} transform duration-1000`}>
              {item.haveSubItem && deviceExpand && (
                <>
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className={`flex items-center gap-6 cursor-pointer py-2 px-12 hover:bg-gray-800  mt-2 rounded-md ${!deviceExpand && "hidden"} animate-fade-down`} onClick={() => router.push(item.url + subItem.url)}>
                      <span className='block float-left text-2xl'>
                        {subItem.NavIcon}
                      </span>
                      <span className={`${!expand && "hidden"} text-sm `}>
                        {subItem.text}
                      </span>
                    </li>
                  ))}
                </>
              )}
            </div>


          </>
        ))}
      </div>
      
      
    </div>
  );
}

export default Navbar;