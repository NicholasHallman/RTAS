import { defineQuery, pipe } from 'bitecs';
import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { RTAS } from '../../../src/frontend/index.js';

class BouncingBalls extends LitElement {

    static get properties() {
        return {
            data: { attribute: false }
        }
    }

    static get styles() {
        return css`
            .ball {
                display: block;
                position: absolute;
                border-radius: 5px;
                width: 10px;
                height: 10px;
                background-color: blue;
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

    async worldUpdate() {
        this.Position = this.rtas.getComponent("Position");
        this.posQuery = defineQuery([this.Position])
        
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

        eids.forEach(eid => {
            const x = this.Position.x[eid];
            const y = this.Position.y[eid];

            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'blue';
            this.ctx.fill();
            this.ctx.stroke();
        })
    
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

customElements.define('bouncing-balls', BouncingBalls);