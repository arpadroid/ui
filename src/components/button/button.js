import { processTemplate } from '../../utils/uiTool.js';

const html = String.raw;
class Button extends HTMLButtonElement {
    template = html`
        <arpa-icon className="button__lhsIcon">{icon}</arpa-icon>
        <span class="button__content">{content}</span>
        <arpa-icon class="button__rhsIcon">{iconRight}</arpa-icon>
    `;

    static get observedAttributes() {
        return ['icon-right', 'icon'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = processTemplate(this.template, {
            content: this.innerHTML,
            icon: this.getAttribute('icon'),
            iconRight: this.getAttribute('icon-right')
        });
    }
}
customElements.define('arpadroid-ui', Button, { extends: 'button' });
export default Button;
