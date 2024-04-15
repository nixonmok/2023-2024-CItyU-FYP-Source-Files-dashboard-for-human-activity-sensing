'use client'
import { createContext, useContext, useState } from 'react';

const ServerIpContext = createContext({});

export const useServerIp = () => useContext(ServerIpContext);

export const ServerIpProvider = ({ children }: { children: React.ReactNode }) => {
  const [serverIp, setServerIp] = useState('http://localhost:8081');

  const value = {
    serverIp,
    setServerIp,
  };

  return <ServerIpContext.Provider value={value}>{children}</ServerIpContext.Provider>;
};