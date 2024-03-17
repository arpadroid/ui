import { processTemplate } from '@arpadroid/tools';

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
        this._content = this.innerHTML;
        this._childNodes = [...this.childNodes];
        this.render();
    }

    update() {
        this.render();
    }

    attributeChangedCallback() {
        // abstract
    }

    render() {
        this.innerHTML = processTemplate(this.template, {
            content: this._content,
            icon: this.getAttribute('icon'),
            iconRight: this.getAttribute('icon-right')
        });
    }
}
customElements.define('arpa-button', Button, { extends: 'button' });
export default Button;
