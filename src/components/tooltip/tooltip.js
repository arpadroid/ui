import { resolveNode } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Tooltip extends ArpaElement {
    static get observedAttributes() {
        return ['text', 'handler', 'icon', 'label'];
    }

    initializeProperties() {
        super.initializeProperties();
        this.handler = this.getHandler();
    }

    getDefaultConfig() {
        return {
            text: '',
            handler: '',
            icon: '',
            label: '',
            position: 'top'
        };
    }

    getHandler() {
        const handler = this.getProperty('handler');
        return handler && resolveNode(handler);
    }

    getPosition() {
        return this.getProperty('position')?.trim() ?? 'top';
    }

    render() {
        this.innerHTML = '';
        if (!this._childNodes?.length) {
            this.remove();
            return;
        }
        const text = this.getProperty('text');
        const template = html`
            ${this.renderButton()}
            <span slot="content" class="tooltip__content" role="tooltip" aria-hidden="true">${text}</span>
        `;
        this.innerHTML = template;
        this.classList.add('tooltip', `tooltip--${this.getPosition()}`);
        this.contentNode = this.querySelector('.tooltip__content');
        this.button = this.querySelector('.tooltip__button');
    }

    setContent(content) {
        if (this.contentNode) {
            this.contentNode.innerHTML = content;
        }
    }

    renderButton() {
        return !this.handler
            ? html`<button
                  slot="handler"
                  is="icon-button"
                  class="tooltip__button"
                  type="button"
                  variant="minimal"
                  icon="${this.getProperty('icon')}"
              ></button>`
            : '';
    }
}

customElements.define('arpa-tooltip', Tooltip);

export default Tooltip;
