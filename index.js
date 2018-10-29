"use strict";

const Docker = require("dockerode");
const fs = require("fs");
const util = require("util");
const readline = require("readline");

const readFile = util.promisify(fs.readFile);

process.on("SIGINT", () => {
    // ctrl+c
    console.log("Quiting...")
    process.exit()
});

main().catch(e => console.log(e));

async function main() {
    if (process.platform === "win32") {
        const rl = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });
    
        rl.on("SIGINT", () => process.emit("SIGINT"));
    }

    const [ caContents, certContents, keyContents ] = await Promise.all([
        readFile("./ca.pem"),
        readFile("./client-cert.pem"),
        readFile("./client-key.pem")
    ]);

    console.log(caContents);
    console.log(certContents);
    console.log(keyContents);
    
    const docker = new Docker({
        protocol: "https",
        host: "docker_server",
        port: process.env.DOCKER_PORT || 2376,
        ca: caContents,
        cert: certContents,
        key: keyContents,
        version: "v1.37" // required when Docker >= v1.13, https://docs.docker.com/engine/api/version-history/
    });
    
    const container = docker.getContainer("xxx");
    
    try 
    {
        const response = await container.inspect();
        console.log("OK");
        console.log(response);
    }
    catch(e) 
    {
        console.log("ERROR");
        console.log(e);
    }

    // docker.
}

// choco uninstall docker --confirm && choco install docker --confirm