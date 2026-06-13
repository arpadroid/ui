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
        this.bind('_onClick');
        /** @type {ButtonConfigType} */
        const config = {
            className: 'arpaButton',
            type: 'button',
            buttonClass: 'arpaButton__button',
            tooltipPosition: 'left'
        };

        return /** @type {ButtonConfigType} */ (super.getDefaultConfig(config));
    }

    /**
     * Returns the aria-label for the button, prioritizing the ariaLabel property, then label, then tooltip content.
     * @returns {string} The resolved aria-label for the button.
     */
    getAriaLabel() {
        if (this.hasContent('content')) return '';
        const { ariaLabel, label, tooltip } = this.getProperties('ariaLabel', 'label', 'tooltip');
        const aria = ariaLabel || label || tooltip || '';
        return this.resolveAriaLabel(aria) || '';
    }

    _preRender() {
        super._preRender();
        this._config.disabled = this.hasAttribute('disabled') || this.getProp('variant') === 'disabled';
        this.removeAttribute('disabled');
    }

    $renderTemplate() {
        return html`<button
            aria-label="{getAriaLabel()}"
            class="{buttonClass}"
            type="{type}"
            variant="{variant}"
            zone="{buttonZone}"
            disabled="{disabled}"
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

    _onClick() {
        const { '@onClick': onClick } = this._config;
        if (typeof onClick === 'function') {
            onClick(this);
        }
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        const button = this.querySelector('button');
        if (!button) return false;
        listen(button, 'click', this._onClick);
        /** @type {HTMLButtonElement | null} */
        this.button = button;
        this.handleVariant();
        return true;
    }

    handleVariant() {
        const variant = this.getProp('variant');
        const icon = this.templateNodes.icon || this.querySelector('arpa-icon');
        if (!icon) {
            if (['delete', 'delete-outlined'].includes(variant)) {
                this.setProp('icon', 'delete');
            } else if (['submit', 'submit-outlined'].includes(variant)) {
                this.setProp('icon', 'check_circle');
                this.button?.setAttribute('type', 'submit');
            }
        }
    }
}

defineCustomElement('arpa-button', Button);

export default Button;
