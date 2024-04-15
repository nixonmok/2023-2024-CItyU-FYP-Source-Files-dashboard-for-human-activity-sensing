import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { readFileSync } from "fs";


export async function POST(req: NextApiRequest, res: NextApiResponse) { //must return response
    const path = require('path');
    try {
        const bodyValue = await new Response(req.body).text();
        const bodyJson = JSON.parse(bodyValue); //https://github.com/vercel/next.js/discussions/54355

        const fs = require('fs');
        const fileContents = await fs.readFileSync(path.resolve(__dirname, "../../../../../app/devices/control/assets/addedControlList.json"), 'utf8');

        //add to addedcontrolDeviceList.json
        const jsonObj = JSON.parse(fileContents);
        jsonObj.push(bodyJson);
        fs.writeFileSync(path.resolve(__dirname, "../../../../../app/devices/control/assets/addedControlList.json"), JSON.stringify(jsonObj))

        return new Response(JSON.stringify(JSON.stringify(jsonObj)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        })

    }
    catch (err) {

        console.log("post fail", err);
        return NextResponse.json({ message: 'POST error' })
    }
}