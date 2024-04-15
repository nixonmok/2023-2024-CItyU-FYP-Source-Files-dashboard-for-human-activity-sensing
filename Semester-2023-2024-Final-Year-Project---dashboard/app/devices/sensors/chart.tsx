import React, { use, useEffect, useState } from 'react';


//interface import
import { chartValue } from '@/app/devices/sensors/barPieChartOption';
import BarChart from './charts/barChart';
import GaugeChart from './charts/gaugeChart';
import LineChart from './charts/lineChart';
import NumberChart from './charts/number';
import PieChart from './charts/pieChart';
import ScatterChart from './charts/scatterChart';


interface chartProps {
  type: string,
  parameters: string,
  data: string,
  chartValues: chartValue[],
  sensorId: Number,
  receivedTime: EpochTimeStamp
}




export default function chart(chartProps: chartProps) {

  return (
    <>
    {
      chartProps.type === 'Bar Chart' ? <BarChart receivedTime={chartProps.receivedTime} parameters={chartProps.parameters} neededData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/> 
      : chartProps.type === 'Pie Chart' ? <PieChart receivedTime={chartProps.receivedTime} parameters={chartProps.parameters} neededData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/>
      : chartProps.type === 'Line Chart' ? <LineChart receivedTime={chartProps.receivedTime} parameters={chartProps.parameters} neededData={chartProps.data} sensorId={chartProps.sensorId} />
      : chartProps.type === 'Gauge Chart' ? <GaugeChart receivedTime={chartProps.receivedTime} parameters={chartProps.parameters} neededData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/>
      : chartProps.type === 'Scatter Chart' ? <ScatterChart receivedTime={chartProps.receivedTime} parameters={chartProps.parameters} neededData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/>
      : <NumberChart receivedTime={chartProps.receivedTime} parameters={chartProps.parameters} neededData={chartProps.data} sensorId={chartProps.sensorId} chartValue={chartProps.chartValues}/>
    }
    </>
  )
}