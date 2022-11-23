import { DESERIALIZE_MODE } from "bitecs";
import { addComponent, createWorld, defineComponent, defineDeserializer, registerComponent, Types } from "bitecs";
import { _base64ToArrayBuffer } from './helpers.js';

// Real Time Applications Service frontend interface.
const wait = async (delay) => new Promise(res => setTimeout(res, delay));

export class RTAS {
    constructor(url, updateCallback) {
        this.url = url;
        this.messageHandlers = {};
        this.connection;
        this.connected = false;
        this.eid;
        this.netComponents = {};
        this.updateCallback = updateCallback;
    }

    async waitForWorld() {
        if(this.netWorld !== undefined) return this.netWorld;
        new Promise((res, rej) => this.worldDef = {res, rej})
    }

    get world() {
        return this.netWorld;
    }

    async handleOpen(returnConnection) {
        this.connected = true;
        returnConnection(this.connection);

        this.connection.addEventListener('message', this.handleMessages.bind(this));

        this.connection.addEventListener('close', (e) => {
            // connection closed attempt to re-establish
            this.connected = false;
            this.connection.removeEventListener('message', this.handleMessages);
            this.handleReconnect();
        })

        const registerBody = {}
        if (this.eid !== undefined) {
            registerBody.eid = this.eid;
        }

        const result = await this.send("register", registerBody);
        this.eid = result.eid;
        this.schemaDefinitions = result.schemas;
        this.createNetworkWorld();
    }

    handleMessages(e) {
        const {id, result, action} = JSON.parse(e.data);
        if(action === 'update') {
            this.update(result);
        }
        if(this.messageHandlers[id]) this.messageHandlers[id](result);
    }

    async handleReconnect() {
        let tries = 0;
        let tryLimit = 20; 
        let delay = 10;
        let lastError;
        while(tries < tryLimit) {
            await wait(delay);
            try {
                return await this.connect({ retry: false })
            } catch(e) {
                tries += 1;
                delay *= 2;
                lastError = e;
                if (delay > 20000) {
                    delay = 20000;
                }
            }
        }
        return Promise.reject(lastError);
    }

    async connect({ retry = true } = {}) {
        let returnConnection;
        let returnError;
        this.connection = new WebSocket(`ws://${this.url}`);
        this.connection.addEventListener('open', () => this.handleOpen(returnConnection))
        this.connection.addEventListener('error', async e => {
            if (retry) {
                try {
                    const result = await this.handleReconnect();
                    returnConnection(result);
                } catch(e) {
                    returnError(e);
                }
            }
            returnError(e)
        })
        return new Promise((res, rej) => {
            returnConnection = res;
            returnError = rej;
        });
    }

    send(action, obj) {
        if(!this.connected) return Promise.reject("Not Connected");
        const id = crypto.randomUUID();
        this.connection.send(JSON.stringify({
            id,
            action,
            body: obj
        }))
        return new Promise(res => this.messageHandlers[id] = res);
    }

    async updateResource(diff) {
        return this.send('resource', {diff});
    }
    
    async setResource(full) {
        return this.send('resource', {full});
    }

    /* ecs stuff */

    createNetworkWorld() {
        this.netWorld = createWorld();
        if(this.worldDef !== undefined) this.worldDef.res(this.netWorld);
        this.schemaDefinitions.forEach(schemaObj => this.addNetworkComponent(schemaObj));
        this.deserializer = defineDeserializer(Object.values(this.netComponents));
    }

    addNetworkComponent(schemaObj) {
        const {name, schema} = schemaObj;
        const Comp = defineComponent(schema);
        this.netComponents[name] = Comp;
    }

    getComponent(name) {
        return this.netComponents[name];
    }

    update(result) {
        result.map(packetString => {
            const packet = _base64ToArrayBuffer(packetString);
            this.deserializer(this.netWorld, packet, DESERIALIZE_MODE.MAP);
        })
        if(this.updateCallback) {
            this.updateCallback()
        }
    }
}

