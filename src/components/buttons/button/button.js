/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('../../tooltip/tooltip').default} Tooltip
 * @typedef {import('../../icon/icon').default} Icon
 */
import { listen, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../../core/arpaElement/arpaElement';

const html = String.raw;
class Button extends ArpaElement {
    /** @type {ButtonConfigType} */
    _config = this._config;

    /**
     * Returns the default configuration for the button.
     * @returns {ButtonConfigType}
     */
    getDefaultConfig() {
        /** @type {ButtonConfigType} */
        const config = {
            className: 'arpaButton',
            type: 'button',
            buttonClass: 'arpaButton__button',
            tooltipPosition: 'left',
            eventHandlerSelector: 'button'
        };

        return /** @type {ButtonConfigType} */ (super.getDefaultConfig(config));
    }

    /**
     * Returns the aria-label for the button, prioritizing the ariaLabel property, then label, then tooltip content.
     * @returns {string} The resolved aria-label for the button.
     */
    getAriaLabel() {
        if (this.hasContent('content') || this.textContent.trim()?.length) return '';
        const { ariaLabel, label, tooltip } = this.getProperties('ariaLabel', 'label', 'tooltip');
        const aria = ariaLabel || label || tooltip || '';
        return this.resolveAriaLabel(aria) || '';
    }

    async _preRender() {
        super._preRender();
        this._config.disabled = this.hasAttribute('disabled') || this.getProp('variant') === 'disabled';
        this.removeAttribute('disabled');
        return true;
    }

    $renderTemplate() {
        return html`<button
            aria-label="{getAriaLabel()}"
            class="{buttonClass}"
            type="{type}"
            variant="{variant}"
            zone="{buttonZone}"
            disabled="{disabled}"
            on-click="{onClick}"
        >
            <arpa-node tag="arpa-icon" name="icon"></arpa-node>
            <arpa-node tag="span" is-content name="content">{label}</arpa-node>
            <arpa-node tag="arpa-icon" name="rhsIcon"></arpa-node>
            <arpa-node
                tag="arpa-tooltip"
                name="tooltip"
                zone-target=".tooltip__content"
                position="{tooltipPosition}"
            ></arpa-node>
        </button>`;
    }

    /**
     * Handles the button onClick event, invoking the configured onClick callback if it exists.
     * @param {Event} event
     */
    onClick(event) {
        const { onClick } = this._config;
        typeof onClick === 'function' && onClick(event, this);
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        const button = this.querySelector('button');
        /** @type {HTMLButtonElement | null} */
        this.button = button;
        const { onClick } = this._config;
        if (typeof onClick === 'function') {
            listen(button, 'click', event => onClick(event, this));
        }
        this.handleVariant();
        return true;
    }

    handleVariant() {
        const variant = this.getProp('variant');
        const icon = this.nodes.icon || this.querySelector('arpa-icon');
        if (!icon) {
            if (['delete', 'delete-outlined'].includes(variant)) {
                this.setProp('icon', 'delete');
            } else if (['submit', 'submit-outlined'].includes(variant)) {
                this.setProp('icon', 'check_circle');
                this.button?.setAttribute('type', 'submit');
            }
        }
    }

    async focus() {
        await this.promise;
        this.button?.focus();
    }

    async click() {
        await this.promise;
        this.button?.click();
    }
}

defineCustomElement('arpa-button', Button);

export default Button;
