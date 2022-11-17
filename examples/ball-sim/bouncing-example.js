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
        this.rtas = new RTAS('localhost:3000');
        this.rtas.update = this.propUpdate.bind(this);
        this.hasFirstUpdated = false;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.rtas.connect();
    }

    propUpdate(data) {
        this.data = data;
    }

    firstUpdated() {
        super.firstUpdated();
        this.hasFirstUpdated = true;
        this.ctx = this.shadowRoot.querySelector('canvas').getContext('2d');
    }

    updateCanvas() {
        if(this.ctx === undefined || this.data === undefined) return;
        this.ctx.clearRect(0, 0, 500, 500);
        
        Object.entries(this.data).forEach(([eid, compList]) => {
            this.ctx.beginPath();
            const pos = compList[0];
            this.ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'blue';
            this.ctx.fill();
            this.ctx.stroke();
        })
    }

    shouldUpdate() {
        super.shouldUpdate();
        this.updateCanvas();
        return !this.hasFirstUpdated;
    }

    render() {
        return html`
            <canvas width="500px" height="500px"></canvas>
        `;
    }
}

customElements.define('bouncing-balls', BouncingBalls);