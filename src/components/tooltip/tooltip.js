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
        return true;
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
        return (handler && resolveNode(handler, this)) || this.closest('button, a');
    }

    getPosition() {
        return this.getProperty('position')?.trim() ?? 'top';
    }

    render() {
        this.innerHTML = '';
        if (!this._childNodes?.length) {
            // this.remove();
            // return;
        }
        this.classList.add('tooltip', `tooltip--${this.getPosition()}`);
        const text = this.getProperty('text');
        const template = html`
            ${this.renderButton()}
            <span zone="tooltip-content" class="tooltip__content" role="tooltip" aria-hidden="true">
                ${text}
            </span>
        `;
        this.innerHTML = template;
    }

    _initializeNodes() {
        this.contentNode = this.querySelector('.tooltip__content');
        this.button = this.querySelector('.tooltip__button');
    }

    /**
     * Sets the tooltip content.
     * @param {string | HTMLElement} content - The content to set.
     * @returns {Promise<void>}
     */
    async setContent(content = '') {
        if (!this._hasRendered) {
            return;
        }
        setTimeout(() => {
            if (!this.contentNode) return;
            this.contentNode.innerHTML = '';
            typeof content === 'string' && (this.contentNode.innerHTML = content);
            if (content instanceof HTMLElement) {
                this.contentNode.appendChild(content);
            }
        }, 0);
    }

    renderButton() {
        return !this.handler
            ? html`<button
                  zone="handler"
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
