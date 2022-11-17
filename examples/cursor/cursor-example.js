import { css, html, LitElement, nothing } from 'lit';
import { RTAS } from '../../../src/frontend/index.js';

class ConnectionManager extends LitElement {

    static get properties() {
        return {
            data: { attribute: false }
        }
    }

    static get styles() {
        return css`
            .box {
                position: relative;
                width: 10px;
            }
        `;
    }

    constructor() {
        super();
        this.rtas = new RTAS('localhost:3000');
        this.rtas.update = this.propUpdate.bind(this);
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.rtas.connect();
        this.rtas.setResource({
            x: 0,
            y: 0,
        })
        this._handleMove = this.handleMove.bind(this);
        window.addEventListener('mousemove', this._handleMove);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        window.removeEventListener('mousemove', this._handleMove);
    }

    handleMove(e) {
        this.rtas.updateResource({
            x: e.clientX,
            y: e.clientY,
        })
    }

    propUpdate(data) {
        this.data = data;
    }

    toColor(colorObj) {
        const {r, b, g} = colorObj;
        return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;

    }

    render() {
        return html`
            ${this.data ? Object.entries(this.data).map(([eid, data]) => {
                if(Number(eid) === this.rtas.eid) return nothing;
                return html`
                    <img 
                        src="./cursor.png" 
                        class="box" 
                        style="top: ${data[1].y}px; left: ${data[1].x}px; background-color: ${this.toColor(data[0])}">
                    </img>`
            }) : nothing}
        `;
    }
}

customElements.define('cursor-manager', ConnectionManager);