import { addComponent, addEntity, createWorld, defineComponent, defineSerializer, Types } from "bitecs";
import { performance } from 'perf_hooks';

const Position = defineComponent({
    x: Types.f32,
    y: Types.f32,
})

const world = createWorld();
const eids = [];
for (let i = 0 ; i < 500; i++){
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    eids.push(eid);
}

let start = performance.now()
for(let i = 0; i < 500; i++){
    const serialize = defineSerializer([Position]);
    serialize([eids[i]]);
}
console.log(`test 1 took ${performance.now() - start}`);


start = performance.now()
const serialize = defineSerializer([Position]);
serialize(eids);
console.log(`test 2 took ${performance.now() - start}`);