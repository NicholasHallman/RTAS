import { createWorld, pipe } from 'bitecs';
import { serializeAndSend } from './plugin/core/systems.js';
import route from 'koa-route';
import { RESOURCE_UPDATE, TICK } from './plugin/core/symbols.js';


export class RTAS {
    constructor() {
        this.world = createWorld();
        this.world.room = {};
        this.world.rtas = this;
        this.pipeline;
        this.plugin;
    }

    async loadPlugin(pluginPath) {
        const Plugin = (await import(pluginPath)).default;
        this.plugin = new Plugin(this.world);
        this.plugin.start();
        this.pipeline = pipe(...this.plugin.pipeline);
        if(this.plugin.schedule === TICK) {
            setInterval(() => {
                this.run();
            }, 16);
        }
    }

    handleResource(ctx, messageBody, id) {
        let updatedResource;
        if (messageBody.diff !== undefined) {
            updatedResource = this.plugin.updateResource(ctx.session.eid, messageBody.diff)
        } else if(messageBody.full !== undefined) {
            updatedResource = this.plugin.setResource(ctx.session.eid, messageBody.full)
        }
    
        if (this.plugin.schedule === RESOURCE_UPDATE) {
            this.run();
        }
    
        ctx.websocket.send(JSON.stringify({
            result: updatedResource,
            action: "resource",
            id
        }));
    }
    
    handleRegister = (ctx, messageId, restoreEid) => {
        console.log(`restoring: ${restoreEid}?`);
        const eid = this.plugin.connect(restoreEid);
        console.log(`connected ${eid}`)
        ctx.session.eid = eid;
        this.world.room[eid] = ctx.websocket;
    
        ctx.websocket.send(JSON.stringify({
            result: eid,
            action: "register",
            id: messageId
        }));
    }
    
    handleUnRegister(ctx) {
        const { eid } = ctx.session;
        console.log(`disconnecting ${eid}`);
        this.plugin.disconnect(eid);
        delete this.world.room[eid];
    }

    run() {
        this.pipeline(this.world);
        pipe(serializeAndSend)(this.world);
    }

    broadcast(data) {
        Object.entries(this.world.room).forEach(([id, ws]) => {
            ws.send(JSON.stringify({
                action: "update",
                result: data
            }));
        });
    }

    middleware() {
        return route.all('/', async (ctx) => {
            console.log("registering events.");
        
            ctx.websocket.on("close", () => {
                this.handleUnRegister(ctx);
            });
        
            ctx.websocket.on("message", e => {
                const message = JSON.parse(e.toString());
                switch (message.action) {
                    case 'resource':
                        this.handleResource(ctx, message.body, message.id);
                        break;
                    case 'register':
                        this.handleRegister(ctx, message.id, message.body.eid);
                        break;
                    default:
                        return;
                }
            });
        });
    }
}