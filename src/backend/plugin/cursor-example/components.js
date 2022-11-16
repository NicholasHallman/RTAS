import { defineComponent, Types } from "bitecs";

const Vector2 = {
    x: Types.i16,
    y: Types.i16,
};

const ColorComp = {
    r: Types.ui8,
    g: Types.ui8,
    b: Types.ui8,
}

export const Position = defineComponent(Vector2);
export const Color = defineComponent(ColorComp);