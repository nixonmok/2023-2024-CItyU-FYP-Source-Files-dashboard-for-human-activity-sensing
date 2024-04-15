import React, { use, useEffect, useState } from 'react';


//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';
import BarChart from './charts/barChart';
import LineChart from './charts/lineChart';
import PieChart from './charts/pieChart';
import ScatterChart from './charts/scatterChart';
import { payloadFromDatabase } from './analysisBox';


interface chartProps {
  type: string,
  parameters: string,
  data: payloadFromDatabase[],
  chartValues: chartValue[],
  sensorId: Number,
}

export default function chart(chartProps: chartProps) {

  return (
    <>
    {
      chartProps.type === 'Bar Chart' ? <BarChart  parameters={chartProps.parameters} dataBaseData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/> 
      : chartProps.type === 'Pie Chart' ? <PieChart  parameters={chartProps.parameters} dataBaseData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/>
      : chartProps.type === 'Line Chart' ? <LineChart  parameters={chartProps.parameters} dataBaseData={chartProps.data} sensorId={chartProps.sensorId} />
      :  <ScatterChart  parameters={chartProps.parameters} dataBaseData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/>
    }
    </>
  )
}