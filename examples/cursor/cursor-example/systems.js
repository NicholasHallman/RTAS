import { defineQuery } from "bitecs"
import { Position } from "./components.js"

const positionQuery = defineQuery([Position]);

export const movementSystem = world => {
    const entities = positionQuery(world);
    entities.forEach(eid => {
        // get client input
        const {x, y} = world.resources[eid]
        // set the component to the input
        Position.x[eid] = x;
        Position.y[eid] = y;
    });
    return world;
}