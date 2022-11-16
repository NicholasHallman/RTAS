import { defineQuery } from "bitecs"
import { Bounds, Heading, Position, Speed } from "./components.js"

const ballQuery = defineQuery([Position, Heading, Speed]);
const boundsQuery = defineQuery([Bounds]);

export const moveBalls = world => {
    const ballEntities = ballQuery(world);
    const boundEid = boundsQuery(world)[0];
    const bx = Bounds.x[boundEid];
    const by = Bounds.y[boundEid];
    const width = Bounds.width[boundEid];
    const height = Bounds.height[boundEid];

    for(let i = 0; i < ballEntities.length; i++){
        const eid = ballEntities[i];
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
            newX = Position.x[eid] = x + (ax * speed);
            newY = Position.y[eid] = y + (ay * speed);
        }

        Position.x[eid] = newX;
        Position.y[eid] = newY;
        Heading.ax[eid] = ax;
        Heading.ay[eid] = ay;
    }
}