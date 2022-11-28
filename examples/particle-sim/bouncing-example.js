import { defineQuery, pipe } from 'bitecs';
import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { RTAS } from '../../../src/frontend/index.js';

class ParticleSim extends LitElement {

    static get properties() {
        return {
            color: { attribute: true }
        }
    }

    static get styles() {
        return css`
            :host {
                display: block;
                width: 500px;
                border: 1px solid;
                float:left;
                margin-right: 20px;
            }
        `;
    }

    constructor() {
        super();
        this.rtas = new RTAS('localhost:3000', this.worldUpdate.bind(this));
        this.hasFirstUpdated = false;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.rtas.connect();
    }

    worldUpdate() {
        this.Position = this.rtas.getComponent("Position");
        this.posQuery = defineQuery([this.Position]);
        
        this.requestUpdate();
    }

    firstUpdated() {
        super.firstUpdated();
        this.hasFirstUpdated = true;
        this.ctx = this.shadowRoot.querySelector('canvas').getContext('2d');
    }

    updateCanvas(world) {
        if(this.ctx === undefined || world === undefined) return;

        this.ctx.clearRect(0, 0, 500, 500);

        const eids = this.posQuery(world);

        for(let i = 0; i < eids.length; i++){
            const eid = eids[i];
            const x = this.Position.x[eid];
            const y = this.Position.y[eid];

            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    shouldUpdate() {
        super.shouldUpdate();
        this.updateCanvas(this.rtas.world);
        return !this.hasFirstUpdated;
    }

    render() {
        return html`
            <canvas width="500px" height="500px"></canvas>
        `;
    }
}

customElements.define('particle-sim', ParticleSim);