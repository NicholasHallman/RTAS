import { defineComponent, Types } from "bitecs";

export const Client = defineComponent({
    group: Types.ui8 // 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
})

export const Networked = defineComponent({
    componentIds: [Types.i32, 10],
    groupMask: Types.ui8 // 00000000 <- each bit represents one of the 8 groups.
});

export const NetworkedProxy = class {
    constructor(store, eid, plugin) {
        this._eid = eid;
        this.store = store;
        this.plugin = plugin;
    }

    set eid(eid) {
        this._eid = eid;
    }

    get componentIds() { return this.store.componentIds[this._eid] }
    set componentIds(comps) { 
        const compIds = comps.map(this.plugin.getComponentId.bind(this.plugin));
        this.store.componentIds[this._eid].set(compIds);
    }

    set group(group) {
        this.stores.group[this._eid] = group;
    }
}