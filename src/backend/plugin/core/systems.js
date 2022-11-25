import { defineQuery, defineSerializer } from "bitecs"
import { Client, Networked } from "./components.js"
import { performance } from 'perf_hooks';
const networkedQuery = defineQuery([Networked]);
const clientQuery = defineQuery([Client]);

const concatBuffer = (buffer1, buffer2) => {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

let startTime;

const timer = {
    start: () => {
        startTime = performance.now();
    },
    end: (term) => {
        console.log(`${term} took: ${performance.now() - startTime}`);
    }
}

export const serializeNetworkedEntities = world => {

    const groups = [new ArrayBuffer(), new ArrayBuffer(), new ArrayBuffer(), new ArrayBuffer(), new ArrayBuffer(), new ArrayBuffer(), new ArrayBuffer(), new ArrayBuffer()];
    const ents = networkedQuery(world);

    for(let i = 0; i < ents.length; i++){
        const eid = ents[i];

        const serializer = world.rtas.plugin.networkedSerializers[eid];
        const packet = serializer([eid]);

        for(let bit = 0; bit < 8; bit++) {
            if (Networked.groupMask[eid] >> bit & 1 === 1) {
                groups[bit] = concatBuffer(groups[bit], packet);
            }
        }
    }

    return {world, groups};
}

export const sendPackets = ({world, groups}) => {

    const clientEids = clientQuery(world);
    const eidGroups = clientEids.reduce((acc, eid) => {
        const groupId = Client.group[eid]
        acc[groupId].push(eid);
        return acc;
    }, [[],[],[],[],[],[],[],[]]);

    groups.forEach((packets, groupId) => {
        world.rtas.broadcastClients(eidGroups[groupId], packets, true);
    })
}
