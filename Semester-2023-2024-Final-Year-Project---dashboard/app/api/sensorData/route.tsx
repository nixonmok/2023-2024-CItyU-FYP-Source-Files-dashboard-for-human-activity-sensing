import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { readFileSync } from "fs";

export async function GET(req: NextApiRequest, res: NextApiResponse) {

  const path = require("path");
  try {
    const fs = require('fs')
    const fileContents = await fs.readFileSync(path.resolve(__dirname, "../../../../../app/devices/sensors/assets/addedSensorList.json"), 'utf8');
    const data = JSON.parse(fileContents);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log(err);

    return new Response(JSON.stringify({ message: 'Error reading file' }), {

      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}


export async function POST(req: NextApiRequest, res: NextApiResponse) { //must return response
  const path = require('path');
  try {
    const bodyValue = await new Response(req.body).text();
    const bodyJson = JSON.parse(bodyValue); //https://github.com/vercel/next.js/discussions/54355

    const fs = require('fs');
    const fileContents = await fs.readFileSync(path.resolve(__dirname, "../../../../../app/devices/sensors/assets/addedSensorList.json"), 'utf8');

    try {
      //subscribe to the topic (backend)
      console.log("triggered once subscribe sensors on POST /api/");

      console.log(`http://localhost:8081/testMQTT/subscribe?topic=${bodyJson.sensorTopic}&qos=2`);
      
      const res = await fetch(`http://localhost:8081/testMQTT/subscribe?topic=${bodyJson.sensorTopic}&qos=2`);

      //add to addedSensorList.json
      const jsonObj = JSON.parse(fileContents);
      jsonObj.push(bodyJson);
      fs.writeFileSync(path.resolve(__dirname, "../../../../../app/devices/sensors/assets/addedSensorList.json"), JSON.stringify(jsonObj))

      return new Response(JSON.stringify(JSON.stringify(jsonObj)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (e) {
      console.log("subscribe or write to file error", e);
      return NextResponse.json({ message: 'POST error, subscribe or write error' })
    }
  }
  catch (err) {

    console.log("post fail", err);
    return NextResponse.json({ message: 'POST error' })
  }
}

export async function DELETE(req: NextApiRequest, res: NextApiResponse) { //delete a object in addedSensorList.json
  const path = require('path');
  try {
    const bodyValue = await new Response(req.body).text();
    const bodyJson = JSON.parse(bodyValue); //https://github.com/vercel/next.js/discussions/54355

    const fs = require('fs');
    const fileContents = await fs.readFileSync(path.resolve(__dirname, "../../../../../app/devices/sensors/assets/addedSensorList.json"), 'utf8');
    console.log(fileContents);

    const jsonObj = JSON.parse(fileContents);
    const afterDelete = jsonObj.filter((toDelete: { sensorId: number; }) => toDelete.sensorId !== bodyJson.sensorId) //https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value

    fs.writeFileSync(path.resolve(__dirname, "../../../../../app/devices/sensors/assets/addedSensorList.json"), JSON.stringify(afterDelete))

    try{
      const res = await fetch(`http://localhost:8081/testMQTT/unsubscribe?topic=${bodyJson.sensorTopic}`);
      
    }
    catch (e) {
      console.log("unsubscribe error", e);
      return NextResponse.json({ message: 'DELETE error, unsubscribe error' })
    }

    return new Response(JSON.stringify(JSON.stringify(afterDelete)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  catch (err) {

    console.log("delete failed", err);
    return NextResponse.json({ message: 'DELETE error' })
  }
}



