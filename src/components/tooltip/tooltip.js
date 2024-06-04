import { attr, resolveNode } from '@arpadroid/tools';
import IconButton from '../iconButton/iconButton.js';

class Tooltip extends HTMLElement {
    static get observedAttributes() {
        return ['text', 'handler', 'icon', 'label'];
    }

    constructor() {
        super();
        this._initializeProperties();
        this.render();
    }

    _initializeProperties() {
        this.content = this.innerHTML;
        this._childNodes = Array.from(this.childNodes);
        this.text = this.getAttribute('text');
        const handler = this.getAttribute('handler');
        this.handler = resolveNode(handler);
        this.icon = this.getAttribute('icon') ?? 'info';
        this.label = this.getAttribute('label');
    }

    render() {
        this._initializeProperties();
        this.innerHTML = '';
        if (!this._childNodes?.length) {
            this.remove();
            return;
        }
        if (!this.handler) {
            this.button = this.renderButton();
            this.appendChild(this.button);
        }
        this.contentNode = this.renderContent();
        this.appendChild(this.contentNode);
        this.classList.add('tooltip', `tooltip--${this.getPosition()}`);
    }

    getPosition() {
        return this.getAttribute('position').trim() || 'top';
    }

    renderContent() {
        const content = document.createElement('span');
        attr(content, {
            class: 'tooltip__content',
            role: 'tooltip',
            'aria-hidden': 'true',
            'aria-describedby': this.handler?.id ?? this?.button?.id
        });
        content.append(...this._childNodes);
        return content;
    }

    renderButton() {
        if (this.icon) {
            const button = new IconButton();
            button.classList.add('tooltip__button');
            button.setAttribute('type', 'button');
            button.setAttribute('variant', 'minimal');
            button.innerHTML = this.icon;
            if (this.label) {
                button.textContent = this.label;
            }
            return button;
        }
    }
}

customElements.define('arpa-tooltip', Tooltip);

export default Tooltip;
