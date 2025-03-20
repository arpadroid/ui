/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 */
import { appendNodes, attrString, classNames, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement';

const html = String.raw;
class Button extends ArpaElement {
    /**
     * Returns the default configuration for the button.
     * @returns {ButtonConfigType}
     */
    getDefaultConfig() {
        return {
            type: 'button'
        };
    }

    _preRender() {
        super._preRender();
        this.variant = this.getProperty('variant');
        this.disabled = this.hasAttribute('disabled');
        this.removeAttribute('disabled');
        this.removeAttribute('variant');
    }

    _getTemplate() {
        return html`<button
            ${attrString({
                ariaLabel: this.getProperty('label-text'),
                class: 'arpaButton',
                type: this.getProperty('type'),
                variant: this.variant,
                disabled: this.disabled
            })}
        >
            {icon}{content}{iconRight}
        </button>`;
    }

    getTemplateVars() {
        return {
            icon: this.renderIcon('icon', 'button__lhsIcon'),
            content: this.renderContent(),
            iconRight: this.renderIcon('icon-right', 'button__rhsIcon')
        };
    }

    renderContent() {
        const content = this.getProperty('content') || '';
        return html`<span class="button__content">${content}</span>`;
    }

    renderIcon(iconProp = 'icon', className = '') {
        const icon = this.getAttribute(iconProp);
        return icon
            ? html`<arpa-icon className="${classNames('button__icon', className)}">${icon}</arpa-icon>`
            : '';
    }

    async _initializeNodes() {
        super._initializeNodes();
        this.button = this.querySelector('button');
        await this.promise;
        this.contentNode = this.querySelector('.button__content');
        this.contentNode && appendNodes(this.contentNode, this._childNodes);
    }
}

defineCustomElement('arpa-button', Button);

export default Button;
