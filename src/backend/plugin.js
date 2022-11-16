import { defineSerializer, defineDeserializer, removeEntity, addEntity } from "bitecs";


export class RTASPlugin {

    constructor(world) {
        this.world = world;
        this.world.resources = {};
        this.entityRegistrationCache = {};
    }

    get resources() {
        return this.world.resources;
    }

    start() {
        // called when the plugin is attached;
        return;
    }
    
    connect(eid) {
        if(eid !== undefined) {
            // reconnection, restore entity state;
            try {
                this.restore(eid);
                return eid;
            } catch(e) {
                console.log(`Couldn't restore session ${eid}`)
            }
        }
        // new session
        const newEid = addEntity(this.world);
        this.resources[newEid] = {};
        return newEid;
    }

    restore(eid) {
        const packet = this.entityRegistrationCache[eid];
        if(packet === undefined) throw new Error(`No cache serialization found for ${eid}`);
        this.restoreEntityState(this.entityRegistrationCache[eid]);
    }

    disconnect(eid) {
        const packet = this.dumpEntityState(eid);
        this.entityRegistrationCache[eid] = packet;
        removeEntity(this.world, eid);
    }

    message(eid, body) {
        console.log(`received an unhandled message from ${eid}`, body)
    }

    updateResource(eid, resource) {
        this.resources[eid] = {
            ...this.resources[eid],
            ...resource
        }
        return this.resources[eid];
    }

    setResource(eid, resource) {
        this.resources[eid] = resource;
        return this.resources[eid];
    }

    dumpEntityState(eid) {
        const serialize = defineSerializer(this.world);
        return serialize(eid);
    }

    restoreEntityState(packet) {
        const deserialize = defineDeserializer(this.world);
        deserialize(this.world, packet);
    }

    getComponentId(Component) {
        const componentMap = this.componentMap;
        const components = [...componentMap.values()];
        for(let i = 0; i < components.length; i++){
            const comp = components[i];
            if (comp.store === Component) return i + 1;
        }
        return undefined;
    }

    getComponent(Id) {
        return [...this.componentMap][Id - 1];
    }

    get componentMap() {
        if(this._cacheComponentMapSymbol === undefined) {
            this._cacheComponentMapSymbol = Object.getOwnPropertySymbols(this.world).find(symbol => symbol.toString() === "Symbol(componentMap)");
        }
        return this.world[this._cacheComponentMapSymbol];
    }

}