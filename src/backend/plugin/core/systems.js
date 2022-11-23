import { defineQuery, defineSerializer } from "bitecs"
import { Client, Networked } from "./components.js"
const networkedQuery = defineQuery([Networked]);
const clientQuery = defineQuery([Client]);

export const serializeNetworkedEntities = world => {
    const groups = [[],[],[],[],[],[],[],[]];

    const ents = networkedQuery(world);
    ents.forEach(eid => {
        const components = [...Networked.componentIds[eid]]
            .filter(compId => compId !== 0)
            .map(world.rtas.plugin.getComponent.bind(world.rtas.plugin))
            .map(comp => comp[0]);
        if(components.length === 0) return;
        const serializer = defineSerializer(components);
        const packet = Buffer.from(serializer([eid])).toString("base64");

        // place the packet in the proper group
        for(let bit = 0; bit < 8; bit++) {
            if (Networked.groupMask[eid] >> bit & 1 === 1) {
                groups[bit].push(packet);
            }
        }
    });

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
        world.rtas.broadcastClients(eidGroups[groupId], packets);
    })
}
