import { addComponent, addEntity } from "bitecs";
import { RTASPlugin } from "../../../src/backend/plugin.js";
import { Client, Networked } from "../../../src/backend/plugin/core/components.js";
import { TICK } from "../../../src/backend/plugin/core/symbols.js";
import { Bounds, Heading, Position, Speed } from "./components.js";
import { moveParticles } from "./systems.js";

let numConnected = -1;

export default class Particles extends RTASPlugin {

    get schedule() {
        return TICK
    }

    get pipeline() {
        return [moveParticles]
    }

    start() {
        // create stage
        const stageEid = addEntity(this.world);
        addComponent(this.world, Bounds, stageEid);
        Bounds.x[stageEid] = 0;
        Bounds.y[stageEid] = 0;
        Bounds.width[stageEid] = 500;
        Bounds.height[stageEid] = 500;

        this.registerNetworkedComponents({
            "Position": Position
        });

        // create particles
        for(let group = 0; group < 3; group ++){
            for(let i = 0; i < 5; i++) {
                const eid = addEntity(this.world);
                addComponent(this.world, Position, eid);
                addComponent(this.world, Heading, eid);
                addComponent(this.world, Speed, eid);
                addComponent(this.world, Networked, eid);
                
                Position.x[eid] = 250;
                Position.y[eid] = 250;
    
                let heading = ((Math.random() * Math.PI) * 2) - Math.PI;
                Heading.ax[eid] = Math.sin(heading);
                Heading.ay[eid] = Math.cos(heading);
                
                Speed.value[eid] = (Math.random() * 2) + 0.5;
                
                this.addNetworkedComponents(eid, {
                    groupMask: 2 ** group, // 00000001 00000010 00000100
                    components: [ Position ]
                })
            }
        }
    }

    connect(restoreEid) {
        const eid = super.connect(restoreEid);
        numConnected += 1;
        addComponent(this.world, Client, eid);
        Client.group[eid] = numConnected % 3;
        return eid;
    }
}