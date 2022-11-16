import { addComponent, addEntity } from "bitecs";
import { RTASPlugin } from "../../plugin.js";
import { Networked } from "../core/components.js";
import { TICK } from "../core/symbols.js";
import { Bounds, Heading, Position, Speed } from "./components.js";
import { moveBalls } from "./systems.js";


export default class BouncingBalls extends RTASPlugin {


    get schedule() {
        return TICK
    }

    get pipeline() {
        return [moveBalls]
    }

    start() {
        // create stage
        const stageEid = addEntity(this.world);
        addComponent(this.world, Bounds, stageEid);
        Bounds.x[stageEid] = 0;
        Bounds.y[stageEid] = 0;
        Bounds.width[stageEid] = 500;
        Bounds.height[stageEid] = 500;

        // create balls
        for(let i = 0; i < 100; i++) {
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
            console.log(Heading.ax[eid], Heading.ay[eid]);
            Speed.value[eid] = (Math.random() * 2) + 0.5;

            Networked.componentIds[eid].set([
                this.getComponentId(Position)
            ]);
        }
    }


    connect(restoreEid) {
        const eid = super.connect(restoreEid);

        return eid;
    }
}