import { defineQuery, defineSerializer } from "bitecs"
import { Networked } from "./components.js"

const networkedQuery = defineQuery([Networked]);

export const serializeAndSend = world => {

    const ents = networkedQuery(world);
    const networkedEntities = {};
    ents.forEach(eid => {
        const components = [];
        (new Set(Networked.componentIds[eid])).forEach(compId => {
            if(compId === 0) return;
            const comp = world.rtas.plugin.getComponent(compId)[0];
            components.push(
                Object.keys(comp).reduce((obj, key) => {
                    obj[key] = comp[key][eid];
                    return obj;
                }, {})
            );
        })
        networkedEntities[eid] = components;
    })

    world.rtas.broadcast(networkedEntities);

    return world;
}