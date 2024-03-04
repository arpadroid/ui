import { resolveNode } from '@arpadroid/tools';
import IconButton from '../iconButton/iconButton.js';

class Tooltip extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this._initializeProperties();
        this.innerHTML = '';
        if (!this.handler) {
            this.button = this.renderButton();
            this.appendChild(this.button);
        }
        this.contentNode = this.renderContent();
        this.appendChild(this.contentNode);
        this.classList.add('tooltip');
    }

    renderContent() {
        const content = document.createElement('span');
        content.classList.add('tooltip__content');
        content.append(...this._childNodes);
        return content;
    }

    renderButton() {
        if (this.icon) {
            const button = new IconButton();
            button.classList.add('tooltip__button');
            button.setAttribute('is', 'icon-button');
            button.innerHTML = this.icon;
            if (this.label) {
                button.textContent = this.label;
            }
            return button;
        }
    }

    _initializeProperties() {
        this.content = this.innerHTML;
        this._childNodes = Array.from(this.childNodes);
        this.text = this.getAttribute('text');
        this.handler = resolveNode(this.getAttribute('handler'));
        this.icon = this.getAttribute('icon') ?? 'info';
        this.label = this.getAttribute('label');
    }
}

customElements.define('arpa-tooltip', Tooltip);

export default Tooltip;
