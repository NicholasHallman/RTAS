

// a threaded system declaration could look like this
import { Worker, isMainThread, parentPort } from 'worker_threads';
import { defineQuery } from "bitecs"

/*
threadedSystem( [Position], (eid, comps) => {
    const [Position] = comps;
    Position.x[eid] = 10;
    Position.y[eid] = 10;
})
*/

let workerPool = [];
let workerStatus = [];

if(isMainThread) {
    for (let i = 0; i < 5; i++){
        const flagArr = new Uint8Array(new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT));
        workerStatus.push(flagArr);
        const worker = new Worker("./src/backend/threaded.js");
        workerPool.push(worker);
    }
} else {
    // thread handler
    parentPort.on('message', ({func, eids, comps, flag}) => {
        for(let i = 0; i < eids.length; i++) {
            eval(func)(eids[i], comps);
        }
        flag[0] = 1;
    })
}

const resetWorkerStatus = () => {
    workerStatus.forEach(arr => arr[0] = 1);
}

const areWorkersFinished = () => {
    return workerStatus.reduce((acc, cur) => acc = cur[0] && acc, 1);
}

export const threadedSystem = (queryComp, func) => world => {
    resetWorkerStatus();
    
    const query = defineQuery(queryComp);
    const eids = query(world);

    let assigned = 0;
    let currentWorker = 0;
    let numToAssign = 10;

    if(eids.length > 50) {
        numToAssign = Math.ceil(eids.length / 5);
    }
    // give each worker 10 or more eids till there are 0 eids;
    while (assigned < eids.length) {
        const range = Math.min(numToAssign, eids.length - assigned);
        const partialEids = eids.slice(assigned, assigned + range);
        workerStatus[currentWorker][0] = 0;
        workerPool[currentWorker].postMessage({
            func: func.toString(),
            eids: partialEids,
            comps: queryComp,
            flag: workerStatus[currentWorker]
        });
        assigned += range;
        currentWorker += 1;
    }

    // block execution while everything resolves
    while(!areWorkersFinished()) {}

    return world;
}


