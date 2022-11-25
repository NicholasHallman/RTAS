import { defineComponent, Types } from "bitecs";

const Vector2 = {
    x: Types.f32,
    y: Types.f32,
};

const Rectangle = { 
    x: Types.i16,
    y: Types.i16,
    width: Types.i16,
    height: Types.i16,
}

export const Position = defineComponent(Vector2);
export const Heading = defineComponent({ 
    ax: Types.f32,
    ay: Types.f32 
});

export const Speed = defineComponent({ value: Types.f32 });
export const Bounds = defineComponent(Rectangle);

export const BallGroup1 = defineComponent();
export const BallGroup2 = defineComponent();
export const BallGroup3 = defineComponent();