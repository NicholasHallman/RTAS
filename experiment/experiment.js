import { DESERIALIZE_MODE } from "bitecs";
import { defineQuery } from "bitecs";
import { addComponent, addEntity, createWorld, defineComponent, defineDeserializer, defineSerializer, registerComponent, Types } from "bitecs";

const Position = defineComponent({
    x: Types.ui16,
    y: Types.ui16
});

const Color = defineComponent({
    r: Types.ui8,
    g: Types.ui8,
    b: Types.ui8
})

let world = createWorld();
let netWorld = createWorld();

let eid = addEntity(world);
let eid2 = addEntity(world);
addComponent(world, Position, eid);
addComponent(world, Color, eid);

Position.x[eid] = 10;
Position.y[eid] = 10;

Color.r[eid] = 255;
Color.g[eid] = 255;
Color.b[eid] = 255;

Position.x[eid2] = 15;
Position.y[eid2] = 15;

Color.r[eid2] = 25;
Color.g[eid2] = 25;
Color.b[eid2] = 25;

const serializer = defineSerializer([Position]);
const deserializer = defineDeserializer();

const packet = serializer([eid]);
deserializer(netWorld, packet, DESERIALIZE_MODE.MAP);

const posQuery = defineQuery(Position);
const colQuery = defineQuery(Color);
const eids = posQuery(world);
const netEids = posQuery(netWorld);
const netColorEids = colQuery(netWorld);

console.log("og", [...eids].map(eid => [ Position.x[eid], Position.y[eid] ]), "net", [...netEids].map(eid => [ Position.x[eid], Position.y[eid] ]));
console.log("og", [...eids].map(eid => [ Color.r[eid], Color.g[eid], Color.b[eid] ]), "net", [...netEids].map(eid => [ Color.r[eid], Color.g[eid], Color.b[eid] ]));