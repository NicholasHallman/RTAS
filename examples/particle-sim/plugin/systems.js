import { defineQuery } from "bitecs"
import { threadedSystem } from "../../../src/backend/threaded.js";
import { Bounds, Heading, Position, Speed } from "./components.js"

const particleQuery = defineQuery([Position, Heading, Speed]);
const boundsQuery = defineQuery([Bounds]);

export const moveParticles = world => {
    const particleEntities = particleQuery(world);
    const boundEid = boundsQuery(world)[0];
    const bx = Bounds.x[boundEid];
    const by = Bounds.y[boundEid];
    const width = Bounds.width[boundEid];
    const height = Bounds.height[boundEid];

    for(let i = 0; i < particleEntities.length; i++){
        const eid = particleEntities[i];
        const x = Position.x[eid];
        const y = Position.y[eid];
        let ax = Heading.ax[eid];
        let ay = Heading.ay[eid];
        const speed = Speed.value[eid];

        let newX = x + (ax * speed);
        let newY = y + (ay * speed);

        let changed = false;
        if (newX < bx || newX > bx + width) {
            // bounce, hit the left
            ax *= -1;
            changed = true;
        }
        if (newY < by || newY > by + height) {
            // bounce, hit the top
            ay *= -1;
            changed = true;
        }

        if(changed) {
            newX = x + (ax * speed);
            newY = y + (ay * speed);
        }

        Position.x[eid] = newX;
        Position.y[eid] = newY;
        Heading.ax[eid] = ax;
        Heading.ay[eid] = ay;
    }

    return world;
}

export const testThread = threadedSystem([Position, Heading, Speed], (eid, comps) => {
    const [Position, Heading, Speed] = comps;
    Position.x[eid] = 250;
});