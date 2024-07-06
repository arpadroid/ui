import { I18nTool } from '@arpadroid/i18n';

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
        if (!this.getAttribute('type')) {
            this.setAttribute('type', 'button');
        }
    }

    update() {
        this.render();
    }

    render() {
        this.innerHTML = I18nTool.processTemplate(this.template, {
            content: this._content || this.getAttribute('content'),
            icon: this.getAttribute('icon'),
            iconRight: this.getAttribute('icon-right')
        });
    }
}
customElements.define('arpa-button', Button, { extends: 'button' });
export default Button;
