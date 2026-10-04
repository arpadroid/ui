/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('../../tooltip/tooltip').default} Tooltip
 * @typedef {import('../../icon/icon').default} Icon
 */
import { listen, defineCustomElement, getStringBetween } from '@arpadroid/tools';
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
        const { ariaLabel, label, tooltip } = this.getProperties('ariaLabel', 'label', 'tooltip');
        const textContent = this.textContent?.trim();
        let defaultVal = tooltip || '';
        if (this.hasContent('content') || textContent?.length > 0) {
            defaultVal = textContent;
        }
        return this.resolveAriaLabel(ariaLabel || label || defaultVal) || '';
    }

    _printAttributes() {
        super._printAttributes();
        this._config.disabled = this.hasAttribute('disabled') || this.getProp('variant') === 'disabled';
        this.removeAttribute('disabled');
    }

    $renderTemplate() {
        return html`<arpa-node
            name="button"
            tag="button"
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
        </arpa-node>`;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        await this.waitForArpaNodes();
        this.button = /** @type {HTMLButtonElement | null} */ (this.nodes.button);
        this.handleVariant();
        return true;
    }

    /**
     * Handles the button onClick event, invoking the configured onClick callback if it exists.
     * @param {Event} event
     */
    onClick(event) {
        const { onClick } = this._config;
        typeof onClick === 'function' && onClick(event, this);
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

    /**
     * Sets the tooltip text for the button.
     * @param {string} tooltip - The tooltip text to set.
     * @returns {Promise<boolean>}
     */
    setTooltip(tooltip) {
        return this.setProp('tooltip', tooltip);
    }

    /**
     * Sets the button icon.
     * @param {string} icon - The icon to set.
     * @returns {Promise<boolean>}
     */
    setIcon(icon) {
        return this.setProp('icon', icon);
    }

    /**
     * Sets the button label.
     * @param {string} label - The label to set.
     * @returns {Promise<boolean>}
     */
    async setLabel(label) {
        await this.promise;
        const result = await this.setContent(label);
        this.button?.setAttribute('aria-label', this.resolveAriaLabel(label));
        return result;
    }
}

defineCustomElement('arpa-button', Button);

export default Button;
