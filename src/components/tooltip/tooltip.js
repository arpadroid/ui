/**
 * @typedef {import('./tooltip.types.js').TooltipConfigType} TooltipConfigType
 */
import { defineCustomElement, resolveNode } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Tooltip extends ArpaElement {
    static get observedAttributes() {
        return ['text', 'handler', 'icon', 'label'];
    }

    initializeProperties() {
        super.initializeProperties();
        this.handler = this.getHandler();
        this.handler?.classList?.add('tooltip__button');
        return true;
    }

    getDefaultConfig() {
        /** @type {TooltipConfigType} */
        const config = {
            text: '',
            handler: '',
            icon: '',
            label: '',
            position: 'top'
        };
        return super.getDefaultConfig(config);
    }

    getHandler() {
        const handler = this.closest('button') || this.getProperty('handler');
        return (handler && resolveNode(handler)) || this.closest('button, a');
    }

    getPosition() {
        return this.getProperty('position')?.trim() ?? 'top';
    }

    render() {
        this.innerHTML = '';
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

    async _initializeNodes() {
        this.contentNode = this.querySelector('.tooltip__content');
        this._childNodes && this.contentNode?.append(...this._childNodes);
        this.button = this.querySelector('.tooltip__button');
        return true;
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
            ? html`<icon-button
                  zone="handler"
                  class="tooltip__button"
                  type="button"
                  variant="minimal"
                  icon="${this.getProperty('icon')}"
              ></icon-button>`
            : '';
    }
}

defineCustomElement('arpa-tooltip', Tooltip);

export default Tooltip;
