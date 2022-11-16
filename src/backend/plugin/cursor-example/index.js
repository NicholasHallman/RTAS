import { Color, Position } from './components.js';
import { Networked } from '../core/components.js';
import { movementSystem } from './systems.js';
import { RTASPlugin } from '../../plugin.js';
import { addComponent, addEntity } from 'bitecs';
import { colors } from './consts.js';
import { RESOURCE_UPDATE } from '../core/symbols.js'

export default class LiveCursor extends RTASPlugin {

    get schedule() {
        return RESOURCE_UPDATE;
    }
    get pipeline() {
        return [movementSystem]
    }

    connect(restoreEid) {
        const eid = super.connect(restoreEid);
        const world = this.world;
        addComponent(world, Color, eid);
        addComponent(world, Position, eid);
        addComponent(world, Networked, eid);

        // pick a color
        const color = colors[eid];
        // populate the colors
        Color.r[eid] = parseInt(color.substring(0,2), 16); 
        Color.g[eid] = parseInt(color.substring(2,4), 16); 
        Color.b[eid] = parseInt(color.substring(4), 16); 
        // populate the position
        Position.x[eid] = 0;
        Position.y[eid] = 0;

        Networked.componentIds[eid].set([
            this.getComponentId(Color),
            this.getComponentId(Position)
        ]);

        return eid;
    }
}