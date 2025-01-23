// @ts-ignore
import { appendNodes, processTemplate } from '@arpadroid/tools';

const html = String.raw;
class Button extends HTMLButtonElement {
    template = html`
        <arpa-icon class="button__lhsIcon">{icon}</arpa-icon>
        <span class="button__content">{content}</span>
        <arpa-icon class="button__rhsIcon">{iconRight}</arpa-icon>
    `;

    constructor() {
        super();
        this._content = this.innerHTML;
        this._childNodes = [...this.childNodes];
        this.render();
    }

    connectedCallback() {
        !this.getAttribute('type') && this.setAttribute('type', 'button');
    }

    update() {
        this.render();
    }

    render() {
        this.innerHTML = processTemplate(this.template, {
            content: this.getAttribute('content'),
            icon: this.getAttribute('icon'),
            iconRight: this.getAttribute('icon-right')
        });
        this.contentNode = this.querySelector('.button__content');
        appendNodes(this.contentNode, this._childNodes);
    }
}
customElements.define('arpa-button', Button, { extends: 'button' });
export default Button;
