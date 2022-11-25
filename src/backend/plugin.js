import { defineSerializer, defineDeserializer, removeEntity, addEntity } from "bitecs";
import { TYPES } from "./consts.js";
import { Networked } from "./plugin/core/components.js";

export class RTASPlugin {

    constructor(world) {
        this.world = world;
        this.world.resources = {};
        this.registeredNetworkComponents = new Map();
        this.entityRegistrationCache = {};
        this.schemasToSend = [];
        this.debounced = {};
        this.networkedSerializers = {};
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

    afterConnect() {
        return [...this.registeredNetworkComponents].map(([comp]) => this.generateComponentSchema(comp));
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

    /*
    options: {
        groupMask: bin`00000000`,
        components: [Position, Speed]
    }
    */

    addNetworkedComponents(eid, options) {
        
        // map each component to an ID
        Networked.componentIds[eid].set(
            options.components
                .map(obj => this.getComponentId(obj))
        );
        // set the group mask
        Networked.groupMask[eid] = options.groupMask;

        this.networkedSerializers[eid] = defineSerializer(options.components);
    }

    /*
    options: {
        "Position": Position
    }
    */
    registerNetworkedComponents(options) {
        Object.entries(options)
            .forEach(([name, component]) => this.registerNetworkedComponent(component, name));
    }

    registerNetworkedComponent(Component, name) {
        this.registeredNetworkComponents.set(Component, name);
        this.sendComponentSchema(this.generateComponentSchema(Component));
    }

    sendComponentSchema(schema) {
        this.schemasToSend.push(schema);
        if(this.debounced["sendComponentSchema"] !== undefined) 
            clearTimeout(this.debounced["sendComponentSchema"]);

        this.debounced["sendComponentSchema"] = setTimeout(() => {
            this.world.rtas.broadcast(this.schemasToSend);
            this.debounced["sendComponentSchema"] = undefined;
        }, 20)
    }

    generateComponentSchema(Component) {
        
        const schema = Object.keys(Component).reduce((acc, key) => {
            const typeName = TYPES[Component[key].constructor.name];
            acc[key] = typeName;
            return acc;
        }, {});

        return {
            name: this.registeredNetworkComponents.get(Component),
            schema
        }
    }

}